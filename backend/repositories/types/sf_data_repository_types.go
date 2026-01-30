package types

import (
	"citystreetdata/types"
	"encoding/json"

	"time"

	"github.com/twpayne/go-geos/geojson"
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
	StreetName      *string
	CompletedAfter  time.Time
	CompletedBefore time.Time
	Limit           uint
}

type StreetFeatureSegment struct {
	StreetSegment
	StreetFeature
}

type StreetSegment struct {
	CNN        int                `json:"cnn"`
	StreetName string             `json:"street"`
	Line       *geometry.Geometry `json:"line"`
}

type FeatureType string

const (
	SpeedLimit FeatureType = "SpeedLimit"
	SlowStreet FeatureType = "SlowStreet"
)

func (f FeatureType) IsValid() bool {
	return f == SpeedLimit || f == SlowStreet
}

type StreetFeature struct {
	FeatureType FeatureType `json:"feature_type"`
	CompletedAt time.Time   `json:"completed_at"`
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
	OccuredAt           time.Time                `json:"occured_at"`
	CollisionSeverity   *types.CollisionSeverity `json:"collision_severity"`
	CollisionType       *types.CollisionType     `json:"collision_type"`
	NumberKilled        int                      `json:"number_killed"`
	NumberInjured       int                      `json:"number_injured"`
	CrashClassification *types.DphGroup          `json:"crash_classification"`
	Point               *geometry.Geometry       `json:"-"`
}

func (c CrashEvents) ToFeature() (*geojson.Feature, error) {
	properties := map[string]any{}
	mappedCrashEvents := struct {
		CNN                 int                      `json:"cnn"`
		OccuredAt           int64                    `json:"occured_at"`
		CollisionSeverity   *types.CollisionSeverity `json:"collision_severity"`
		CollisionType       *types.CollisionType     `json:"collision_type"`
		NumberKilled        int                      `json:"number_killed"`
		NumberInjured       int                      `json:"number_injured"`
		CrashClassification *types.DphGroup          `json:"crash_classification"`
	}{
		CNN:                 c.CNN,
		OccuredAt:           c.OccuredAt.Unix(),
		CollisionSeverity:   c.CollisionSeverity,
		CollisionType:       c.CollisionType,
		NumberKilled:        c.NumberKilled,
		NumberInjured:       c.NumberInjured,
		CrashClassification: c.CrashClassification,
	}

	encoding, err := json.Marshal(mappedCrashEvents)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(encoding, &properties)
	if err != nil {
		return nil, err
	}

	if c.Point == nil {
		return &geojson.Feature{
			ID:         c.CNN,
			Properties: properties,
		}, nil
	}

	return &geojson.Feature{
		ID:         c.CNN,
		Geometry:   *c.Point,
		Properties: properties,
	}, nil
}
