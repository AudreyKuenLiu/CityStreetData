import { StreetEvent, TimeSegments } from "../store/constants";

export const StreetEventLabels = {
  [StreetEvent.TrafficCrashes]: "Traffic Crashes",
};

export const StreetEventOptions = [
  {
    value: StreetEvent.TrafficCrashes,
    label: "Traffic Crashes",
  },
] satisfies { value: StreetEvent; label: string }[];

export const TimeSegmentLabels = {
  [TimeSegments.ThirtyDays]: "30 Days",
  [TimeSegments.NinetyDays]: "90 Days",
  [TimeSegments.OneYear]: "1 Year",
};

export const TimeSegmentOptions = [
  {
    value: TimeSegments.ThirtyDays,
    label: "30 Days",
  },
  {
    value: TimeSegments.NinetyDays,
    label: "90 Days",
  },
  {
    value: TimeSegments.OneYear,
    label: "1 Year",
  },
] satisfies { value: TimeSegments; label: string }[];
