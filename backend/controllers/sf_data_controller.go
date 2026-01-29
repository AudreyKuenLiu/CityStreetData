package controllers

import (
	"citystreetdata/controllers/types"
	cUtils "citystreetdata/controllers/utils"
	rTypes "citystreetdata/repositories/types"
	dtypes "citystreetdata/types"
	"slices"

	repo "citystreetdata/repositories"
	"context"
	"fmt"
	"log/slog"
	"sort"

	"github.com/twpayne/go-geos/geojson"
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

func (sfc *SfDataController) GetCrashDataForStreets(ctx context.Context, params *types.GetCrashDataForStreetsParams) (*types.CrashDataForStreets, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetCrashDataForStreets")
	}

	//pull data from Repos
	crashes, err := sfc.sfDataRepository.GetTrafficCrashesForStreets(ctx, &rTypes.GetTrafficForStreetsParams{
		CNNs:      params.CNNs,
		StartTime: params.StartTime,
		EndTime:   params.EndTime,
	})
	if err != nil {
		return nil, err
	}
	sort.Slice(crashes, func(i, j int) bool {
		return crashes[i].OccuredAt.Unix() < crashes[j].OccuredAt.Unix()
	})

	//initilize segments
	dateToCrashesGroupMap, findClosestTime := cUtils.BuildTimeSegmentMap[types.CrashStats](params.StartTime, params.EndTime, params.SegmentSize)

	//map to time segment
	var closestTime int64
	idx := 0
	for _, crashData := range crashes {
		closestTime, idx = findClosestTime(crashData.OccuredAt.Unix(), idx)
		crashStats := dateToCrashesGroupMap[closestTime]
		if crashData.CollisionSeverity != nil && *crashData.CollisionSeverity == dtypes.Severe {
			crashStats.NumberSeverelyInjured += crashData.NumberInjured
		}
		crashStats.NumberInjured += crashData.NumberInjured
		crashStats.NumberKilled += crashData.NumberKilled
		if crashData.CrashClassification != nil {
			if *crashData.CrashClassification == dtypes.VehiclesOnly {
				crashStats.NumberOfVehicleOnlyCrashes += 1
			}
			if *crashData.CrashClassification == dtypes.VehicleBicycle {
				crashStats.NumberOfVehicleBicycleCrashes += 1
			}
			if *crashData.CrashClassification == dtypes.VehiclePedestrian {
				crashStats.NumberOfVehiclePedestrianCrashes += 1
			}
			if *crashData.CrashClassification == dtypes.BicyclePedestrian {
				crashStats.NumberOfBicyclePedestrianCrashes += 1
			}
			if *crashData.CrashClassification == dtypes.BicycleOnly {
				crashStats.NumberOfBicycleOnlyCrashes += 1
			}
		}
		crashStats.NumberOfCrashes += 1
		dateToCrashesGroupMap[closestTime] = crashStats
	}

	return &types.CrashDataForStreets{
		Data: dateToCrashesGroupMap,
	}, nil
}

func (sfc *SfDataController) GetCrashesForStreets(ctx context.Context, params *types.GetCrashesForStreetsParams) (*types.CrashEventsForStreets, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetCrashesForStreets")
	}

	crashEvents, err := sfc.sfDataRepository.GetTrafficCrashesForStreets(ctx, &rTypes.GetTrafficForStreetsParams{
		CNNs:      params.CNNs,
		StartTime: params.StartTime,
		EndTime:   params.EndTime,
	})

	if err != nil {
		return nil, err
	}

	if params.SegmentSize == nil {
		//todo implement a scenario where we just get all crashes in a timeframe
		return nil, nil
	}

	sort.Slice(crashEvents, func(i, j int) bool {
		return crashEvents[i].OccuredAt.Unix() < crashEvents[j].OccuredAt.Unix()
	})

	timeToCrashCollection, findClosestTime := cUtils.BuildTimeSegmentMap[geojson.FeatureCollection](params.StartTime, params.EndTime, *params.SegmentSize)
	var closestTime int64
	idx := 0
	for _, crashData := range crashEvents {
		closestTime, idx = findClosestTime(crashData.OccuredAt.Unix(), idx)
		crashCollection := timeToCrashCollection[closestTime]
		crashFeature, err := crashData.ToFeature()
		if err != nil {
			return nil, err
		}
		timeToCrashCollection[closestTime] = append(crashCollection, crashFeature)
	}

	return &types.CrashEventsForStreets{
		Data: timeToCrashCollection,
	}, err

}

func (sfc *SfDataController) GetStreetFeatures(ctx context.Context, params *types.GetStreetFeaturesParams) ([]rTypes.StreetFeatureSegment, error) {
	ret := []rTypes.StreetFeatureSegment{}
	if slices.Contains(params.FeatureTypes, rTypes.SlowStreet) {
		vals, err := sfc.sfDataRepository.GetSlowStreets(ctx, &rTypes.GetSlowStreetParams{
			CompletedAfter:  params.CompletedAfter,
			CompletedBefore: params.CompletedBefore,
		})
		if err != nil {
			return nil, err
		}
		ret = append(ret, vals...)
	}
	return ret, nil
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
