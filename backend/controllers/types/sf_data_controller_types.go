package types

import (
	rTypes "citystreetdata/repositories/types"
	"citystreetdata/types"
	"time"

	"github.com/twpayne/go-geos"
	"github.com/twpayne/go-geos/geometry"
)

type RectangleCell struct {
	NEPoint [2]float64 `json:"nePoint"`
	SWPoint [2]float64 `json:"swPoint"`
}

func (r RectangleCell) ToPolygon() *geometry.Geometry {
	SWPoint := r.SWPoint
	NEPoint := r.NEPoint

	WNPoint := []float64{SWPoint[1], NEPoint[0]}
	ESPoint := []float64{NEPoint[1], SWPoint[0]}
	ENPoint := []float64{NEPoint[1], NEPoint[0]}
	WSPoint := []float64{SWPoint[1], SWPoint[0]}

	polygon := geometry.NewGeometry(geos.NewPolygon([][][]float64{{ENPoint, WNPoint, WSPoint, ESPoint, ENPoint}})).SetSRID(4326)
	return polygon
}

type GetSegmentsForViewportParams struct {
	Rectangle RectangleCell
	Filters   *types.StreetFeatureFilters
}

type GetSegmentsForGridParams struct {
	Grid    *[][]RectangleCell
	Filters *types.StreetFeatureFilters
}

type GetSegmentsForGridReturn struct {
	StreetSegmentGrid *[][][]rTypes.StreetSegment
}

type GetCrashesForStreetsParams struct {
	CNNs      []int
	StartTime time.Time
	EndTime   time.Time
}

type TimeSegmentSize string

const (
	Weeks    TimeSegmentSize = "W"
	Months   TimeSegmentSize = "30D"
	Quarters TimeSegmentSize = "90D"
	Years    TimeSegmentSize = "Y"
)

func (t TimeSegmentSize) SegmentInSeconds() int64 {
	daysSeconds := 60 * 60 * 24
	switch t {
	case Weeks:
		return int64(daysSeconds) * 7
	case Months:
		return int64(daysSeconds) * 30
	case Quarters:
		return int64(daysSeconds) * 90
	case Years:
		return int64(daysSeconds) * 365

	}
	return 0
}

type GetCrashDataForStreetsParams struct {
	CNNs        []int
	SegmentSize TimeSegmentSize
	StartTime   time.Time
	EndTime     time.Time
}

type CrashStats struct {
	NumberKilled           int `json:"numberKilled"`
	NumberInjured          int `json:"numberInjured"`
	NumberSeriouslyInjured int `json:"numberSeriouslyInjured"`
	NumberOfCrashes        int `json:"numberOfCrashes"`
}

type GetCrashDataForStreetsReturn struct {
	Data map[int64]CrashStats
}
