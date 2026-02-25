package controllers

import (
	cMapper "citystreetdata/controllers/mappers"
	"citystreetdata/controllers/types"
	cUtils "citystreetdata/controllers/utils"
	rTypes "citystreetdata/repositories/types"
	dTypes "citystreetdata/types"
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

	timeSegments := cUtils.BuildTimeSegmentArr(params.StartTime, params.EndTime, params.SegmentSize)

	stats, err := sfc.sfDataRepository.GetTrafficStatsForStreets(ctx, &rTypes.GetTrafficStatsForStreetsParams{
		CNNs:         params.CNNs,
		TimeSegments: timeSegments,
	})
	if err != nil {
		return nil, err
	}

	dateToCrashesGroupMap := map[int64]types.CrashStats{}
	for _, segments := range timeSegments {
		dateToCrashesGroupMap[segments.Unix()] = *new(types.CrashStats)
	}

	for _, crashData := range stats {
		crashStats := dateToCrashesGroupMap[crashData.TimeSegment.Unix()]
		if crashData.CollisionSeverity == dTypes.Severe {
			crashStats.NumberSeverelyInjured += crashData.NumberInjured
		}
		crashStats.NumberInjured += crashData.NumberInjured
		crashStats.NumberKilled += crashData.NumberKilled
		if crashData.CrashClassification != nil {
			if *crashData.CrashClassification == dTypes.VehiclesOnly {
				crashStats.NumberOfVehicleOnlyCrashes += crashData.NumberOfCrashes
			}
			if *crashData.CrashClassification == dTypes.VehicleBicycle {
				crashStats.NumberOfVehicleBicycleCrashes += crashData.NumberOfCrashes
			}
			if *crashData.CrashClassification == dTypes.VehiclePedestrian {
				crashStats.NumberOfVehiclePedestrianCrashes += crashData.NumberOfCrashes
			}
			if *crashData.CrashClassification == dTypes.BicyclePedestrian {
				crashStats.NumberOfBicyclePedestrianCrashes += crashData.NumberOfCrashes
			}
			if *crashData.CrashClassification == dTypes.BicycleOnly {
				crashStats.NumberOfBicycleOnlyCrashes += crashData.NumberOfCrashes
			}
		}
		crashStats.NumberOfCrashes += crashData.NumberOfCrashes
		dateToCrashesGroupMap[crashData.TimeSegment.Unix()] = crashStats
	}
	return &types.CrashDataForStreets{
		Data: dateToCrashesGroupMap,
	}, nil
}

func (sfc *SfDataController) GetMergedCrashesForStreets(ctx context.Context, params *types.GetMergedCrashesForStreetsParams) (geojson.FeatureCollection, error) {
	if params == nil {
		return nil, fmt.Errorf("no params passed to GetMergedCrashesForStreets")
	}

	mergedEvents, err := sfc.sfDataRepository.GetMergedTrafficCrashesForStreets(ctx, &rTypes.GetMergedTrafficCrashesForStreetParams{
		CNNs:      params.CNNs,
		StartTime: params.StartTime,
		EndTime:   params.EndTime,
	})

	featureCollection := geojson.FeatureCollection{}
	for _, crashEvent := range mergedEvents {
		crashFeature, err := cMapper.MergedCrashEventToFeature(&crashEvent)
		if err != nil {
			return nil, err
		}
		featureCollection = append(featureCollection, crashFeature)

	}

	return featureCollection, err
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
		crashFeature, err := cMapper.CrashEventToFeature(&crashData)
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
