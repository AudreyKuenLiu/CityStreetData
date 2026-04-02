package types

import (
	"citystreetdata/types"

	"time"

	"github.com/twpayne/go-geos/geometry"
)

type GetSegmentsWithinPolygonParams struct {
	Polygon *geometry.Geometry
	Filters *types.StreetFeatureFilters
}

type GetFeatureForStreetParams struct {
	CNNs      []int
	StartTime time.Time
	EndTime   time.Time
}

type GetSlowStreetParams struct {
}

type StreetSegment struct {
	CNN        int                `json:"cnn"`
	FNodeCNN   *int               `json:"f_node_cnn"`
	TNodeCNN   *int               `json:"t_node_cnn"`
	StreetName string             `json:"street"`
	Line       *geometry.Geometry `json:"line"`
}

type FeatureType string

const (
	SpeedLimit FeatureType = "SpeedLimit"
	SchoolZone FeatureType = "SchoolZone"
	SlowStreet FeatureType = "SlowStreet"
)

func (f FeatureType) IsValid() bool {
	return f == SpeedLimit || f == SlowStreet || f == SchoolZone
}

type StreetFeature struct {
	FeatureType FeatureType        `json:"feature_type"`
	Name        string             `json:"name"`
	Value       string             `json:"value"`
	Properties  any                `json:"properties"`
	CNN         int                `json:"cnn"`
	CompletedAt time.Time          `json:"completed_at"`
	Geometry    *geometry.Geometry `json:"geometry"`
}

type GetTrafficStatsForStreetsParams struct {
	CNNs         []int
	TimeSegments []time.Time
}

type TimeSegmentCrashStats struct {
	TimeSegment         time.Time
	CollisionSeverity   types.CollisionSeverity `json:"collision_severity"`
	CollisionType       types.CollisionType     `json:"collision_type"`
	CrashClassification *types.DphGroup         `json:"crash_classification"`
	NumberInjured       int                     `json:"number_injured"`
	NumberKilled        int                     `json:"number_killed"`
	NumberOfCrashes     int                     `json:"number_of_crashes"`
}

type GetMergedTrafficCrashesForStreetParams struct {
	CollisionSeverities  *[]types.CollisionSeverity
	CollisionTypes       *[]types.CollisionType
	CrashClassifications *[]types.DphGroup
	StartTime            time.Time
	EndTime              time.Time
	CNNs                 []int
}

type MergedCrashEvents struct {
	Point               *geometry.Geometry       `json:"-"`
	CollisionSeverity   *types.CollisionSeverity `json:"collision_severity"`
	CollisionType       *types.CollisionType     `json:"collision_type"`
	CrashClassification *types.DphGroup          `json:"crash_classification"`
	NumberKilled        int                      `json:"number_killed"`
	NumberInjured       int                      `json:"number_injured"`
	NumberOfCrashes     int                      `json:"number_of_crashes"`
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
	OccuredAt           time.Time                `json:"-"`
	OccuredAtUnix       int64                    `json:"occured_at"`
	CollisionSeverity   *types.CollisionSeverity `json:"collision_severity"`
	CollisionType       *types.CollisionType     `json:"collision_type"`
	CrashClassification *types.DphGroup          `json:"crash_classification"`
	NumberKilled        int                      `json:"number_killed"`
	NumberInjured       int                      `json:"number_injured"`
	Point               *geometry.Geometry       `json:"point"`
}
