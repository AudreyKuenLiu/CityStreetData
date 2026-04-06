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
	db.Exec("PRAGMA journal_mode = WAL;")

	return &SfDataRepository{
		logger: logger,
		db:     db,
	}, nil
}

func (sfr *SfDataRepository) GetAllCrashEvents(ctx context.Context) ([]types.CrashEvents, error) {

	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	queryString := `
		SELECT
			cnn,
			occured_at,
			collision_severity,
			collision_type,
			number_killed,
			number_injured,
			metadata->>'dph_col_grp' as crash_classification,
			ST_AsBinary(MakePoint(metadata->>'tb_longitude', metadata->>'tb_latitude', 4326)) as point
		FROM sf_events_traffic_crashes
		ORDER BY occured_at
	`

	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	crashesArr := []types.CrashEvents{}
	for row.Next() {
		var crashEvent = types.CrashEvents{}
		var occuredAtTime time.Time

		err := row.Scan(
			&crashEvent.CNN,
			&crashEvent.OccuredAtUnix,
			&crashEvent.CollisionSeverity,
			&crashEvent.CollisionType,
			&crashEvent.NumberKilled,
			&crashEvent.NumberInjured,
			&crashEvent.CrashClassification,
			&crashEvent.Point,
		)
		if err != nil {
			return nil, err
		}

		if crashEvent.OccuredAtUnix > 0 {
			occuredAtTime = time.Unix(crashEvent.OccuredAtUnix, 0)
			crashEvent.OccuredAt = occuredAtTime
		}

		crashesArr = append(crashesArr, crashEvent)
	}
	return crashesArr, nil
}

func (sfr *SfDataRepository) GetSpeedLimits(ctx context.Context) ([]types.StreetFeature, error) {
	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	queryString := `
		WITH most_speed_limit AS (
			SELECT *
			FROM (
				SELECT 
					cnn,
					completed_at,
					CASE WHEN use_defacto_limit THEN 25 ELSE value END as value,
					metadata,
					ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
				FROM
					sf_street_feature_speed_limit
				WHERE
					removed_at is NULL
					AND
					use_defacto_limit != true AND value != 25
			)
			WHERE
				rn = 1
		)
		SELECT
			si.street as name,
			sl.value,
			sl.metadata as properties,
			si.cnn,
			sl.completed_at,
			ST_AsBinary(si.line) as geometry
		FROM
			most_speed_limit as sl
			LEFT JOIN
			sf_streets_and_intersections si on sl.cnn = si.cnn
	`
	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	streetFeatures := []types.StreetFeature{}
	for row.Next() {
		var streetFeature = types.StreetFeature{
			FeatureType: types.SpeedLimit,
		}
		var completedAtInt int64

		err := row.Scan(
			&streetFeature.Name,
			&streetFeature.Value,
			&streetFeature.Properties,
			&streetFeature.CNN,
			&completedAtInt,
			&streetFeature.Geometry,
		)
		if err != nil {
			return nil, err
		}
		streetFeature.CompletedAt = time.Unix(completedAtInt, 0)
		streetFeatures = append(streetFeatures, streetFeature)
	}

	return streetFeatures, nil

}

func (sfr *SfDataRepository) GetSchoolZones(ctx context.Context) ([]types.StreetFeature, error) {
	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	queryString := `
		WITH most_recent_school_zone AS (
			SELECT *
			FROM (
				SELECT 
					cnn,
					completed_at,
					value,
					metadata,
					ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
				FROM
					sf_street_feature_school_zone
				WHERE
					is_active = true
			)
			WHERE
				rn = 1
		)
		SELECT
			si.street as name,
			sz.value,
			sz.metadata as properties,
			si.cnn,
			sz.completed_at,
			ST_AsBinary(si.line) as geometry
		FROM
			most_recent_school_zone as sz
			LEFT JOIN
			sf_streets_and_intersections si on sz.cnn = si.cnn
	`
	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	streetFeatures := []types.StreetFeature{}
	for row.Next() {
		var streetFeature = types.StreetFeature{
			FeatureType: types.SpeedLimit,
		}
		var completedAtInt int64

		err := row.Scan(
			&streetFeature.Name,
			&streetFeature.Value,
			&streetFeature.Properties,
			&streetFeature.CNN,
			&completedAtInt,
			&streetFeature.Geometry,
		)
		if err != nil {
			return nil, err
		}
		streetFeature.CompletedAt = time.Unix(completedAtInt, 0)
		streetFeatures = append(streetFeatures, streetFeature)
	}

	return streetFeatures, nil

}

