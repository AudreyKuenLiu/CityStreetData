import { useQuery } from "@tanstack/react-query";
import {
  getBoundingBoxInView,
  getZoomLevelInView,
  ZoomLevelInView,
} from "../../../models/map-grid";
import axios from "axios";
import { useRef } from "react";

export enum classcode {
  Other,
  Freeways,
  HighwayOrMajorStreet,
  Arterial,
  Collector,
  Residential,
  FreewayRamp,
}

type ApiSegmentsReturnObj = {
  cnn: number;
  street: string;
  line: {
    type: string;
    coordinates: number[][];
  };
};

type useStreetSegmentsForViewportParams = {
  nePoint: [number, number];
  swPoint: [number, number];
  zoomLevel: number;
};

type useStreetSegmentsForViewportReturn = {
  streetSegments: ApiSegmentsReturnObj[];
  isLoading: boolean;
};

const zoomLevelToClassCodes = (zoomLevel: number): classcode[] => {
  const zoomInView = getZoomLevelInView(zoomLevel);
  const classcodeViewOne = [
    classcode.Freeways,
    classcode.HighwayOrMajorStreet,
    classcode.FreewayRamp,
  ];
  const classcodeViewTwo = [
    ...classcodeViewOne,
    classcode.Arterial,
    classcode.Collector,
  ];
  const classcodeViewThree = [
    ...classcodeViewOne,
    ...classcodeViewTwo,
    classcode.Residential,
  ];
  if (zoomInView === ZoomLevelInView.ONE) {
    return classcodeViewOne;
  }
  if (zoomInView === ZoomLevelInView.TWO) {
    return classcodeViewTwo;
  }
  return classcodeViewThree;
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
  const streetSegments = useRef<ApiSegmentsReturnObj[] | null>(null);
  const result = useQuery({
    queryKey: [
      "ping",
      viewedCells[0],
      viewedCells[1],
      viewedCells[2],
      viewedCells[3],
      zoomLevel,
    ] as const,
    queryFn: async () => {
      return await axios.get<ApiSegmentsReturnObj[]>(
        `/api/segmentsForViewport`,
        {
          params: {
            nePoint: [viewedCells[0], viewedCells[1]].toString(),
            swPoint: [viewedCells[2], viewedCells[3]].toString(),
            filters: JSON.stringify({
              classCodes: zoomLevelToClassCodes(zoomLevel),
            }),
          },
        }
      );
    },
    queryKeyHashFn: (queryKey) => {
      const zoomLevelQueryKey = queryKey[5];
      const zoomLevelInView = getZoomLevelInView(zoomLevelQueryKey);
      return `${queryKey[1]}-${queryKey[2]}-${queryKey[3]}-${queryKey[4]}-${zoomLevelInView}`;
    },
    gcTime: 1000 * 60 * 10, //10 minutes
  });
  const { data, isLoading } = result;
  streetSegments.current = data?.data ?? streetSegments.current;

  return {
    streetSegments: streetSegments.current ?? [],
    isLoading,
  };
};
