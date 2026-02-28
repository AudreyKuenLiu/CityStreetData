import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  TrendListData,
  GroupTimeTrendData,
  TimeTrends,
  TrendListActions,
  AverageLineSeriesId,
  timeTrendsToAxis,
} from "./types";
import { actions } from "./actions";
import { GroupLineData } from "../../types/graphs";
import { useShallow } from "zustand/shallow";
import { useDataViewContext } from "../../context/data-view";
import { TimeSegments } from "../street-map-data-form";
import { TimeSegmentsToName } from "../street-map-data-form/types";

const useTrendChartListData = create<TrendListData>()(
  devtools(
    (set) => ({
      currentTimeTrend: TimeTrends.HOURLY,
      groupTimeTrendData: [],
      actions: actions({ setState: set }),
    }),
    { name: "TrendListData" },
  ),
);

const timeTrendsToName = {
  [TimeTrends.HOURLY]: "Hourly",
  [TimeTrends.DAILY]: "Daily",
  [TimeTrends.MONTHLY]: "Monthly",
};

const initializeTrendDateByTimePeriod = ({
  groupTimeTrendData,
  timeTrends,
  selectedTimeSegment,
}: {
  groupTimeTrendData: GroupTimeTrendData;
  timeTrends: TimeTrends;
  selectedTimeSegment: TimeSegments | null;
}): GroupLineData<string, string> => {
  const ret = groupTimeTrendData.map(([groupId, dateCrashStats]) => {
    let lineSeries = dateCrashStats.map(({ timeSegment, crashStats }) => {
      const crashStatMap = new Map<
        (typeof timeTrendsToAxis)[keyof typeof timeTrendsToAxis][number],
        number
      >();
      for (const crashStat of crashStats) {
        const { occuredAt } = crashStat;
        let occuredTrendSegment =
          timeTrendsToAxis[timeTrends][occuredAt.getMonth()];
        if (timeTrends === TimeTrends.HOURLY) {
          occuredTrendSegment =
            timeTrendsToAxis[timeTrends][occuredAt.getHours()];
        } else if (timeTrends === TimeTrends.DAILY) {
          occuredTrendSegment =
            timeTrendsToAxis[timeTrends][occuredAt.getDay()];
        }
        const totalInjuries =
          (crashStatMap.get(occuredTrendSegment) ?? 0) +
          crashStat.numberInjured;
        // (crashStat.collisionSeverity === "severe"
        //   ? crashStat.numberInjured
        //   : 0);
        crashStatMap.set(occuredTrendSegment, totalInjuries);
      }

      return {
        id: timeSegment.toDateString(),
        data: Array.from(timeTrendsToAxis[timeTrends]).map(
          (timeTrendSegment) => {
            return {
              y: crashStatMap.get(timeTrendSegment) ?? 0,
              x: timeTrendSegment,
            };
          },
        ),
        color: "#D3D3D3",
      };
    });
    const averageLineSeries = {
      id: AverageLineSeriesId,
      data: Array.from(timeTrendsToAxis[timeTrends]).map((timeTrendSegment) => {
        return {
          y: 0,
          x: timeTrendSegment,
        };
      }),
      color: "black",
    };
    for (const lines of lineSeries) {
      for (const [idx, { y }] of lines.data.entries()) {
        averageLineSeries.data[idx].y += y;
      }
    }
    averageLineSeries.data = averageLineSeries.data.map((vals) => {
      return {
        y: Number((vals.y / lineSeries.length).toFixed(2)),
        x: vals.x,
      };
    });
    lineSeries = [averageLineSeries, ...lineSeries];

    return {
      id: groupId,
      tickValues: Array.from(timeTrendsToAxis[timeTrends]),
      lineSeries,
      axisLegend: `${timeTrendsToName[timeTrends]} Traffic Injuries Every ${TimeSegmentsToName[selectedTimeSegment ?? TimeSegments.OneYear]}`,
    } as const;
  });
  return ret;
};

export const useCrashTrendData = (): GroupLineData<string, string> => {
  const { selectedTimeSegment } = useDataViewContext();
  const groupTimeTrendData = useTrendChartListData(
    useShallow((state) => state.groupTimeTrendData),
  );
  const timeTrends = useTrendChartListData(
    useShallow((state) => state.currentTimeTrend),
  );
  return initializeTrendDateByTimePeriod({
    groupTimeTrendData,
    timeTrends: timeTrends ?? TimeTrends.DAILY,
    selectedTimeSegment,
  });
};

export const useCurrentTimeTrend = (): TimeTrends => {
  return useTrendChartListData(useShallow((state) => state.currentTimeTrend));
};

export const useActions = (): TrendListActions => {
  return useTrendChartListData(useShallow((state) => state.actions));
};
