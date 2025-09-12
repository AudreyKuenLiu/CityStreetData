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
}

func NewSFDataController(logger *slog.Logger) (*SfDataController, error) {

	sfDataRepository, err := repo.NewSFDataRepository(logger)
	if err != nil {
		logger.Error("error creating SFDataRepository", "error", err)
		return nil, err
	}

	return &SfDataController{
		sfDataRepository: sfDataRepository,
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
	NWPoint := []float64{params.NEPoint[0], params.SWPoint[1]}
	SEPoint := []float64{params.SWPoint[0], params.NEPoint[1]}
	polygon := geometry.NewGeometry(geos.NewPolygon([][][]float64{{params.NEPoint, NWPoint, params.SWPoint, SEPoint, params.NEPoint}})).SetSRID(4326)

	ret, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx, &repo.GetSegmentsWithinPolygonParams{
		Polygon: polygon,
	})
	if err != nil {
		return nil, err
	}
	return ret, nil
}
