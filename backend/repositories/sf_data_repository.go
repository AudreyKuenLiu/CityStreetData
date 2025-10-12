package repositories

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"strings"

	"citystreetdata/repositories/types"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SfDataRepository struct {
	config *pgxpool.Config
	logger *slog.Logger
}

func NewSFDataRepository(logger *slog.Logger) (*SfDataRepository, error) {
	connString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=disable",
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGDATABASE"),
	)

	//setup config
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		logger.Error("error parsing config", "error", err)
		return nil, err
	}

	return &SfDataRepository{
		config: config,
		logger: logger,
	}, nil
}

func (sfr *SfDataRepository) GetTrafficCrashesForStreets(ctx context.Context, params *types.GetTrafficForStreetsParams) ([]types.CrashEvents, error) {
	if params == nil || len(params.CNNs) == 0 {
		return nil, fmt.Errorf("invalid params, must provide cnns")
	}

	dbpool, err := pgxpool.NewWithConfig(ctx, sfr.config)
	if err != nil {
		return nil, err
	}

	defer dbpool.Close()
	row, err := dbpool.Query(ctx, `
	WITH selected_streets AS (
		SELECT
			cnn, f_node_cnn, t_node_cnn
		FROM
			sf_streets_and_intersections
		WHERE 
			cnn in ($1)
	),
	unique_intersections AS (
		SELECT
			intersection_cnn as cnn 
		FROM (
			(
			SELECT 
				DISTINCT(f_node_cnn) as intersection_cnn 
			FROM
				selected_streets
			)
			UNION
			(
			SELECT
				DISTINCT(t_node_cnn) as intersection_cnn
			FROM
				selected_streets
			)
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
			(SELECT * from unique_intersections)
			UNION
			(SELECT * from unique_streets)
		)
		ORDER BY 1
	)
	SELECT
		sis.cnn, 
		crashes.occured_at, 
		crashes.collision_severity, 
		crashes.collision_type, 
		crashes.number_killed, 
		crashes.number_injured
	FROM
		(
			SELECT
				*
			FROM
			selected_intersections_and_streets
		) as sis
		LEFT JOIN
		(
			SELECT
				cnn, occured_at, collision_severity, collision_type, number_killed, number_injured 
			FROM sf_events_traffic_crashes 
			WHERE
				occured_at BETWEEN $2 AND $3
		) as crashes
		ON (sis.cnn = crashes.cnn)
	ORDER BY crashes.occured_at`, params.CNNs, params.StartTime, params.EndTime)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	crashesArr := []types.CrashEvents{}
	for row.Next() {
		var crashEvent = types.CrashEvents{}

		err := row.Scan(&crashEvent.CNN, &crashEvent.OccuredAt, &crashEvent.CollisionSeverity, &crashEvent.CollisionType, &crashEvent.NumberKilled, &crashEvent.NumberInjured)
		if err != nil {
			return nil, err
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
		setStr := fmt.Sprintf("(%s)", strings.Join(strArr, ","))
		classcodeFilter = fmt.Sprintf("JOIN (SELECT cnn FROM sf_street_feature_classcode WHERE value in %s) as cc ON si.cnn = cc.cnn", setStr)
	}

	queryStr := fmt.Sprintf(`
	SELECT 
		si.cnn,
		TRIM(si.street || ' ' || COALESCE(si.st_type, '')) as street, 
		si.line
	FROM 
		sf_streets_and_intersections as si 
		%s
	WHERE
		si.active = 'true'
		AND
		(ST_WITHIN(si.line, $1) OR ST_INTERSECTS(si.line, $2))
	`, classcodeFilter)

	dbpool, err := pgxpool.NewWithConfig(ctx, sfr.config)
	if err != nil {
		return nil, err
	}
	defer dbpool.Close()
	row, err := dbpool.Query(ctx, queryStr, params.Polygon, params.Polygon)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	segmentArr := []types.StreetSegment{}
	for row.Next() {
		var segment = types.StreetSegment{}

		err := row.Scan(&segment.CNN, &segment.StreetName, &segment.Line)
		if err != nil {
			return nil, err
		}
		segmentArr = append(segmentArr, segment)
	}

	return segmentArr, nil
}
