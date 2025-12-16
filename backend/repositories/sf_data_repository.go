package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"citystreetdata/repositories/types"
	"citystreetdata/utils"

	"github.com/mattn/go-sqlite3"
)

type SfDataRepository struct {
	logger *slog.Logger
	db     *sql.DB
}

func NewSFDataRepository(logger *slog.Logger) (*SfDataRepository, error) {
	sqlFileName := os.Getenv("SQLITE_DB")
	sqlFile := fmt.Sprintf("/%s", sqlFileName)

	sql.Register("sqlite_with_extensions", &sqlite3.SQLiteDriver{
		Extensions: []string{
			"mod_spatialite",
		},
	})

	db, err := sql.Open("sqlite_with_extensions", sqlFile)
	if err != nil {
		logger.Error("error parsing config", "error", err)
		return nil, err
	}
	db.Exec("SELECT SetDecimalPrecision(15);")
	// var result string
	// db.QueryRow(`SELECT sqlite_version();`).Scan(&result)
	// fmt.Println("result:", result)

	return &SfDataRepository{
		logger: logger,
		db:     db,
	}, nil
}

func (sfr *SfDataRepository) GetSpeedLimitForStreets(ctx context.Context, params *types.GetFeatureForStreetParams) ([]types.StreetFeature, error) {
	if params == nil || len(params.CNNs) == 0 {
		return nil, fmt.Errorf("invalid params, must provide cnns")
	}

	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	queryString := fmt.Sprintf(
		`
		WITH selected_streets AS (
			SELECT cnn FROM sf_streets_and_intersections
			WHERE cnn IN (%s)
		)
		SELECT
			ss.cnn,
			speed_limits.completed_at,
			CAST(CASE WHEN use_defacto_limit = false THEN speed_limits.value ELSE 25 END AS TEXT)
		FROM
			(
				SELECT
					*
				FROM
					selected_streets
			) as ss
			JOIN
			(
				SELECT
					cnn, completed_at, value, use_defacto_limit
				FROM sf_street_feature_speed_limit
				WHERE
					completed_at BETWEEN %d AND %d
			) as speed_limits ON (ss.cnn = speed_limits.cnn)
		ORDER BY speed_limits.completed_at
	`,
		utils.ArrayToSqlStringArray(params.CNNs, nil),
		params.StartTime.Unix(),
		params.EndTime.Unix(),
	)

	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	streetFeatures := []types.StreetFeature{}
	for row.Next() {
		var streetFeature = types.StreetFeature{FeatureType: types.SpeedLimit}
		var completedAtInt int64

		err := row.Scan(&streetFeature.CNN, &completedAtInt, &streetFeature.Value)
		if err != nil {
			return nil, err
		}
		streetFeature.CompletedAt = time.Unix(completedAtInt, 0)
		streetFeatures = append(streetFeatures, streetFeature)
	}

	return streetFeatures, nil
}

