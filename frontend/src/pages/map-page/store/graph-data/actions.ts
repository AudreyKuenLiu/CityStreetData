import { StoreApi } from "zustand";
import {
  GraphData,
  GraphDataActions,
  GraphGroupData,
  GroupLineData,
} from "./types";

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
): GroupLineData<["Vehicle Crashes"]> => {
  const groupGraphDataArray = Array.from(data.entries());
  const groupIdGraphDataArray = groupGraphDataArray.map(([id, groupCrash]) => {
    const sortedGroupCrashes = sortDateEvents(groupCrash);
    const vehicleCrashes = sortedGroupCrashes.map(([time, crashEvents]) => {
      return {
        x: time,
        y: crashEvents.numberOfCrashes,
      };
    });
    const tickValues = sortedGroupCrashes.map(([time, _]) => time);
    const combinedData = [
      { id: "Vehicle Crashes", data: vehicleCrashes, color: "#000000" },
    ] as const;
    return [id, tickValues, combinedData] as const;
  });
  return groupIdGraphDataArray;
};

const initializeTrafficInjuriesAndFatalitiesData = (
  data: GraphGroupData
): GroupLineData<["Fatalities", "Severe Injuries", "Injuries"]> => {
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
    return [id, tickValues, combinedData] as const;
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
        graphGroupTrafficCrashesAndFatalities:
          initializeTrafficInjuriesAndFatalitiesData(data),
      };
    });
  },
});
