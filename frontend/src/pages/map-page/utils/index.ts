import { addMonths, addYears } from "date-fns";
import { TimeSegments } from "../store/street-map-data-form";
import { StreetSegment } from "../../../models/map-models";

export const getSelectedCnns = (
  selectedSegments: StreetSegment[],
): Set<number> => {
  const uniqueCnns = new Set<number>();
  for (const segment of selectedSegments) {
    uniqueCnns.add(segment.cnn);
    if (segment.f_node_cnn != null) {
      uniqueCnns.add(segment.f_node_cnn);
    }
    if (segment.t_node_cnn != null) {
      uniqueCnns.add(segment.t_node_cnn);
    }
  }

  return uniqueCnns;
};

export const buildTimeList = ({
  startEndTime,
  timeSegment,
}: {
  startEndTime: [Date, Date];
  timeSegment: TimeSegments;
}): Date[] => {
  const [startTime, endTime] = startEndTime;
  let it = startTime;
  const ret = [];

  while (it < endTime) {
    ret.push(it);
    it = addTimeSegment(it, timeSegment);
  }
  ret.push(endTime);

  return ret;
};

export const findFromTimeList = <T>({
  occured_at,
  timeList,
  matchFn,
}: {
  occured_at: number;
  timeList: T[];
  matchFn: (timeVal: T, nextTimeVal: T, occured_at: number) => -1 | 0 | 1;
}): number => {
  let startIdx = 0;
  let endIdx = timeList.length - 1;
  while (startIdx <= endIdx) {
    const mid = Math.floor((startIdx + endIdx) / 2);
    const timeVal = timeList[mid];
    const nextVal = timeList[mid + 1];
    if (matchFn(timeVal, nextVal, occured_at) === 0) {
      return mid;
    } else if (matchFn(timeVal, nextVal, occured_at) === -1) {
      endIdx = mid - 1;
    } else {
      startIdx = mid + 1;
    }
  }

  return -1;
};

export const addTimeSegment = (
  date: Date,
  selectedSegment: TimeSegments,
): Date => {
  if (selectedSegment === TimeSegments.OneMonth) {
    return addMonths(date, 1);
  }
  if (selectedSegment === TimeSegments.ThreeMonths) {
    return addMonths(date, 3);
  }
  return addYears(date, 1);
};
