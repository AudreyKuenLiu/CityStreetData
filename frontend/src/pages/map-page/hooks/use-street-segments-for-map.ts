import { useSuspenseQueries } from "@tanstack/react-query";
import axios from "axios";
import { ViewportSegment } from "../map-view/api-models/segments-for-viewport";
import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../../constants/map-dimensions";
import { classcode } from "../map-view/api-models/segments-for-viewport";
import { ZoomLevelInView, InitializeCityGrid } from "../../../models/map-grid";
import type { CityGrid } from "../../../models/map-grid";

type useStreetSegmentsForMapReturn = {
  mapConfig: {
    zoomLevelInView: ZoomLevelInView;
    cityGrid: CityGrid;
  }[];
};

export const useStreetSegmentsForMap = (): useStreetSegmentsForMapReturn => {
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
        queryFn: async (): Promise<
          import("axios").AxiosResponse<ViewportSegment[]>
        > => {
          console.log("getting classcodes", classCodes);
          return await axios.get<ViewportSegment[]>(
            `/api/segmentsForViewport`,
            {
              params: {
                nePoint: [
                  SanFranciscoNEPoint[0],
                  SanFranciscoNEPoint[1],
                ].toString(),
                swPoint: [
                  SanFranciscoSWPoint[0],
                  SanFranciscoSWPoint[1],
                ].toString(),
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
  const minZoomData = combinedQueries[0].data;
  const medZoomData = combinedQueries[1].data;
  const maxZoomData = combinedQueries[2].data;

  console.log(
    "initializing the data",
    combinedQueries,
    minZoomData,
    medZoomData,
    maxZoomData
  );

  const minZoomGrid = InitializeCityGrid({
    cellSizeKilometers: 4,
    cityBBox: [...SanFranciscoSWPoint, ...SanFranciscoNEPoint],
    streetSegments: minZoomData.data,
  });
  const medZoomGrid = InitializeCityGrid({
    cellSizeKilometers: 2,
    cityBBox: [...SanFranciscoSWPoint, ...SanFranciscoNEPoint],
    streetSegments: medZoomData.data,
  });
  const maxZoomGrid = InitializeCityGrid({
    cellSizeKilometers: 0.5,
    cityBBox: [...SanFranciscoSWPoint, ...SanFranciscoNEPoint],
    streetSegments: maxZoomData.data,
  });

  return {
    mapConfig: [
      { zoomLevelInView: ZoomLevelInView.ONE, cityGrid: minZoomGrid },
      { zoomLevelInView: ZoomLevelInView.TWO, cityGrid: medZoomGrid },
      { zoomLevelInView: ZoomLevelInView.THREE, cityGrid: maxZoomGrid },
    ],
  };
};
