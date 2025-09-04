package repositories

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/twpayne/go-geos"
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

// A Waypoint is a location with an identifier and a name.
type Waypoint struct {
	ID       int
	Name     string
	Geometry *geos.Geom
}


func (sfr *SfDataRepository) GetSegmentsWithinPolygon(ctx context.Context) ([]Waypoint, error) {
	dbpool, err := pgxpool.NewWithConfig(ctx, sfr.config)
	if err != nil {
		return nil, err
	}
	defer dbpool.Close()

	return nil, nil
}