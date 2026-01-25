import { StoreApi } from "zustand";
import { GraphData, GraphDataActions, GraphGroupData } from "./types";

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

const initializeVehicleCrashesData = (
  data: GraphGroupData,
): GraphData["graphGroupVehicleCrashes"] => {
  const groupGraphDataArray = Array.from(data.entries());
  const groupIdGraphDataArray = groupGraphDataArray.map(([id, groupCrash]) => {
    const sortedGroupCrashes = sortDateEvents(groupCrash);
    const otherCrashes = sortedGroupCrashes.map(([time, crashStats]) => {
      return {
        x: time,
        y:
          crashStats.numberOfCrashes -
          crashStats.numberOfVehicleOnlyCrashes -
          crashStats.numberOfVehicleBicycleCrashes -
          crashStats.numberOfVehiclePedestrianCrashes -
          crashStats.numberOfBicycleOnlyCrashes -
          crashStats.numberOfBicyclePedestrianCrashes,
      };
    });
    const vehicleOnlyCrashes = sortedGroupCrashes.map(([time, crashStats]) => {
      return {
        x: time,
        y: crashStats.numberOfVehicleOnlyCrashes,
      };
    });
    const vehicleBicycleCrashes = sortedGroupCrashes.map(
      ([time, crashStats]) => {
        return {
          x: time,
          y: crashStats.numberOfVehicleBicycleCrashes,
        };
      },
    );
    const vehiclePedestrianCrashes = sortedGroupCrashes.map(
      ([time, crashStats]) => {
        return {
          x: time,
          y: crashStats.numberOfVehiclePedestrianCrashes,
        };
      },
    );
    const bicycleOnlyCrashes = sortedGroupCrashes.map(([time, crashStats]) => {
      return {
        x: time,
        y: crashStats.numberOfBicycleOnlyCrashes,
      };
    });
    const bicyclePedestrianCrashes = sortedGroupCrashes.map(
      ([time, crashStats]) => {
        return {
          x: time,
          y: crashStats.numberOfBicyclePedestrianCrashes,
        };
      },
    );

    const tickValues = sortedGroupCrashes.map(([time, _]) => time);
    const combinedData = [
      { id: "Other", data: otherCrashes, color: "#000000" },
      {
        id: "Bicycle-Pedestrian",
        data: bicyclePedestrianCrashes,
        color: "#8D5F8C",
      },
      { id: "Bicycle Only", data: bicycleOnlyCrashes, color: "#A376A2" },
      {
        id: "Vehicle-Pedestrian",
        data: vehiclePedestrianCrashes,
        color: "#2d4763ff",
      },
      {
        id: "Vehicle-Bicycle",
        data: vehicleBicycleCrashes,
        color: "#547792",
      },
      { id: "Vehicle Only", data: vehicleOnlyCrashes, color: "#94B4C1" },
    ] as const;
    return {
      id,
      tickValues,
      data: combinedData,
      axisLegend: "Traffic Crashes",
    } as const;
  });
  return groupIdGraphDataArray;
};

const initializeTrafficInjuriesAndFatalitiesData = (
  data: GraphGroupData,
): GraphData["graphGroupTrafficInjuriesAndFatalities"] => {
  const groupGraphDataArray = Array.from(data.entries());
  const groupIdGraphDataArray = groupGraphDataArray.map(([id, groupCrash]) => {
    const sortedGroupCrashes = sortDateEvents(groupCrash);
    const fatalitiesData = sortedGroupCrashes.map(([time, crashStats]) => {
      return {
        x: time,
        y: crashStats.numberKilled,
      };
    });
    const severeInjuriesData = sortedGroupCrashes.map(([time, crashStats]) => {
      return {
        x: time,
        y: crashStats.numberSeverelyInjured,
      };
    });
    const nonSevereInjuriesData = sortedGroupCrashes.map(
      ([time, crashStats]) => {
        return {
          x: time,
          y: crashStats.numberInjured - crashStats.numberSeverelyInjured,
        };
      },
    );
    const tickValues = sortedGroupCrashes.map(([time, _]) => time);
    const combinedData = [
      { id: "Fatalities", data: fatalitiesData, color: "#E34444" },
      { id: "Severe Injuries", data: severeInjuriesData, color: "#FFAB57" },
      { id: "Injuries", data: nonSevereInjuriesData, color: "#EDD296" },
    ] as const;
    //because there are objects in this array it will cause an infinite rerender
    return {
      id,
      tickValues,
      data: combinedData,
      axisLegend: "Traffic Injuries and Fatalities",
    } as const;
  });
  return groupIdGraphDataArray;
};

export const actions = ({
  setState,
}: Pick<StoreApi<GraphData>, "setState">): GraphDataActions => ({
  setGraphData: (data: GraphGroupData): void => {
    setState(() => {
      return {
        graphGroupVehicleCrashes: initializeVehicleCrashesData(data),
        graphGroupTrafficInjuriesAndFatalities:
          initializeTrafficInjuriesAndFatalitiesData(data),
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
});
