package controllers

import (
	"citystreetdata/controllers/types"
	rTypes "citystreetdata/repositories/types"
	dtypes "citystreetdata/types"
	"math"

	repo "citystreetdata/repositories"
	"context"
	"fmt"
	"log/slog"
	"sort"
	"time"
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

	speedLimitFeatures, err := sfc.sfDataRepository.GetSpeedLimitForStreets(ctx,
		&rTypes.GetFeatureForStreetParams{CNNs: params.CNNs, StartTime: params.StartTime, EndTime: params.EndTime},
	)
	if err != nil {
		return nil, err
	}

	//initilize segments
	dateToCrashesGroupMap := map[int64]types.CrashStats{}
	dateToStreetFeatures := map[int64][]rTypes.StreetFeature{}
	timeSlices := []int64{}
	startTime := params.StartTime
	endTime := params.EndTime
	loc, _ := time.LoadLocation("America/Los_Angeles")
	itTime := startTime.In(loc)

	for itTime.Unix() < endTime.Unix() {
		unixTime := itTime.Unix()
		dateToCrashesGroupMap[unixTime] = types.CrashStats{}
		dateToStreetFeatures[unixTime] = []rTypes.StreetFeature{}
		timeSlices = append(timeSlices, unixTime)
		years, months, days := params.SegmentSize.SegmentInYearMonthDays()
		itTime = itTime.AddDate(years, months, days)
	}

	findClosestTime := func(occuredTime int64, curPos int) (int64, int) {
		i := curPos
		for i < len(timeSlices) {
			curTime := timeSlices[i]
			nextTime := int64(math.MaxInt64)
			if i+1 < len(timeSlices) {
				nextTime = timeSlices[i+1]
			}
			if curTime <= occuredTime && occuredTime < nextTime {
				return curTime, i
			}
			i += 1
		}
		return timeSlices[len(timeSlices)-1], i
	}

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

	idx = 0
	for _, speedData := range speedLimitFeatures {
		closestTime, idx = findClosestTime(speedData.CompletedAt.Unix(), idx)
		dateToStreetFeatures[closestTime] = append(dateToStreetFeatures[closestTime], speedData)
	}

	return &types.GetCrashDataForStreetsReturn{
		Data:     dateToCrashesGroupMap,
		Features: dateToStreetFeatures,
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
