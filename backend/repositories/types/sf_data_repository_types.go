package types

import (
	"citystreetdata/types"

	"time"

	"github.com/twpayne/go-geos/geometry"
)

type StreetSegment struct {
	CNN        int                `json:"cnn"`
	StreetName string             `json:"street"`
	Line       *geometry.Geometry `json:"line"`
}

type GetSegmentsWithinPolygonParams struct {
	Polygon *geometry.Geometry
	Filters *types.StreetFeatureFilters
}

type GetTrafficForStreetsParams struct {
	CNNs                []int
	CollisionSeverities *[]types.CollisionSeverity
	CollisionTypes      *[]types.CollisionType
	StartDate           time.Time
	EndDate             time.Time
}
