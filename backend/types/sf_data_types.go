package types

type ClassCode int

const (
	Other ClassCode = iota
	Freeway
	HighwayOrMajorStreet
	Arterial
	Collector
	Residential
	FreewayRamp
)

func (c ClassCode) ToString() string {
	switch c {
	case Other:
		return "other"
	case Freeway:
		return "freeway"
	case HighwayOrMajorStreet:
		return "highway_or_major_street"
	case Arterial:
		return "arterial"
	case Collector:
		return "collector"
	case Residential:
		return "residential"
	case FreewayRamp:
		return "freeway_ramp"
	default:
		return "other"
	}
}

type StreetFeatureFilters struct {
	ClassCodes []ClassCode `json:"classCodes"`
}

type EventType string

const (
	TrafficCrash  EventType = "traffic_crash_resulting_in_injury"
	TrafficArrest EventType = "police_traffic_arrest"
)
