import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  TrendListData,
  GroupTrendData,
  TimeTrends,
  TrendListActions,
} from "./types";
import { actions } from "./actions";
import { GroupLineData } from "../../types/graphs";
import { useShallow } from "zustand/shallow";
import { getRandomColor } from "../../../../utils";

const useTrendChartListData = create<TrendListData>()(
  devtools(
    (set) => ({
      currentTimeTrend: null,
      groupTrendData: new Map(),
      actions: actions({ setState: set }),
    }),
    { name: "TrendListData" },
  ),
);

const timeTrendsToAxis = {
  [TimeTrends.HOURLY]: [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ],
  [TimeTrends.DAILY]: ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],
  [TimeTrends.MONTHLY]: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
} as const;

const initializeTrendDateByTimePeriod = ({
  groupTrendData,
  timeTrends,
}: {
  groupTrendData: GroupTrendData;
  timeTrends: TimeTrends;
}): GroupLineData<string, string> => {
  const ret = Array.from(groupTrendData.entries()).map(
    ([groupId, dateCrashStats]) => {
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
          color: "#D3D3D3", //getRandomColor(),
        };
      });
      const averageLineSeries = {
        id: "AvgLineSeries",
        data: Array.from(timeTrendsToAxis[timeTrends]).map(
          (timeTrendSegment) => {
            return {
              y: 0,
              x: timeTrendSegment,
            };
          },
        ),
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
        axisLegend: "",
      } as const;
    },
  );
  return ret;
};

export const useCrashTrendData = (): GroupLineData<string, string> => {
  const groupTrendData = useTrendChartListData(
    useShallow((state) => state.groupTrendData),
  );
  const timeTrends = useTrendChartListData(
    useShallow((state) => state.currentTimeTrend),
  );
  return initializeTrendDateByTimePeriod({
    groupTrendData,
    timeTrends: timeTrends ?? TimeTrends.DAILY,
  });
};

export const useActions = (): TrendListActions => {
  return useTrendChartListData(useShallow((state) => state.actions));
};
