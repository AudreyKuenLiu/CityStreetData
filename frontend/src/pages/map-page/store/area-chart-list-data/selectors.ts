import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import {
  GraphData,
  GraphGroupData,
  GraphDataActions,
  GraphType,
} from "./types";
import { actions } from "./actions";
import { GroupLineData } from "../../types/data-view";

const useGraphData = create<GraphData>()(
  devtools(
    (set) => ({
      graphGroupData: [],
      shouldNormalize: false,
      currentGraphType: "InjuriesAndFatalities",
      actions: actions({ setState: set }),
    }),
    { name: "AreaChartData" },
  ),
);

const sortDateEvents = <T>(
  arr: (readonly [Date, T])[],
): (readonly [Date, T])[] => {
  const sortedDateEvents = arr.sort((eventA, eventB) => {
    const crashTimeA = eventA[0]?.getTime();
    const crashTimeB = eventB[0]?.getTime();
    return crashTimeA - crashTimeB;
  });
  return sortedDateEvents;
};

const normalizeValues = (
  data: { x: Date; y: number }[],
  normalizeBy: number,
): { x: Date; y: number }[] => {
  return data.map((point) => {
    return {
      x: point.x,
      y: Number((point.y / normalizeBy).toFixed(2)),
    };
  });
};

const initializeVehicleCrashesData = (
  data: GraphGroupData,
  shouldNormalize: boolean,
): GroupLineData<
  [
    "Other",
    "Vehicle Only",
    "Vehicle-Bicycle",
    "Vehicle-Pedestrian",
    "Bicycle Only",
    "Bicycle-Pedestrian",
  ]
> => {
  const groupIdGraphDataArray = data.map(
    ([id, { totalMiles, dateCrashStats: groupCrash }]) => {
      const sortedGroupCrashes = sortDateEvents(groupCrash);
      const otherCrashes = sortedGroupCrashes.map(([time, crashStats]) => {
        return {
          x: time,
          y:
            crashStats.number_of_crashes -
            crashStats.number_of_vehicle_only_crashes -
            crashStats.number_of_vehicle_bicycle_crashes -
            crashStats.number_of_vehicle_pedestrian_crashes -
            crashStats.number_of_bicycle_only_crashes -
            crashStats.number_of_bicycle_pedestrian_crashes,
        };
      });
      const vehicleOnlyCrashes = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_of_vehicle_only_crashes,
          };
        },
      );
      const vehicleBicycleCrashes = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_of_vehicle_bicycle_crashes,
          };
        },
      );
      const vehiclePedestrianCrashes = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_of_vehicle_pedestrian_crashes,
          };
        },
      );
      const bicycleOnlyCrashes = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_of_bicycle_only_crashes,
          };
        },
      );
      const bicyclePedestrianCrashes = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_of_bicycle_pedestrian_crashes,
          };
        },
      );

      const tickValues = sortedGroupCrashes.map(([time, _]) => time);
      const combinedData = [
        { id: "Other" as const, data: otherCrashes, color: "#000000" },
        {
          id: "Bicycle-Pedestrian" as const,
          data: bicyclePedestrianCrashes,
          color: "#8D5F8C",
        },
        {
          id: "Bicycle Only" as const,
          data: bicycleOnlyCrashes,
          color: "#A376A2",
        },
        {
          id: "Vehicle-Pedestrian" as const,
          data: vehiclePedestrianCrashes,
          color: "#2d4763ff",
        },
        {
          id: "Vehicle-Bicycle" as const,
          data: vehicleBicycleCrashes,
          color: "#547792",
        },
        {
          id: "Vehicle Only" as const,
          data: vehicleOnlyCrashes,
          color: "#94B4C1",
        },
      ].map((val) => {
        return {
          id: val.id,
          data: normalizeValues(val.data, shouldNormalize ? totalMiles : 1),
          color: val.color,
        };
      });
      return {
        id,
        tickValues,
        totalMiles,
        lineSeries: combinedData,
        axisLegend: shouldNormalize
          ? "Traffic Crashes per Mile"
          : "Traffic Crashes",
      } as const;
    },
  );
  return groupIdGraphDataArray;
};

const initializeTrafficInjuriesAndFatalitiesData = (
  data: GraphGroupData,
  shouldNormalize: boolean,
): GroupLineData<["Fatalities", "Severe Injuries", "Injuries"]> => {
  const groupIdGraphDataArray = data.map(
    ([id, { totalMiles, dateCrashStats: groupCrash }]) => {
      const sortedGroupCrashes = sortDateEvents(groupCrash);
      const fatalitiesData = sortedGroupCrashes.map(([time, crashStats]) => {
        return {
          x: time,
          y: crashStats.number_killed,
        };
      });
      const severeInjuriesData = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_severely_injured,
          };
        },
      );
      const nonSevereInjuriesData = sortedGroupCrashes.map(
        ([time, crashStats]) => {
          return {
            x: time,
            y: crashStats.number_injured - crashStats.number_severely_injured,
          };
        },
      );
      const tickValues = sortedGroupCrashes.map(([time, _]) => time);
      const combinedData = [
        { id: "Fatalities" as const, data: fatalitiesData, color: "#E34444" },
        {
          id: "Severe Injuries" as const,
          data: severeInjuriesData,
          color: "#FFAB57",
        },
        {
          id: "Injuries" as const,
          data: nonSevereInjuriesData,
          color: "#EDD296",
        },
      ].map((val) => {
        return {
          id: val.id,
          data: normalizeValues(val.data, shouldNormalize ? totalMiles : 1),
          color: val.color,
        };
      });
      return {
        id,
        tickValues,
        totalMiles,
        lineSeries: combinedData,
        axisLegend: shouldNormalize
          ? "Traffic Injuries and Fatalities per Mile"
          : "Traffic Injuries and Fatalities",
      } as const;
    },
  );
  return groupIdGraphDataArray;
};

export const useTrafficCrashesData = ():
  | GroupLineData<
      [
        "Other",
        "Vehicle Only",
        "Vehicle-Bicycle",
        "Vehicle-Pedestrian",
        "Bicycle Only",
        "Bicycle-Pedestrian",
      ]
    >
  | GroupLineData<["Fatalities", "Severe Injuries", "Injuries"]> => {
  const graphData = useGraphData(useShallow((state) => state.graphGroupData));
  const graphType = useGraphData(useShallow((state) => state.currentGraphType));
  const shouldNormalize = useGraphData(
    useShallow((state) => state.shouldNormalize),
  );

  if (graphType === "CrashGroups") {
    return initializeVehicleCrashesData(graphData, shouldNormalize);
  }
  return initializeTrafficInjuriesAndFatalitiesData(graphData, shouldNormalize);
};

export const useShouldNormalizeGraphData = (): boolean => {
  return useGraphData((state) => state.shouldNormalize);
};

export const useCurrentGraphType = (): GraphType => {
  return useGraphData((state) => state.currentGraphType);
};

export const useActions = (): GraphDataActions => {
  return useGraphData((state) => state.actions);
};
