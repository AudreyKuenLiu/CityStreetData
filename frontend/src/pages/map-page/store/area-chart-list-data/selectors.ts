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
import { CrashStats } from "../../../../models/api-models";

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
  options: { totalMiles: number },
): { x: Date; y: number }[] => {
  const normalizeBy = options.totalMiles;
  return data.map((point) => {
    return {
      x: point.x,
      y: Number((point.y / normalizeBy).toFixed(2)),
    };
  });
};

const initializeCrashesData = (
  data: GraphGroupData,
  buildCrashGraphs: (
    groupCrashes: (readonly [Date, CrashStats])[],
  ) => readonly {
    id: string;
    data: {
      x: Date;
      y: number;
    }[];
    color: string;
  }[],
  transformMethods: ((
    data: { x: Date; y: number }[],
    options: { totalMiles: number },
  ) => { x: Date; y: number }[])[],
  axisLegend: string,
): GroupLineData<string> => {
  const groupIdGraphDataArray = data.map(
    ([id, { totalMiles, dateCrashStats: groupCrash }]) => {
      const sortedGroupCrashes = sortDateEvents(groupCrash);
      const groupCrashesData = buildCrashGraphs(sortedGroupCrashes);
      const combinedData = groupCrashesData.map((val) => {
        let processedDataVals = val.data;
        for (let i = 0; i < transformMethods.length; i += 1) {
          processedDataVals = transformMethods[i](processedDataVals, {
            totalMiles,
          });
        }
        return {
          id: val.id,
          data: processedDataVals,
          color: val.color,
        };
      });
      const tickValues = combinedData[0].data.map((d) => d.x);
      const allTickValues = groupCrashesData[0].data.map((d) => d.x);

      return {
        id,
        tickValues,
        totalMiles,
        lineSeries: combinedData,
        allTickValues,
        axisLegend: axisLegend,
      } as const;
    },
  );
  return groupIdGraphDataArray;
};

const buildVehicleCrashesGraphData = (
  data: (readonly [Date, CrashStats])[],
): {
  id:
    | "Other"
    | "Vehicle Only"
    | "Vehicle-Bicycle"
    | "Vehicle-Pedestrian"
    | "Bicycle Only"
    | "Bicycle-Pedestrian";
  data: {
    x: Date;
    y: number;
  }[];
  color: string;
}[] => {
  const otherCrashes = data.map(([time, crashStats]) => {
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
  const vehicleOnlyCrashes = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_of_vehicle_only_crashes,
    };
  });
  const vehicleBicycleCrashes = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_of_vehicle_bicycle_crashes,
    };
  });
  const vehiclePedestrianCrashes = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_of_vehicle_pedestrian_crashes,
    };
  });
  const bicycleOnlyCrashes = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_of_bicycle_only_crashes,
    };
  });
  const bicyclePedestrianCrashes = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_of_bicycle_pedestrian_crashes,
    };
  });
  return [
    {
      id: "Other" as const,
      data: otherCrashes,
      color: "#000000",
    },
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
  ];
};

const buildTrafficInjuriesAndFatalitiesData = (
  data: (readonly [Date, CrashStats])[],
): {
  id: "Fatalities" | "Severe Injuries" | "Injuries";
  data: {
    x: Date;
    y: number;
  }[];
  color: string;
}[] => {
  const fatalitiesData = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_killed,
    };
  });
  const severeInjuriesData = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_severely_injured,
    };
  });
  const nonSevereInjuriesData = data.map(([time, crashStats]) => {
    return {
      x: time,
      y: crashStats.number_injured - crashStats.number_severely_injured,
    };
  });
  return [
    {
      id: "Fatalities" as const,
      data: fatalitiesData,
      color: "#E34444",
    },
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
  ];
};

export const useTrafficCrashesData = (
  transformFuncs: ((
    data: { x: Date; y: number }[],
    options: { totalMiles: number },
  ) => { x: Date; y: number }[])[],
): GroupLineData<string> => {
  const graphData = useGraphData(useShallow((state) => state.graphGroupData));
  const graphType = useGraphData(useShallow((state) => state.currentGraphType));
  const shouldNormalize = useGraphData(
    useShallow((state) => state.shouldNormalize),
  );

  if (graphType === "CrashGroups") {
    const data = initializeCrashesData(
      graphData,
      buildVehicleCrashesGraphData,
      shouldNormalize ? [...transformFuncs, normalizeValues] : transformFuncs,
      shouldNormalize ? "Traffic Crashes per Mile" : "Traffic Crashes",
    );

    return data;
  }
  return initializeCrashesData(
    graphData,
    buildTrafficInjuriesAndFatalitiesData,
    shouldNormalize ? [...transformFuncs, normalizeValues] : transformFuncs,
    shouldNormalize
      ? "Traffic Injuries and Fatalities per Mile"
      : "Traffic Injuries and Fatalities",
  );
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
