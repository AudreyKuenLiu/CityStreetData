import { StoreApi } from "zustand";
import { GraphData, GraphDataActions, GraphGroupData } from "./types";
import type { CrashMap } from "../../../../models/map-models";
import type { UserFields } from "../../context/data-view";
import { getSelectedCnns, buildTimeList, findFromTimeList } from "../../utils";
import { length } from "@turf/turf";
import {
  ApiCrashEvent,
  CollisionSeverityEnum,
  CrashClassificationEnum,
  CrashStats,
} from "../../../../models/api-models";

const apiCrashEventToCrashStats = (
  apiCrashEvent: ApiCrashEvent,
): CrashStats => {
  const crashStat: CrashStats = {
    number_killed: apiCrashEvent.number_killed,
    number_injured: apiCrashEvent.number_injured,
    number_severely_injured:
      apiCrashEvent.collision_severity === CollisionSeverityEnum.Severe
        ? apiCrashEvent.number_injured
        : 0,
    number_of_crashes: 1,
    number_of_vehicle_only_crashes:
      apiCrashEvent.crash_classification ===
      CrashClassificationEnum.VehiclesOnly
        ? 1
        : 0,
    number_of_bicycle_only_crashes:
      apiCrashEvent.crash_classification === CrashClassificationEnum.BicycleOnly
        ? 1
        : 0,
    number_of_vehicle_bicycle_crashes:
      apiCrashEvent.crash_classification ===
      CrashClassificationEnum.VehicleBicycle
        ? 1
        : 0,
    number_of_vehicle_pedestrian_crashes:
      apiCrashEvent.crash_classification ===
      CrashClassificationEnum.VehiclePedestrian
        ? 1
        : 0,
    number_of_bicycle_pedestrian_crashes:
      apiCrashEvent.crash_classification ===
      CrashClassificationEnum.BicyclePedestrian
        ? 1
        : 0,
  };

  return crashStat;
};

const mergeCrashStats = (
  crashStat1?: CrashStats,
  crashStat2?: CrashStats,
): CrashStats => {
  return {
    number_killed:
      (crashStat1?.number_killed ?? 0) + (crashStat2?.number_killed ?? 0),
    number_injured:
      (crashStat1?.number_injured ?? 0) + (crashStat2?.number_injured ?? 0),
    number_severely_injured:
      (crashStat1?.number_severely_injured ?? 0) +
      (crashStat2?.number_severely_injured ?? 0),
    number_of_crashes:
      (crashStat1?.number_of_crashes ?? 0) +
      (crashStat2?.number_of_crashes ?? 0),
    number_of_vehicle_only_crashes:
      (crashStat1?.number_of_vehicle_only_crashes ?? 0) +
      (crashStat2?.number_of_vehicle_only_crashes ?? 0),
    number_of_bicycle_only_crashes:
      (crashStat1?.number_of_bicycle_only_crashes ?? 0) +
      (crashStat2?.number_of_bicycle_only_crashes ?? 0),
    number_of_vehicle_bicycle_crashes:
      (crashStat1?.number_of_vehicle_bicycle_crashes ?? 0) +
      (crashStat2?.number_of_vehicle_bicycle_crashes ?? 0),
    number_of_vehicle_pedestrian_crashes:
      (crashStat1?.number_of_vehicle_pedestrian_crashes ?? 0) +
      (crashStat2?.number_of_vehicle_pedestrian_crashes ?? 0),
    number_of_bicycle_pedestrian_crashes:
      (crashStat1?.number_of_bicycle_pedestrian_crashes ?? 0) +
      (crashStat2?.number_of_bicycle_pedestrian_crashes ?? 0),
  };
};

const initializeGraphData = ({
  data,
  selectedStartEndTime,
  selectedStreetGroups,
  selectedTimeSegment,
}: {
  data: CrashMap;
} & UserFields): GraphGroupData => {
  const timeList = buildTimeList({
    startEndTime: selectedStartEndTime,
    timeSegment: selectedTimeSegment,
  });
  const timeCrashStats = new Map<Date, CrashStats>();
  for (const time of timeList.slice(0, -1)) {
    timeCrashStats.set(time, {
      number_killed: 0,
      number_injured: 0,
      number_severely_injured: 0,
      number_of_crashes: 0,
      number_of_vehicle_only_crashes: 0,
      number_of_bicycle_only_crashes: 0,
      number_of_vehicle_bicycle_crashes: 0,
      number_of_vehicle_pedestrian_crashes: 0,
      number_of_bicycle_pedestrian_crashes: 0,
    });
  }

  const groupIdCollection = Array.from(selectedStreetGroups.entries()).map(
    ([groupId, streetGroup]) => {
      const streetSegments = Array.from(streetGroup.cnns.entries()).map(
        ([_, streetSegment]) => {
          return streetSegment;
        },
      );
      const totalMiles = streetSegments
        .map((streetSegment) =>
          length(
            { type: "Feature", geometry: streetSegment.line, properties: {} },
            { units: "miles" },
          ),
        )
        .reduce((accumlator, curVal) => accumlator + curVal, 0);
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
            timeCrashStats.set(
              timeList[idx],
              mergeCrashStats(
                apiCrashEventToCrashStats(crash),
                timeCrashStats.get(timeList[idx]),
              ),
            );
          }
        }
      }

      return [
        groupId,
        {
          totalMiles,
          dateCrashStats: Array.from(timeCrashStats.entries()),
        },
      ] as const;
    },
  );
  return groupIdCollection;
};

export const actions = ({
  setState,
}: Pick<StoreApi<GraphData>, "setState">): GraphDataActions => ({
  initializeGraphData: ({
    data,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedTimeSegment,
  }): void => {
    setState(() => {
      return {
        graphGroupData: initializeGraphData({
          data,
          selectedStartEndTime,
          selectedStreetGroups,
          selectedTimeSegment,
        }),
      };
    });
  },
  selectCurrentGraph: (graphType): void => {
    setState(() => {
      return {
        currentGraphType: graphType,
      };
    });
  },
  toggleNormalize: (): void => {
    setState((state) => {
      return {
        shouldNormalize: !state.shouldNormalize,
      };
    });
  },
});
