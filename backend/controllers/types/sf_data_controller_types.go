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
