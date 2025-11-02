import { useStartDate, useEndDate } from "../../store/street-map-data-form";
import { CrashEvents } from "../../../../models/api-models";
import { it } from "zod/v4/locales";

const dayInMs = 1000 * 60 * 60 * 24;

const segmentOptions = [
  {
    id: "weeks",
    displayName: "W",
    segmentSizeMs: dayInMs * 7,
  },
  {
    id: "months",
    displayName: "30D",
    segmentSizeMs: dayInMs * 30,
  },
  {
    id: "quarter",
    displayName: "90D",
    segmentSizeMs: dayInMs * 90,
  },
  {
    id: "year",
    displayName: "Y",
    segmentSizeMs: dayInMs * 365,
  },
] as const;

export const useChartData = ({
  crashEvents,
  dateRange,
}: {
  crashEvents: CrashEvents[];
  dateRange: [Date, Date];
}): void => {
  const selectedOption = segmentOptions[1];

  const dateToCrashesGroupMap = new Map<
    number,
    { numCrashes: number; peopleKilled: number; peopleInjured: number }
  >();
  const dateSegments = [];

  const [startDate, endDate] = dateRange;
  const itDate = new Date(startDate);
  while (itDate.getTime() < endDate.getTime()) {
    const crashData = {
      numCrashes: 0,
      peopleKilled: 0,
      peopleInjured: 0,
    };
    dateToCrashesGroupMap.set(itDate.getTime(), crashData);
    dateSegments.push(itDate.getTime());
    itDate.setTime(itDate.getTime() + selectedOption.segmentSizeMs);
  }

  for (let i = 0; i < crashEvents.length; i++) {
    const crashEvent = crashEvents[i];
    const crashOccuredAt = crashEvent.occuredAt?.getTime() ?? 0;
  }
};
