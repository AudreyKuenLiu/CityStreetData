import { useSuspenseQueries } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import type { ViewportStreetSegment } from "../../../models/api-models";
import { StreetSegment, ViewableZoomLevels } from "../../../models/map-models";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../constants/map-dimensions";
import { ClassCodeEnum } from "../../../models/api-models";
import { useCallback, useMemo } from "react";
import { FilterSpecification } from "maplibre-gl";
import type { FeatureCollection, LineString } from "geojson";
import { ZoomLevelInView } from "../../../models/map-models";
import {
  StreetSearchTrees,
  StreetSegmentRBush,
} from "../../../models/map-models/street-search-tree";

type useStreetsForMapViewReturn = {
  geoJson: FeatureCollection<
    LineString,
    StreetSegment & { zoomLevel: ZoomLevelInView }
  >;
  streetSearchTrees: StreetSearchTrees;
  getFilterForZoomLevel: (zoomLevel: number) => FilterSpecification;
};

export const useStreetsForMapView = (): useStreetsForMapViewReturn => {
  const classCodesForViews = [
    [
      ClassCodeEnum.Freeways,
      ClassCodeEnum.HighwayOrMajorStreet,
      ClassCodeEnum.FreewayRamp,
    ],
    [ClassCodeEnum.Arterial, ClassCodeEnum.Collector],
    [ClassCodeEnum.Residential],
  ];
  const combinedQueries = useSuspenseQueries({
    queries: classCodesForViews.map((classCodes) => {
      return {
        queryKey: ["segmentsForViewport", ...classCodes] as const,
        gcTime: Infinity,
        staleTime: Infinity,
        queryFn: async (): Promise<AxiosResponse<ViewportStreetSegment[]>> => {
          return await axios.get<ViewportStreetSegment[]>(
            `/api/viewport/streets`,
            {
              params: {
                nePoint: JSON.stringify(SanFranciscoNEPoint),
                swPoint: JSON.stringify(SanFranciscoSWPoint),
                filters: JSON.stringify({
                  classCodes,
                }),
              },
            },
          );
        },
      };
    }),
  });

  const minZoomData = combinedQueries[0].data.data;
  const medZoomData = combinedQueries[1].data.data;
  const maxZoomData = combinedQueries[2].data.data;

  const streetSearchTrees = useMemo(() => {
    const [minZoomTree, medZoomTree, maxZoomTree] = [
      new StreetSegmentRBush(),
      new StreetSegmentRBush(),
      new StreetSegmentRBush(),
    ];
    minZoomTree.load(minZoomData);
    medZoomTree.load(medZoomData);
    maxZoomTree.load(maxZoomData);

    return {
      [ZoomLevelInView.ONE]: minZoomTree,
      [ZoomLevelInView.TWO]: medZoomTree,
      [ZoomLevelInView.THREE]: maxZoomTree,
    };
  }, [minZoomData, medZoomData, maxZoomData]);

  const geoJson = useMemo(() => {
    const minZoomFeatures = minZoomData.map((segment) => ({
      type: "Feature" as const,
      geometry: segment.line,
      properties: {
        ...segment,
        zoomLevel: ZoomLevelInView.ONE,
      },
    }));
    const medZoomFeatures = medZoomData.map((segment) => ({
      type: "Feature" as const,
      geometry: segment.line,
      properties: {
        ...segment,
        zoomLevel: ZoomLevelInView.TWO,
      },
    }));
    const maxZoomFeatures = maxZoomData.map((segment) => ({
      type: "Feature" as const,
      geometry: segment.line,
      properties: {
        ...segment,
        zoomLevel: ZoomLevelInView.THREE,
      },
    }));

    return {
      type: "FeatureCollection" as const,
      features: [...minZoomFeatures, ...medZoomFeatures, ...maxZoomFeatures],
    };
  }, [minZoomData, medZoomData, maxZoomData]);

  const getFilterForZoomLevel = useCallback(
    (zoomLevel: number): FilterSpecification => {
      return [
        "in",
        ["get", "zoomLevel"],
        ["literal", ViewableZoomLevels(zoomLevel)],
      ];
    },
    [],
  );

  return {
    geoJson,
    getFilterForZoomLevel,
    streetSearchTrees,
  };
};
