import { useSuspenseQueries } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { ViewportSegment } from "../map-view/api-models/segments-for-viewport";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../constants/map-dimensions";
import { classcode } from "../map-view/api-models/segments-for-viewport";
import { ZoomLevelInView, getZoomLevelInView } from "../../../models/map-grid";
import { useCallback, useMemo } from "react";

type useStreetMapControlReturn = {
  getStreetSegmentsForZoomLevel: (zoomLevel: number) => ViewportSegment[];
};

export const useStreetMapControl = (): useStreetMapControlReturn => {
  const classCodesForViews = [
    [classcode.Freeways, classcode.HighwayOrMajorStreet, classcode.FreewayRamp],
    [
      classcode.Freeways,
      classcode.HighwayOrMajorStreet,
      classcode.FreewayRamp,
      classcode.Arterial,
      classcode.Collector,
    ],
    [
      classcode.Freeways,
      classcode.HighwayOrMajorStreet,
      classcode.FreewayRamp,
      classcode.Arterial,
      classcode.Collector,
      classcode.Residential,
    ],
  ];
  const combinedQueries = useSuspenseQueries({
    queries: classCodesForViews.map((classCodes) => {
      return {
        queryKey: ["segmentsForViewport", ...classCodes] as const,
        staleTime: Infinity,
        queryFn: async (): Promise<AxiosResponse<ViewportSegment[]>> => {
          console.log("getting classcodes", classCodes);
          return await axios.get<ViewportSegment[]>(
            `/api/segmentsForViewport`,
            {
              params: {
                nePoint: SanFranciscoNEPoint.toString(),
                swPoint: SanFranciscoSWPoint.toString(),
                filters: JSON.stringify({
                  classCodes,
                }),
              },
            }
          );
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
    [minZoomData, medZoomData, maxZoomData]
  );

  const getStreetSegmentsForZoomLevel = useCallback(
    (zoomLevel: number) => {
      const zoomLevelInView = getZoomLevelInView(zoomLevel);
      if (!(zoomLevelInView in config)) {
        return [];
      }
      return config[zoomLevelInView];
    },
    [config]
  );
  return {
    getStreetSegmentsForZoomLevel,
  };
};
