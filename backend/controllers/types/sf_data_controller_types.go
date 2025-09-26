package types

import (
	"citystreetdata/types"
)

type GetSegmentsForViewportParams struct {
	NEPoint []float64
	SWPoint []float64
	Filters *types.StreetFeatureFilters
}