func (sfr *SfDataRepository) GetSlowStreetFeatures(ctx context.Context, params *types.GetSlowStreetParams) ([]types.StreetFeature, error) {
	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	queryString := `
		WITH most_recent_slow_street AS (
			SELECT *
			FROM (
				SELECT 
					cnn,
					completed_at,
					value,
					metadata,
					ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
				FROM
					sf_street_feature_slow_street
			)
			WHERE
				rn = 1
		)
		SELECT
			si.street as name,
			ss.value,
			ss.metadata as properties,
			si.cnn,
			ss.completed_at,
			ST_AsBinary(si.line) as geometry
		FROM
			most_recent_slow_street as ss
			LEFT JOIN
			sf_streets_and_intersections si on ss.cnn = si.cnn
	`
	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	streetFeatures := []types.StreetFeature{}
	for row.Next() {
		var streetFeature = types.StreetFeature{
			FeatureType: types.SlowStreet,
		}
		var completedAtInt int64

		err := row.Scan(
			&streetFeature.Name,
			&streetFeature.Value,
			&streetFeature.Properties,
			&streetFeature.CNN,
			&completedAtInt,
			&streetFeature.Geometry,
		)
		if err != nil {
			return nil, err
		}
		streetFeature.CompletedAt = time.Unix(completedAtInt, 0)
		streetFeatures = append(streetFeatures, streetFeature)
	}

	return streetFeatures, nil
}

func createTempTable(ctx context.Context, conn *sql.Conn, tableName string, columnName string, values []int) error {
	leftToken := "("
	rightToken := ")"
	sqlValues := utils.ArrayToSqlStringArray(values, &leftToken, &rightToken)
	if _, err := conn.ExecContext(ctx, fmt.Sprintf("CREATE TEMP Table %s (%s integer primary key);", tableName, columnName)); err != nil {
		return err
	}

	if _, err := conn.ExecContext(ctx, fmt.Sprintf("INSERT INTO %s (%s) VALUES %s", tableName, columnName, sqlValues)); err != nil {
		return err
	}
	return nil
}

func createTempCnnTable(ctx context.Context, conn *sql.Conn, cnns []int) error {
	if err := createTempTable(ctx, conn, "selected_cnns", "cnn", cnns); err != nil {
		return err
	}

	if _, err := conn.ExecContext(ctx, `INSERT INTO selected_cnns (cnn)
	SELECT cnns
	FROM
		(select
			DISTINCT(f_node_cnn) as cnns
		FROM
			sf_streets_and_intersections sfsi
			JOIN
			selected_cnns
			ON sfsi.cnn = selected_cnns.cnn
		UNION
		select
			DISTINCT(t_node_cnn) as cnns
		FROM
			sf_streets_and_intersections sfsi
			JOIN
			selected_cnns
			ON sfsi.cnn = selected_cnns.cnn
		);`); err != nil {
		return err
	}
	return nil
}

