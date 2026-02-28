import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { type HeatmapData, type HeatmapDataActions } from "./types";
import { actions } from "./actions";
import { GroupId } from "../street-map-data-form";
import {
  CollisionSeverityEnum,
  CrashEventFeatureCollection,
} from "../../../../models/api-models";
import { MAX_ZOOM } from "../../map-view/constants";
import { LayerProps } from "react-map-gl/maplibre";
import {
  DataDrivenPropertyValueSpecification,
  ExpressionFilterSpecification,
} from "maplibre-gl";
import {
  InjuryCrashTypeFilter,
  InjuryCrashTypeFilterEnum,
  injuryCrashTypeToCrashClassification,
} from "../../types/data-view";

const useHeatmapData = create<HeatmapData>()(
  devtools(
    (set) => ({
      timeSegmentList: [],
      groupIdFeatureCollections: [],
      timeSegmentIdx: 0,
      fullTimePeriodDisplay: false,
      heatmapFilter: InjuryCrashTypeFilterEnum.AllInjuries,
      actions: actions({ setState: set }),
    }),
    { name: "HeatmapData" },
  ),
);

export const useHeatmapFilter = (): InjuryCrashTypeFilter => {
  return useHeatmapData(useShallow((state) => state.heatmapFilter));
};

export const useHeatmapLayerProps = (): LayerProps => {
  const heatmapFilter = useHeatmapFilter();

  const timeSegmentList = useHeatmapData(
    useShallow((state) => state.timeSegmentList),
  );
  const idx = useTimeSegmentIdx();
  const fullPeriod = useFullTimePeriodDisplay();

  const dynamicFilter: ExpressionFilterSpecification = ["all"];

  if (
    heatmapFilter === InjuryCrashTypeFilterEnum.BicycleInvolvedCrashes ||
    heatmapFilter === InjuryCrashTypeFilterEnum.PedestrianInvolvedCrashes ||
    heatmapFilter === InjuryCrashTypeFilterEnum.VehicleInvolvedCrashes
  ) {
    dynamicFilter.push([
      "in",
      ["get", "crash_classification"],
      ["literal", injuryCrashTypeToCrashClassification[heatmapFilter]],
    ]);
  } else if (heatmapFilter === InjuryCrashTypeFilterEnum.SevereInjuries) {
    dynamicFilter.push([
      "in",
      ["get", "collision_severity"],
      ["literal", [CollisionSeverityEnum.Severe]],
    ]);
  }

  let startDate = timeSegmentList[idx] ?? new Date();
  let endDate = timeSegmentList[idx + 1] ?? new Date();
  if (fullPeriod) {
    startDate = timeSegmentList[0] ?? new Date();
    endDate = timeSegmentList[timeSegmentList.length - 1] ?? new Date();
  }
  dynamicFilter.push([">=", ["get", "occured_at"], startDate.getTime() / 1000]);
  dynamicFilter.push(["<", ["get", "occured_at"], endDate.getTime() / 1000]);
  // console.log("this is the startEndTime", startDate, endDate);

  let heatmapWeight: DataDrivenPropertyValueSpecification<number> = [
    "interpolate",
    ["linear"],
    ["get", "number_injured"],
    0,
    0,
    10,
    1,
  ];

  if (
    heatmapFilter in
    [
      InjuryCrashTypeFilterEnum.BicycleInvolvedCrashes,
      InjuryCrashTypeFilterEnum.PedestrianInvolvedCrashes,
      InjuryCrashTypeFilterEnum.VehicleInvolvedCrashes,
    ]
  ) {
    heatmapWeight = ["interpolate", ["linear"], 0, 0, 10, 1];
  }
  return {
    filter: dynamicFilter,
    maxzoom: MAX_ZOOM,
    type: "heatmap",
    paint: {
      // Increase the heatmap weight based on frequency and property magnitude
      "heatmap-weight": heatmapWeight,
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        1,
        MAX_ZOOM,
        1,
      ],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparancy color
      // to create a blur-like effect.
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        0.2,
        "rgb(103,169,207)",
        0.4,
        "rgb(209,229,240)",
        0.6,
        "rgb(253,219,199)",
        0.8,
        "rgb(239,138,98)",
        1,
        "rgb(255,201,101)",
      ],
      // Adjust the heatmap radius by zoom level
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        2,
        MAX_ZOOM,
        20,
      ],
      // Transition from heatmap to circle layer by zoom level
      "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 1],
    },
  };
};

export const useHeatmapFeatureCollections = (): (readonly [
  GroupId,
  CrashEventFeatureCollection,
])[] => {
  return useHeatmapData(useShallow((state) => state.groupIdFeatureCollections));
};

export const useTimeSegmentIdx = (): number => {
  return useHeatmapData((state) => state.timeSegmentIdx);
};

export const useFullTimePeriodDisplay = (): boolean => {
  return useHeatmapData((state) => state.fullTimePeriodDisplay);
};

export const useHeatmapTimeSegmentDates = (): Date[] => {
  const arr = useHeatmapData(useShallow((state) => state.timeSegmentList));
  return arr.slice(0, -1);
};

export const useActions = (): HeatmapDataActions => {
  return useHeatmapData((state) => state.actions);
};
