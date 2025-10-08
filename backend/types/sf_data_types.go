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

type CollisionSeverity string

const (
	Fatal           CollisionSeverity = "fatal"
	Visible         CollisionSeverity = "other_visible"
	ComplaintOfPain CollisionSeverity = "complaint_of_pain"
	Medical         CollisionSeverity = "medical"
	Severe          CollisionSeverity = "severe"
)

type CollisionType string

const (
	OtherCollisionType CollisionType = "other"
	Overturned         CollisionType = "overturned"
	VehiclePedestiran  CollisionType = "vehicle_pedestrian"
	HitObject          CollisionType = "hit_object"
	RearEnd            CollisionType = "rear_end"
	Broadside          CollisionType = "broadside"
	Sideswipe          CollisionType = "sideswipe"
	NotStated          CollisionType = "not_stated"
	HeadOn             CollisionType = "head_on"
)
