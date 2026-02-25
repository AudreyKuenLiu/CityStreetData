package mappers

import (
	rTypes "citystreetdata/repositories/types"
	"citystreetdata/types"
	"encoding/json"

	"github.com/twpayne/go-geos/geojson"
)

func MergedCrashEventToFeature(c *rTypes.MergedCrashEvents) (*geojson.Feature, error) {
	properties := map[string]any{}

	encoding, err := json.Marshal(c)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(encoding, &properties)
	if err != nil {
		return nil, err
	}

	if c.Point == nil {
		return &geojson.Feature{
			Properties: properties,
		}, nil
	}

	return &geojson.Feature{
		Geometry:   *c.Point,
		Properties: properties,
	}, nil

}

func CrashEventToFeature(c *rTypes.CrashEvents) (*geojson.Feature, error) {
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
