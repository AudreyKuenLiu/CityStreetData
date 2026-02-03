import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import {
  HeatmapFilter,
  HeatmapFilterEnum,
  type HeatmapData,
  type HeatmapDataActions,
  type HeatmapGroupTimeSegments,
} from "./types";
import { actions } from "./actions";
import { GroupId } from "../street-map-data-form";
import {
  CollisionSeverityEnum,
  CrashClassificationEnum,
  CrashEventFeatureCollection,
} from "../../../../models/api-models";
import { MAX_ZOOM } from "../../map-view/constants";
import { LayerProps } from "react-map-gl/maplibre";
import {
  DataDrivenPropertyValueSpecification,
  FilterSpecification,
} from "maplibre-gl";

const useHeatmapData = create<HeatmapData>()(
  devtools(
    (set) => ({
      heatmapGroupTimeSegments: new Map(),
      featureCollectionsIndex: 0,
      fullTimePeriodDisplay: false,
      heatmapFilter: HeatmapFilterEnum.AllInjuries,
      actions: actions({ setState: set }),
    }),
    { name: "HeatmapData" },
  ),
);

export const useHeatmapFeatureCollectionsByTimeSegment = (): (readonly [
  GroupId,
  CrashEventFeatureCollection,
])[] => {
  const heatmapGroupTimeSegments = useHeatmapData(
    useShallow((state) => state.heatmapGroupTimeSegments),
  );
  const currentSegmentIdx = useHeatmapData(
    (state) => state.featureCollectionsIndex,
  );

  return Array.from(
    heatmapGroupTimeSegments.entries().map(([groupId, collections]) => {
      return [
        groupId,
        collections.featureCollectionSegments[currentSegmentIdx][1],
      ] as const;
    }),
  );
};

export const useHeatmapFilter = (): HeatmapFilter => {
  return useHeatmapData(useShallow((state) => state.heatmapFilter));
};

export const useHeatmapLayerProps = (): LayerProps => {
  const heatmapFilter = useHeatmapData(
    useShallow((state) => state.heatmapFilter),
  );
  let filter: FilterSpecification = [">=", ["get", "occured_at"], 0];
  if (heatmapFilter === HeatmapFilterEnum.BicycleInvolvedCrashes) {
    filter = [
      "in",
      ["get", "crash_classification"],
      [
        "literal",
        [
          CrashClassificationEnum.BicycleOnly,
          CrashClassificationEnum.BicycleParkedCar,
          CrashClassificationEnum.BicyclePedestrian,
          CrashClassificationEnum.VehicleBicyclePedestrian,
          CrashClassificationEnum.BicycleUnknown,
          CrashClassificationEnum.VehicleBicycle,
        ],
      ],
    ];
  } else if (heatmapFilter === HeatmapFilterEnum.PedestrianInvolvedCrashes) {
    filter = [
      "in",
      ["get", "crash_classification"],
      [
        "literal",
        [
          CrashClassificationEnum.PedestrianOnly,
          CrashClassificationEnum.BicyclePedestrian,
          CrashClassificationEnum.VehicleBicyclePedestrian,
          CrashClassificationEnum.VehiclePedestrian,
        ],
      ],
    ];
  } else if (heatmapFilter === HeatmapFilterEnum.VehicleInvolvedCrashes) {
    filter = [
      "in",
      ["get", "crash_classification"],
      [
        "literal",
        [
          CrashClassificationEnum.VehiclesOnly,
          CrashClassificationEnum.VehicleBicycle,
          CrashClassificationEnum.VehicleBicyclePedestrian,
          CrashClassificationEnum.VehiclePedestrian,
        ],
      ],
    ];
  } else if (heatmapFilter === HeatmapFilterEnum.SevereInjuries) {
    filter = [
      "in",
      ["get", "collision_severity"],
      ["literal", [CollisionSeverityEnum.Severe]],
    ];
  }

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
      HeatmapFilterEnum.BicycleInvolvedCrashes,
      HeatmapFilterEnum.PedestrianInvolvedCrashes,
      HeatmapFilterEnum.VehicleInvolvedCrashes,
    ]
  ) {
    heatmapWeight = ["interpolate", ["linear"], 0, 0, 10, 1];
  }

  return {
    filter,
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
  const heatmapGroupTimeSegments = useHeatmapData(
    useShallow((state) => state.heatmapGroupTimeSegments),
  );
  const currentSegmentIdx = useHeatmapData(
    (state) => state.featureCollectionsIndex,
  );
  const fullTimePeriodDisplay = useHeatmapData(
    (state) => state.fullTimePeriodDisplay,
  );

  if (fullTimePeriodDisplay) {
    return Array.from(
      heatmapGroupTimeSegments.entries().map(([groupId, collections]) => {
        const mergedFeatureCollection: CrashEventFeatureCollection = {
          type: "FeatureCollection",
          features: [],
        };
        for (const [
          ,
          featureCollection,
        ] of collections.featureCollectionSegments) {
          mergedFeatureCollection.features = [
            ...mergedFeatureCollection.features,
            ...featureCollection.features,
          ];
        }
        return [groupId, mergedFeatureCollection] as const;
      }),
    );
  }
  return Array.from(
    heatmapGroupTimeSegments.entries().map(([groupId, collections]) => {
      return [
        groupId,
        collections.featureCollectionSegments[currentSegmentIdx][1],
      ] as const;
    }),
  );
};

export const useHeatmapTimeSegments = (): HeatmapGroupTimeSegments => {
  return useHeatmapData(useShallow((state) => state.heatmapGroupTimeSegments));
};

export const useFeatureCollectionsIndex = (): number => {
  return useHeatmapData((state) => state.featureCollectionsIndex);
};

export const useFullTimePeriodDisply = (): boolean => {
  return useHeatmapData((state) => state.fullTimePeriodDisplay);
};

export const useHeatmapTimeSegmentDates = (): Date[] => {
  return useHeatmapData(
    useShallow((state) => {
      const heatmapTimeSegment = state.heatmapGroupTimeSegments.entries().next()
        .value?.[1];
      if (heatmapTimeSegment == null) {
        return [];
      }
      return heatmapTimeSegment.featureCollectionSegments.map(([date]) => {
        return date;
      });
    }),
  );
};

export const useActions = (): HeatmapDataActions => {
  return useHeatmapData((state) => state.actions);
};
