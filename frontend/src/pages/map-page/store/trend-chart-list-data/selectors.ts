import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  TrendListData,
  GroupTimeTrendData,
  TimeTrendsEnum,
  TrendListActions,
  AverageLineSeriesId,
  timeTrendsToAxis,
  TimeTrendFilterEnum,
  TimeTrendCrashStat,
} from "./types";
import { actions } from "./actions";
import {
  GroupLineData,
  InjuryCrashTypeFilter,
  injuryCrashTypeToCrashClassification,
} from "../../types/data-view";
import { useShallow } from "zustand/shallow";
import { useDataViewContext } from "../../context/data-view";
import { TimeSegments } from "../street-map-data-form";
import { TimeSegmentsToName } from "../street-map-data-form/types";
import { CollisionSeverityEnum } from "../../../../models/api-models";

const useTrendChartListData = create<TrendListData>()(
  devtools(
    (set) => ({
      currentTimeTrendFilter: TimeTrendFilterEnum.AllInjuries,
      currentTimeTrend: TimeTrendsEnum.HOURLY,
      groupTimeTrendData: [],
      actions: actions({ setState: set }),
    }),
    { name: "TrendListData" },
  ),
);

const timeTrendsToName = {
  [TimeTrendsEnum.HOURLY]: "Hourly",
  [TimeTrendsEnum.DAILY]: "Daily",
  [TimeTrendsEnum.MONTHLY]: "Monthly",
};

const getTimeTrendCrashStatVal = ({
  crashStat,
  filter,
}: {
  crashStat: TimeTrendCrashStat;
  filter: InjuryCrashTypeFilter;
}): number => {
  if (
    filter === TimeTrendFilterEnum.BicycleInvolvedCrashes ||
    filter === TimeTrendFilterEnum.PedestrianInvolvedCrashes ||
    filter === TimeTrendFilterEnum.VehicleInvolvedCrashes
  ) {
    return injuryCrashTypeToCrashClassification[filter].some(
      (u) => u === crashStat.crashClassification,
    )
      ? 1
      : 0;
  }
  if (
    filter === TimeTrendFilterEnum.SevereInjuries &&
    crashStat.collisionSeverity === CollisionSeverityEnum.Severe
  ) {
    return crashStat.numberInjured;
  }
  if (filter === TimeTrendFilterEnum.AllInjuries) {
    return crashStat.numberInjured;
  }
  return 0;
};

const initializeTrendDateByTimePeriod = ({
  groupTimeTrendData,
  timeTrends,
  selectedTimeSegment,
  selectedTimeTrendFilter,
}: {
  groupTimeTrendData: GroupTimeTrendData;
  timeTrends: TimeTrendsEnum;
  selectedTimeTrendFilter: InjuryCrashTypeFilter;
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
        if (timeTrends === TimeTrendsEnum.HOURLY) {
          occuredTrendSegment =
            timeTrendsToAxis[timeTrends][occuredAt.getHours()];
        } else if (timeTrends === TimeTrendsEnum.DAILY) {
          occuredTrendSegment =
            timeTrendsToAxis[timeTrends][occuredAt.getDay()];
        }
        const totalInjuries =
          (crashStatMap.get(occuredTrendSegment) ?? 0) +
          getTimeTrendCrashStatVal({
            crashStat,
            filter: selectedTimeTrendFilter,
          });
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
  const currentTimeTrendFilter = useTrendChartListData(
    useShallow((state) => state.currentTimeTrendFilter),
  );
  return initializeTrendDateByTimePeriod({
    groupTimeTrendData,
    timeTrends: timeTrends ?? TimeTrendsEnum.DAILY,
    selectedTimeSegment,
    selectedTimeTrendFilter: currentTimeTrendFilter,
  });
};

export const useCurrentTimeTrend = (): TimeTrendsEnum => {
  return useTrendChartListData(useShallow((state) => state.currentTimeTrend));
};

export const useCurrentTimeTrendFilter = (): InjuryCrashTypeFilter => {
  return useTrendChartListData(
    useShallow((state) => state.currentTimeTrendFilter),
  );
};

export const useActions = (): TrendListActions => {
  return useTrendChartListData(useShallow((state) => state.actions));
};
