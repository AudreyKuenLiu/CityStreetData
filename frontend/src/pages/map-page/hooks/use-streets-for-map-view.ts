import { useSuspenseQueries } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import type { StreetSegment } from "../../../models/api-models";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../constants/map-dimensions";
import { ClassCodeEnum } from "../../../models/api-models";
import { useCallback, useMemo } from "react";
import { FilterSpecification } from "maplibre-gl";
import type { FeatureCollection, LineString } from "geojson";

enum ZoomLevelInView {
  ONE, //least zoomed in
  TWO,
  THREE, //most zoomed in
}

type useStreetsForMapViewReturn = {
  geoJson: FeatureCollection<
    LineString,
    StreetSegment & { zoomLevel: ZoomLevelInView }
  >;
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
        staleTime: Infinity,
        queryFn: async (): Promise<AxiosResponse<ViewportSegment[]>> => {
          return await axios.get<ViewportSegment[]>(`/api/viewport/streets`, {
            params: {
              nePoint: JSON.stringify(SanFranciscoNEPoint),
              swPoint: JSON.stringify(SanFranciscoSWPoint),
              filters: JSON.stringify({
                classCodes,
              }),
            },
          });
        },
      };
    }),
  });

  const minZoomData = combinedQueries[0].data.data;
  const medZoomData = combinedQueries[1].data.data;
  const maxZoomData = combinedQueries[2].data.data;

  const geoJson = useMemo(() => {
    const minZoomFeatures = minZoomData.map((segment) => ({
      type: "Feature" as const,
      geometry: segment.line,
      properties: {
        cnn: segment.cnn,
        line: segment.line,
        zoomLevel: ZoomLevelInView.ONE,
      },
    }));
    const medZoomFeatures = medZoomData.map((segment) => ({
      type: "Feature" as const,
      geometry: segment.line,
      properties: {
        cnn: segment.cnn,
        line: segment.line,
        zoomLevel: ZoomLevelInView.TWO,
      },
    }));
    const maxZoomFeatures = maxZoomData.map((segment) => ({
      type: "Feature" as const,
      geometry: segment.line,
      properties: {
        cnn: segment.cnn,
        line: segment.line,
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
      if (zoomLevel >= 15.5) {
        return [
          "in",
          ["get", "zoomLevel"],
          [
            "literal",
            [ZoomLevelInView.ONE, ZoomLevelInView.TWO, ZoomLevelInView.THREE],
          ],
        ];
      } else if (zoomLevel < 15.5 && zoomLevel >= 13.5) {
        return [
          "in",
          ["get", "zoomLevel"],
          ["literal", [ZoomLevelInView.TWO, ZoomLevelInView.ONE]],
        ];
      }
      return ["in", ["get", "zoomLevel"], ["literal", [ZoomLevelInView.ONE]]];
    },
    [],
  );

  return {
    geoJson,
    getFilterForZoomLevel,
  };
};
