import { useQuery } from "@tanstack/react-query";
import {
  getBoundingBoxInView,
  getZoomLevelInView,
  ZoomLevelInView,
} from "../../../../models/map-grid";
import axios from "axios";
import { useRef } from "react";
import { classcode, ViewportSegment } from "../../../../models/api-models";

type useStreetSegmentsForViewportParams = {
  nePoint: [number, number];
  swPoint: [number, number];
  zoomLevel: number;
};

type useStreetSegmentsForViewportReturn = {
  streetSegments: ViewportSegment[];
  isLoading: boolean;
};

const zoomLevelToClassCodes = (zoomLevel: number): classcode[] => {
  const zoomInView = getZoomLevelInView(zoomLevel);
  const classcodeViewOne = [
    classcode.Freeways,
    classcode.HighwayOrMajorStreet,
    classcode.FreewayRamp,
  ];
  const classcodeViewTwo = [classcode.Arterial, classcode.Collector];
  const classcodeViewThree = [classcode.Residential];
  if (zoomInView === ZoomLevelInView.ONE) {
    return classcodeViewOne;
  }
  if (zoomInView === ZoomLevelInView.TWO) {
    return [...classcodeViewOne, ...classcodeViewTwo];
  }
  return [...classcodeViewOne, ...classcodeViewTwo, ...classcodeViewThree];
};

export const useStreetSegmentsForViewport = ({
  nePoint,
  swPoint,
  zoomLevel,
}: useStreetSegmentsForViewportParams): useStreetSegmentsForViewportReturn => {
  const viewedCells = getBoundingBoxInView({
    bbox: [...nePoint, ...swPoint],
    zoomLevel,
  });
  const streetSegments = useRef<ViewportSegment[] | null>(null);
  const result = useQuery({
    queryKey: [
      "segmentsForViewport",
      viewedCells[0],
      viewedCells[1],
      viewedCells[2],
      viewedCells[3],
      zoomLevel,
    ] as const,
    queryFn: async () => {
      return await axios.get<ViewportSegment[]>(`/api/segmentsForViewport`, {
        params: {
          nePoint: [viewedCells[0], viewedCells[1]].toString(),
          swPoint: [viewedCells[2], viewedCells[3]].toString(),
          filters: JSON.stringify({
            classCodes: zoomLevelToClassCodes(zoomLevel),
          }),
        },
      });
    },
    queryKeyHashFn: (queryKey) => {
      const zoomLevelQueryKey = queryKey[5];
      const zoomLevelInView = getZoomLevelInView(zoomLevelQueryKey);
      return `${queryKey[1]}-${queryKey[2]}-${queryKey[3]}-${queryKey[4]}-${zoomLevelInView}`;
    },
  });
  const { data, isLoading } = result;
  streetSegments.current = data?.data ?? streetSegments.current;

  return {
    streetSegments: streetSegments.current ?? [],
    isLoading,
  };
};
