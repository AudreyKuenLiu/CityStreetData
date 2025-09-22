package controllers

import (
	repo "citystreetdata/repositories"
	"context"
	"fmt"
	"log/slog"

	"github.com/twpayne/go-geos"
	"github.com/twpayne/go-geos/geometry"
)

type SfDataController struct {
	sfDataRepository *repo.SfDataRepository
	logger *slog.Logger
}

func NewSFDataController(logger *slog.Logger) (*SfDataController, error) {

	sfDataRepository, err := repo.NewSFDataRepository(logger)
	if err != nil {
		logger.Error("error creating SFDataRepository", "error", err)
		return nil, err
	}

	return &SfDataController{
		sfDataRepository: sfDataRepository,
		logger: logger,
	}, nil
}


type GetSegmentsForViewportParams struct {
	NEPoint []float64
	SWPoint []float64
	ZoomLevel float64
}

func (sfc *SfDataController) GetSegmentsForViewport(ctx context.Context, params *GetSegmentsForViewportParams) ([]repo.StreetSegment, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetSegmentsForViewport")
	}
	WNPoint := []float64{params.SWPoint[1], params.NEPoint[0]}
	ESPoint := []float64{params.NEPoint[1], params.SWPoint[0]}
	ENPoint := []float64{params.NEPoint[1], params.NEPoint[0]}
	WSPoint := []float64{params.SWPoint[1], params.SWPoint[0]}

	polygon := geometry.NewGeometry(geos.NewPolygon([][][]float64{{ENPoint, ESPoint, WSPoint, WNPoint, ENPoint}})).SetSRID(4326)

	ret, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx, &repo.GetSegmentsWithinPolygonParams{
		Polygon: polygon,
	})
	if err != nil {
		return nil, err
	}
	return ret, nil
}