func (sfr *SfDataRepository) GetTrafficStatsForStreets(ctx context.Context, params *types.GetTrafficStatsForStreetsParams) ([]types.TimeSegmentCrashStats, error) {
	if params == nil || len(params.CNNs) == 0 {
		return nil, fmt.Errorf("invalid params, must provide cnns")
	}

	conn, err := sfr.db.Conn(ctx)
	if err != nil {
		sfr.logger.Error("could not establish connection")
		return nil, err
	}

	if err = createTempCnnTable(ctx, conn, params.CNNs); err != nil {
		return nil, err
	}

	timeSegmentArr := []int{}
	for _, val := range params.TimeSegments {
		timeSegmentArr = append(timeSegmentArr, int(val.Unix()))
	}
	if err = createTempTable(ctx, conn, "selected_time_segments", "time_segment", timeSegmentArr); err != nil {
		return nil, err
	}

	queryString := `
	WITH time_segments AS (
	SELECT
		time_segment,
		CASE WHEN LEAD(time_segment) OVER (ORDER BY time_segment) is NOT NULL 
		THEN LEAD(time_segment) OVER (ORDER BY time_segment) 
		ELSE 9e999 END AS next_time_segment
	FROM
		selected_time_segments
	)
	SELECT
		ts.time_segment,
		collision_severity,
		collision_type,
		crash_classification,
		SUM(number_injured) number_injured,
		SUM(number_killed) number_killed,
		COUNT(*) number_of_crashes
	FROM
		selected_cnns as sis
		JOIN
		(
		SELECT
			cnn, 
			occured_at, 
			collision_severity, 
			collision_type, 
			metadata->>'dph_col_grp' as crash_classification,
			number_killed, 
			number_injured
		FROM sf_events_traffic_crashes
		) as crashes ON (sis.cnn = crashes.cnn)
		JOIN
		time_segments ts ON (crashes.occured_at >= ts.time_segment AND crashes.occured_at < ts.next_time_segment)
		GROUP BY
		1,2,3,4`

	row, err := conn.QueryContext(ctx, queryString)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	timeSegementCrashStats := []types.TimeSegmentCrashStats{}
	for row.Next() {
		var crashStat = types.TimeSegmentCrashStats{}
		var timeSegmentInt int64
		var timeSegmentTime time.Time

		err := row.Scan(
			&timeSegmentInt,
			&crashStat.CollisionSeverity,
			&crashStat.CollisionType,
			&crashStat.CrashClassification,
			&crashStat.NumberInjured,
			&crashStat.NumberKilled,
			&crashStat.NumberOfCrashes,
		)
		if err != nil {
			return nil, err
		}

		if timeSegmentInt > 0 {
			timeSegmentTime = time.Unix(timeSegmentInt, 0)
			crashStat.TimeSegment = timeSegmentTime
		}

		timeSegementCrashStats = append(timeSegementCrashStats, crashStat)
	}
	return timeSegementCrashStats, nil
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

	if err = createTempCnnTable(ctx, conn, params.CNNs); err != nil {
		return nil, err
	}

	queryString := fmt.Sprintf(
		`
		SELECT
			sis.cnn,
			crashes.occured_at,
			crashes.collision_severity,
			crashes.collision_type,
			crashes.number_killed,
			crashes.number_injured,
			crashes.crash_classification,
			ST_AsBinary(crashes.point) as point
		FROM
			selected_cnns as sis
			JOIN
			(
				SELECT
					cnn,
					occured_at,
					collision_severity,
					collision_type,
					number_killed,
					number_injured,
					metadata->>'dph_col_grp' as crash_classification,
					MakePoint(metadata->>'tb_longitude', metadata->>'tb_latitude', 4326) as point
				FROM sf_events_traffic_crashes
				WHERE
					occured_at BETWEEN %d AND %d
			) as crashes ON (sis.cnn = crashes.cnn)
		ORDER BY crashes.occured_at
	`,
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
		var occuredAtTime time.Time

		err := row.Scan(
			&crashEvent.CNN,
			&crashEvent.OccuredAtUnix,
			&crashEvent.CollisionSeverity,
			&crashEvent.CollisionType,
			&crashEvent.NumberKilled,
			&crashEvent.NumberInjured,
			&crashEvent.CrashClassification,
			&crashEvent.Point,
		)
		if err != nil {
			return nil, err
		}

		if crashEvent.OccuredAtUnix > 0 {
			occuredAtTime = time.Unix(crashEvent.OccuredAtUnix, 0)
			crashEvent.OccuredAt = occuredAtTime

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
		si.f_node_cnn,
		si.t_node_cnn,
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

		err := rows.Scan(&segment.CNN, &segment.FNodeCNN, &segment.TNodeCNN, &segment.StreetName, &segment.Line)
		if err != nil {
			sfr.logger.Error("could not parse row", "error", err)
			return nil, err
		}
		segmentArr = append(segmentArr, segment)
	}

	return segmentArr, nil
}