func (sfr *SfDataRepository) GetTrafficCrashesForStreets(ctx context.Context, params *types.GetTrafficForStreetsParams) ([]types.CrashEvents, error) {
	if params == nil || len(params.CNNs) == 0 {
		return nil, fmt.Errorf("invalid params, must provide cnns")
	}

	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	queryString := fmt.Sprintf(
		`
		WITH selected_streets AS (
			SELECT
				cnn, f_node_cnn, t_node_cnn
			FROM
				sf_streets_and_intersections
			WHERE
				cnn IN (%s)
		),
		unique_intersections AS (
			SELECT
				intersection_cnn as cnn
			FROM (
				SELECT
					DISTINCT(f_node_cnn) as intersection_cnn
				FROM
					selected_streets
				UNION
				SELECT
					DISTINCT(t_node_cnn) as intersection_cnn
				FROM
					selected_streets
			)
		),
		unique_streets AS (
			SELECT
				DISTINCT(cnn) as cnn
			FROM
				selected_streets
		),
		selected_intersections_and_streets AS (
			SELECT
				*
			FROM
			(
				SELECT * from unique_intersections
				UNION
				SELECT * from unique_streets
			)
			ORDER BY 1
		)
		SELECT
			sis.cnn,
			crashes.occured_at,
			crashes.collision_severity,
			crashes.collision_type,
			crashes.number_killed,
			crashes.number_injured,
			crashes.crash_classification
		FROM
			(
				SELECT
					*
				FROM
				selected_intersections_and_streets
			) as sis
			JOIN
			(
				SELECT
					cnn, 
					occured_at, 
					collision_severity, 
					collision_type, 
					number_killed, 
					number_injured,
					metadata->>'dph_col_grp' as crash_classification
				FROM sf_events_traffic_crashes
				WHERE
					occured_at BETWEEN %d AND %d
			) as crashes ON (sis.cnn = crashes.cnn)
		ORDER BY crashes.occured_at
	`,
		utils.ArrayToSqlStringArray(params.CNNs, nil),
		params.StartTime.Unix(),
		params.EndTime.Unix(),
	)

	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	crashesArr := []types.CrashEvents{}
	for row.Next() {
		var crashEvent = types.CrashEvents{}
		var occuredAtInt int64
		var occuredAtTime time.Time

		err := row.Scan(
			&crashEvent.CNN,
			&occuredAtInt,
			&crashEvent.CollisionSeverity,
			&crashEvent.CollisionType,
			&crashEvent.NumberKilled,
			&crashEvent.NumberInjured,
			&crashEvent.CrashClassification,
		)
		if err != nil {
			return nil, err
		}

		if occuredAtInt > 0 {
			occuredAtTime = time.Unix(occuredAtInt, 0)
			crashEvent.OccuredAt = &occuredAtTime

		}

		crashesArr = append(crashesArr, crashEvent)
	}
	return crashesArr, nil
}

func (sfr *SfDataRepository) GetSegmentsWithinPolygon(ctx context.Context, params *types.GetSegmentsWithinPolygonParams) ([]types.StreetSegment, error) {
	if params.Polygon == nil || params.Polygon.Area() == 0 {
		return nil, fmt.Errorf("invalid polygon: %v", params.Polygon)
	}

	classcodeFilter := ""
	if params.Filters != nil && params.Filters.ClassCodes != nil && len(params.Filters.ClassCodes) > 0 {
		strArr := []string{}
		for _, v := range params.Filters.ClassCodes {
			strArr = append(strArr, fmt.Sprintf("'%v'", v.ToString()))
		}
		classcodeFilter = fmt.Sprintf("JOIN (SELECT cnn FROM sf_street_feature_classcode WHERE value in (%s)) as cc ON si.cnn = cc.cnn", strings.Join(strArr, ","))
	}

	queryStr := fmt.Sprintf(`
	SELECT
		si.cnn,
		TRIM(si.street || ' ' || COALESCE(si.st_type, '')) as street,
		ST_AsBinary(si.line) as line
	FROM
		sf_streets_and_intersections as si
		%s
	WHERE
		si.active = true
		AND (ST_WITHIN(si.line, '$1') OR ST_INTERSECTS(si.line, '$2'))
	`, classcodeFilter)

	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	rows, err := conn.QueryContext(ctx, queryStr, params.Polygon, params.Polygon)
	if err != nil {
		sfr.logger.Error("could not execute query", "error", err)
		return nil, err
	}
	defer rows.Close()

	segmentArr := []types.StreetSegment{}
	for rows.Next() {
		var segment = types.StreetSegment{}

		err := rows.Scan(&segment.CNN, &segment.StreetName, &segment.Line)
		if err != nil {
			sfr.logger.Error("could not parse row", "error", err)
			return nil, err
		}
		segmentArr = append(segmentArr, segment)
	}

	return segmentArr, nil
}
