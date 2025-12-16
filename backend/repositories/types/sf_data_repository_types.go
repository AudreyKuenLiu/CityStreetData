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

type GetFeatureForStreetParams struct {
	CNNs      []int
	StartTime time.Time
	EndTime   time.Time
}

type FeatureType = string

const (
	SpeedLimit FeatureType = "SpeedLimit"
)

type StreetFeature struct {
	FeatureType FeatureType `json:"featureType"`
	CNN         int         `json:"cnn"`
	CompletedAt time.Time   `json:"completedAt"`
	Value       string      `json:"value"`
}

type GetTrafficForStreetsParams struct {
	CNNs                []int
	CollisionSeverities *[]types.CollisionSeverity
	CollisionTypes      *[]types.CollisionType
	StartTime           time.Time
	EndTime             time.Time
}

type CrashEvents struct {
	CNN                 int                      `json:"cnn"`
	OccuredAt           *time.Time               `json:"occured_at"`
	CollisionSeverity   *types.CollisionSeverity `json:"collision_severity"`
	CollisionType       *types.CollisionType     `json:"collision_type"`
	NumberKilled        int                      `json:"number_killed"`
	NumberInjured       int                      `json:"number_injured"`
	CrashClassification *types.DphGroup          `json:"crash_classification"`
}
