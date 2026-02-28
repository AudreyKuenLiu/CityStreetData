import { StoreApi } from "zustand";
import type {
  GroupTimeTrendData,
  TimeTrendCrashStat,
  TrendListActions,
  TrendListData,
} from "./types";
import type { CrashMap } from "../../../../models/map-models";
import type { UserFields } from "../../context/data-view";
import { buildTimeList, findFromTimeList, getSelectedCnns } from "../../utils";
import { ApiCrashEvent } from "../../../../models/api-models";

const apiCrashEventToTimeTrendCrashStats = (
  apiCrashEvent: ApiCrashEvent,
): TimeTrendCrashStat => {
  return {
    crashClassification: apiCrashEvent.crash_classification,
    collisionSeverity: apiCrashEvent.collision_severity,
    numberInjured: apiCrashEvent.number_injured,
    numberKilled: apiCrashEvent.number_killed,
    occuredAt: new Date(apiCrashEvent.occured_at * 1000),
  };
};

const initializeGraphData = ({
  data,
  selectedStartEndTime,
  selectedStreetGroups,
  selectedTimeSegment,
}: { data: CrashMap } & UserFields): GroupTimeTrendData => {
  const timeList = buildTimeList({
    startEndTime: selectedStartEndTime,
    timeSegment: selectedTimeSegment,
  });

  const groupTimeTrendData = Array.from(selectedStreetGroups.entries()).map(
    ([groupId, streetGroup]) => {
      const timeCrashStats = new Map<Date, TimeTrendCrashStat[]>();
      const streetSegments = Array.from(streetGroup.cnns.entries()).map(
        ([_, streetSegment]) => {
          return streetSegment;
        },
      );

      const uniqueCnns = getSelectedCnns(streetSegments);

      for (const cnn of uniqueCnns) {
        const apiCrashes = data.get(cnn) ?? [];
        for (const crash of apiCrashes) {
          const idx = findFromTimeList({
            occured_at: crash.occured_at,
            timeList,
            matchFn: (timeVal, nextVal, occured_at) => {
              const timeMs = timeVal.getTime() / 1000;
              const nextTimeMs = nextVal.getTime() / 1000;
              if (nextTimeMs <= occured_at) {
                return 1;
              } else if (timeMs > occured_at) {
                return -1;
              }
              return 0;
            },
          });

          if (idx >= 0) {
            const timeTrendArr = timeCrashStats.get(timeList[idx]) ?? [];
            timeTrendArr.push(apiCrashEventToTimeTrendCrashStats(crash));
            timeCrashStats.set(timeList[idx], timeTrendArr);
          }
        }
      }

      return [
        groupId,
        Array.from(timeCrashStats.entries()).map(
          ([timeSegment, crashStats]) => {
            return {
              timeSegment,
              crashStats,
            };
          },
        ),
      ] as const;
    },
  );
  return groupTimeTrendData;
};

export const actions = ({
  setState,
}: Pick<StoreApi<TrendListData>, "setState">): TrendListActions => ({
  initializeGraphData: ({
    data,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedTimeSegment,
  }): void => {
    setState(() => {
      return {
        groupTimeTrendData: initializeGraphData({
          data,
          selectedStartEndTime,
          selectedStreetGroups,
          selectedTimeSegment,
        }),
      };
    });
  },
  setTimeTrendFilter: (filter): void => {
    setState(() => {
      return {
        currentTimeTrendFilter: filter,
      };
    });
  },
  setGraphData: (data: GroupTimeTrendData): void => {
    setState(() => {
      return {
        groupTimeTrendData: data,
      };
    });
  },
  setCurrentTimeTrend: (timeTrend): void => {
    setState(() => {
      return {
        currentTimeTrend: timeTrend,
      };
    });
  },
});
