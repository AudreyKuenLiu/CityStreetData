import { StoreApi } from "zustand";
import { GraphData, GraphDataActions, GraphGroupData } from "./types";

const sortDateEvents = <T>(
  arr: (readonly [Date, T])[]
): (readonly [Date, T])[] => {
  const sortedDateEvents = arr.sort((eventA, eventB) => {
    const crashTimeA = eventA[0]?.getTime();
    const crashTimeB = eventB[0]?.getTime();
    return crashTimeA - crashTimeB;
  });
  return sortedDateEvents;
};

const initializeVehicleCrashesData = (
  data: GraphGroupData
): GraphData["graphGroupVehicleCrashes"] => {
  const groupGraphDataArray = Array.from(data.entries());
  const groupIdGraphDataArray = groupGraphDataArray.map(([id, groupCrash]) => {
    const sortedGroupCrashes = sortDateEvents(groupCrash);
    const otherCrashes = sortedGroupCrashes.map(([time, crashEvents]) => {
      return {
        x: time,
        y:
          crashEvents.numberOfCrashes -
          crashEvents.numberOfVehicleOnlyCrashes -
          crashEvents.numberOfVehicleBicycleCrashes -
          crashEvents.numberOfVehiclePedestrianCrashes -
          crashEvents.numberOfBicycleOnlyCrashes -
          crashEvents.numberOfBicyclePedestrianCrashes,
      };
    });
    const vehicleOnlyCrashes = sortedGroupCrashes.map(([time, crashEvents]) => {
      return {
        x: time,
        y: crashEvents.numberOfVehicleOnlyCrashes,
      };
    });
    const vehicleBicycleCrashes = sortedGroupCrashes.map(
      ([time, crashEvents]) => {
        return {
          x: time,
          y: crashEvents.numberOfVehicleBicycleCrashes,
        };
      }
    );
    const vehiclePedestrianCrashes = sortedGroupCrashes.map(
      ([time, crashEvents]) => {
        return {
          x: time,
          y: crashEvents.numberOfVehiclePedestrianCrashes,
        };
      }
    );
    const bicycleOnlyCrashes = sortedGroupCrashes.map(([time, crashEvents]) => {
      return {
        x: time,
        y: crashEvents.numberOfBicycleOnlyCrashes,
      };
    });
    const bicyclePedestrianCrashes = sortedGroupCrashes.map(
      ([time, crashEvents]) => {
        return {
          x: time,
          y: crashEvents.numberOfBicyclePedestrianCrashes,
        };
      }
    );

    const tickValues = sortedGroupCrashes.map(([time, _]) => time);
    const combinedData = [
      { id: "Other", data: otherCrashes, color: "#000000" },
      {
        id: "Bicycle-Pedestrian",
        data: bicyclePedestrianCrashes,
        color: "#A376A2",
      },
      { id: "Bicycle Only", data: bicycleOnlyCrashes, color: "#8D5F8C" },
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
  data: GraphGroupData
): GraphData["graphGroupTrafficInjuriesAndFatalities"] => {
  const groupGraphDataArray = Array.from(data.entries());
  const groupIdGraphDataArray = groupGraphDataArray.map(([id, groupCrash]) => {
    const sortedGroupCrashes = sortDateEvents(groupCrash);
    const fatalitiesData = sortedGroupCrashes.map(([time, crashEvents]) => {
      return {
        x: time,
        y: crashEvents.numberKilled,
      };
    });
    const severeInjuriesData = sortedGroupCrashes.map(([time, crashEvents]) => {
      return {
        x: time,
        y: crashEvents.numberSeverelyInjured,
      };
    });
    const nonSevereInjuriesData = sortedGroupCrashes.map(
      ([time, crashEvents]) => {
        return {
          x: time,
          y: crashEvents.numberInjured - crashEvents.numberSeverelyInjured,
        };
      }
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
