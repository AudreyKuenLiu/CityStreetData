package controllers

import (
	repo "citystreetdata/repositories"
	"context"
	"fmt"
	"log/slog"
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
	NEPoint [2]float64
	SWPoint [2]float64
	ZoomLevel float64
}

func (sfc *SfDataController) GetSegmentsForViewport(ctx context.Context, params *GetSegmentsForViewportParams) ([]repo.Waypoint, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetSegmentsForViewport")
	}

	ret, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx)
	if err != nil {
		return nil, err
	}
	return ret, nil
}
