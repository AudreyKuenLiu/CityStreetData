import { useSuspenseQueries } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { ViewportSegment } from "../../../models/api-models";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../constants/map-dimensions";
import { classCode } from "../../../models/api-models";
import { ZoomLevelInView, getZoomLevelInView } from "../../../models/map-grid";
import { useCallback, useMemo } from "react";

type useStreetsForMapViewReturn = {
  getStreetSegmentsForZoomLevel: (zoomLevel: number) => ViewportSegment[];
};

export const useStreetsForMapView = (): useStreetsForMapViewReturn => {
  const classCodesForViews = [
    [classCode.Freeways, classCode.HighwayOrMajorStreet, classCode.FreewayRamp],
    [
      classCode.Freeways,
      classCode.HighwayOrMajorStreet,
      classCode.FreewayRamp,
      classCode.Arterial,
      classCode.Collector,
    ],
    [
      classCode.Freeways,
      classCode.HighwayOrMajorStreet,
      classCode.FreewayRamp,
      classCode.Arterial,
      classCode.Collector,
      classCode.Residential,
    ],
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

  const config = useMemo(
    () => ({
      [ZoomLevelInView.ONE]: minZoomData,
      [ZoomLevelInView.TWO]: medZoomData,
      [ZoomLevelInView.THREE]: maxZoomData,
    }),
    [minZoomData, medZoomData, maxZoomData],
  );

  const getStreetSegmentsForZoomLevel = useCallback(
    (zoomLevel: number) => {
      const zoomLevelInView = getZoomLevelInView(zoomLevel);
      if (!(zoomLevelInView in config)) {
        return [];
      }
      return config[zoomLevelInView];
    },
    [config],
  );
  return {
    getStreetSegmentsForZoomLevel,
  };
};
