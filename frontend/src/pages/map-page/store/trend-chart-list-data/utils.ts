import { TimeSegments } from "../street-map-data-form";
import type { TimeTrendId } from "./types";
import { format } from "date-fns";

export const timeTrendId = ({
  date,
  selectedTimeSegment,
}: {
  date: Date;
  selectedTimeSegment: TimeSegments;
}): TimeTrendId => {
  let prefix;
  if (
    selectedTimeSegment === TimeSegments.OneMonth ||
    selectedTimeSegment === TimeSegments.ThreeMonths
  ) {
    prefix = format(date, "MMMM, yyyy") as TimeTrendId;
  } else if (selectedTimeSegment === TimeSegments.OneYear) {
    prefix = format(date, "yyyy") as TimeTrendId;
  } else {
    prefix = date.toDateString();
  }
  return prefix.concat(`.${date.getTime() / 1000}`) as TimeTrendId;
};
