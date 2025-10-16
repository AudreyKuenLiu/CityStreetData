import { useQuery } from "@tanstack/react-query";
import {
  getBoundingBoxInView,
  getZoomLevelInView,
  ZoomLevelInView,
} from "../../../../models/map-grid";
import axios from "axios";
import { useRef } from "react";
import { classCode, ViewportSegment } from "../../../../models/api-models";

type useStreetSegmentsForViewportParams = {
  nePoint: [number, number];
  swPoint: [number, number];
  zoomLevel: number;
};

type useStreetSegmentsForViewportReturn = {
  streetSegments: ViewportSegment[];
  isLoading: boolean;
};

const zoomLevelToclassCodes = (zoomLevel: number): classCode[] => {
  const zoomInView = getZoomLevelInView(zoomLevel);
  const classCodeViewOne = [
    classCode.Freeways,
    classCode.HighwayOrMajorStreet,
    classCode.FreewayRamp,
  ];
  const classCodeViewTwo = [classCode.Arterial, classCode.Collector];
  const classCodeViewThree = [classCode.Residential];
  if (zoomInView === ZoomLevelInView.ONE) {
    return classCodeViewOne;
  }
  if (zoomInView === ZoomLevelInView.TWO) {
    return [...classCodeViewOne, ...classCodeViewTwo];
  }
  return [...classCodeViewOne, ...classCodeViewTwo, ...classCodeViewThree];
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
            classCodes: zoomLevelToclassCodes(zoomLevel),
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
