package controllers

import (
	"citystreetdata/controllers/types"
	repo "citystreetdata/repositories"
	"context"
	"fmt"
	"log/slog"
)

type SfDataController struct {
	sfDataRepository *repo.SfDataRepository
	logger           *slog.Logger
}

func NewSFDataController(logger *slog.Logger) (*SfDataController, error) {

	sfDataRepository, err := repo.NewSFDataRepository(logger)
	if err != nil {
		logger.Error("error creating SFDataRepository", "error", err)
		return nil, err
	}

	return &SfDataController{
		sfDataRepository: sfDataRepository,
		logger:           logger,
	}, nil
}

func (sfc *SfDataController) GetSegmentsForViewport(ctx context.Context, params *types.GetSegmentsForViewportParams) ([]repo.StreetSegment, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetSegmentsForViewport")
	}
	polygon := params.Rectangle.ToPolygon()

	ret, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx, &repo.GetSegmentsWithinPolygonParams{
		Polygon: polygon,
		Filters: params.Filters,
	})
	if err != nil {
		return nil, err
	}
	return ret, nil
}

func (sfc *SfDataController) GetSegmentsForGrid(ctx context.Context, params *types.GetSegmentsForGridParams) (*types.GetSegmentsForGridReturn, error) {
	if params == nil || params.Grid == nil {
		return nil, fmt.Errorf("no params passed to GetSegmentsForGrid")
	}

	streetSegmentGrid := [][][]repo.StreetSegment{}
	grid := params.Grid
	for _, row := range *grid {
		streetSegmentGridRow := [][]repo.StreetSegment{}
		for _, cell := range row {
			streetSegments, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx, &repo.GetSegmentsWithinPolygonParams{
				Polygon: cell.ToPolygon(),
				Filters: params.Filters,
			})
			streetSegmentGridRow = append(streetSegmentGridRow, streetSegments)
			if err != nil {
				return nil, err
			}

		}
		streetSegmentGrid = append(streetSegmentGrid, streetSegmentGridRow)
	}

	return &types.GetSegmentsForGridReturn{
		StreetSegmentGrid: &streetSegmentGrid,
	}, nil
}
