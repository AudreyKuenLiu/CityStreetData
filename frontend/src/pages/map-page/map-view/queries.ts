import { useQuery } from "@tanstack/react-query";
import { getCellsInSanFranciscoBoundingBox } from "./utils/mapControls";
import axios from "axios";

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

export const useStreetSegmentsForViewport = ({
  nePoint,
  swPoint,
  zoomLevel,
}: useStreetSegmentsForViewportParams): useStreetSegmentsForViewportReturn => {
  const viewedCells = getCellsInSanFranciscoBoundingBox({
    bbox: [...nePoint, ...swPoint],
    zoomLevel,
  });
  console.log("viewedCells", viewedCells);
  const result = useQuery({
    queryKey: ["ping", nePoint, swPoint, zoomLevel],
    queryFn: async () => {
      return await axios.get<ApiSegmentsReturnObj[]>(`/api/segments`, {
        params: {
          nePoint: nePoint.toString(),
          swPoint: swPoint.toString(),
          zoomLevel: zoomLevel.toString(),
        },
      });
    },
    gcTime: 0, // don't cache data in react tanstack, we will cache it
  });
  const { data, isLoading } = result;
  const streetSegments = data?.data ?? [];

  return {
    streetSegments,
    isLoading,
  };
};
