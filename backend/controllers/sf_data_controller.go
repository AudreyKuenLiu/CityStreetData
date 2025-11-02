package controllers

import (
	"citystreetdata/controllers/types"
	rTypes "citystreetdata/repositories/types"
	dtypes "citystreetdata/types"
	"time"

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

func (sfc *SfDataController) GetCrashDataForStreets(ctx context.Context, params *types.GetCrashDataForStreetsParams) (*types.GetCrashDataForStreetsReturn, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetCrashDataForStreets")
	}

	crashes, err := sfc.sfDataRepository.GetTrafficCrashesForStreets(ctx, &rTypes.GetTrafficForStreetsParams{
		CNNs:      params.CNNs,
		StartTime: params.StartTime,
		EndTime:   params.EndTime,
	})
	if err != nil {
		return nil, err
	}

	//initilize segments
	dateToCrashesGroupMap := map[int64]types.CrashStats{}
	timeSlices := []int64{}
	startTime := params.StartTime
	endTime := params.EndTime
	itTime := startTime

	for itTime.Unix() < endTime.Unix() {
		dateToCrashesGroupMap[itTime.Unix()] = types.CrashStats{}
		timeSlices = append(timeSlices, itTime.Unix())
		itTime = itTime.Add(time.Duration(params.SegmentSize.SegmentInSeconds()) * time.Second)
	}

	findClosestTime := func(occuredTime int64) int64 {
		index := (occuredTime - startTime.Unix()) / params.SegmentSize.SegmentInSeconds()
		return timeSlices[index]
	}

	for _, crashData := range crashes {
		closestTime := findClosestTime(crashData.OccuredAt.Unix())
		crashStats := dateToCrashesGroupMap[closestTime]
		if crashData.CollisionSeverity != nil && *crashData.CollisionSeverity == dtypes.Severe {
			crashStats.NumberSeriouslyInjured += crashData.NumberInjured
		}
		crashStats.NumberInjured += crashData.NumberInjured
		crashStats.NumberKilled += crashData.NumberKilled
		crashStats.NumberOfCrashes += 1
		dateToCrashesGroupMap[closestTime] = crashStats
	}

	sfc.logger.Info("this is the return map", "map", dateToCrashesGroupMap)

	return &types.GetCrashDataForStreetsReturn{
		Data: dateToCrashesGroupMap,
	}, nil
}

func (sfc *SfDataController) GetCrashesForStreets(ctx context.Context, params *types.GetCrashesForStreetsParams) ([]rTypes.CrashEvents, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetCrashesForStreets")
	}

	return sfc.sfDataRepository.GetTrafficCrashesForStreets(ctx, &rTypes.GetTrafficForStreetsParams{
		CNNs:      params.CNNs,
		StartTime: params.StartTime,
		EndTime:   params.EndTime,
	})

}

func (sfc *SfDataController) GetSegmentsForViewport(ctx context.Context, params *types.GetSegmentsForViewportParams) ([]rTypes.StreetSegment, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetSegmentsForViewport")
	}
	polygon := params.Rectangle.ToPolygon()

	ret, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx, &rTypes.GetSegmentsWithinPolygonParams{
		Polygon: polygon,
		Filters: params.Filters,
	})

	return ret, err
}

func (sfc *SfDataController) GetSegmentsForGrid(ctx context.Context, params *types.GetSegmentsForGridParams) (*types.GetSegmentsForGridReturn, error) {
	if params == nil || params.Grid == nil {
		return nil, fmt.Errorf("no params passed to GetSegmentsForGrid")
	}

	streetSegmentGrid := [][][]rTypes.StreetSegment{}
	grid := params.Grid
	for _, row := range *grid {
		streetSegmentGridRow := [][]rTypes.StreetSegment{}
		for _, cell := range row {
			streetSegments, err := sfc.sfDataRepository.GetSegmentsWithinPolygon(ctx, &rTypes.GetSegmentsWithinPolygonParams{
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
