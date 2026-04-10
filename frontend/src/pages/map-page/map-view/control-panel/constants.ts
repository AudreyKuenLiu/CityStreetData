import { TimeSegments } from "../../store/street-map-data-form";

export const TimeSegmentLabels = {
  [TimeSegments.OneMonth]: "1 Month",
  [TimeSegments.ThreeMonths]: "3 Months",
  [TimeSegments.OneYear]: "1 Year",
};

export const TimeSegmentOptions = [
  {
    value: TimeSegments.OneMonth,
    label: "1 Month",
  },
  {
    value: TimeSegments.ThreeMonths,
    label: "3 Months",
  },
  {
    value: TimeSegments.OneYear,
    label: "1 Year",
  },
] satisfies { value: TimeSegments; label: string }[];
