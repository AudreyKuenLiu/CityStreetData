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

func (sfr *SfDataRepository) GetEventsForCnn(ctx context.Context, params *types.GetEventsForCnnParams) error {
	return nil
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
