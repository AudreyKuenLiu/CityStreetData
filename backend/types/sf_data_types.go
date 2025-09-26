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
