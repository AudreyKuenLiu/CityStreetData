import { useQuery } from "@tanstack/react-query";
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
  nePoint?: [number, number];
  swPoint?: [number, number];
  zoomLevel?: number;
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
  const result = useQuery({
    queryKey: ["ping", nePoint, swPoint, zoomLevel],
    queryFn: async () => {
      if (nePoint == null || swPoint == null || zoomLevel == null) {
        return null;
      }
      return await axios.get<ApiSegmentsReturnObj[]>(`/api/segments`, {
        params: {
          nePoint: nePoint.toString(),
          swPoint: swPoint.toString(),
          zoomLevel: zoomLevel.toString(),
        },
      });
    },
  });
  const { data, isLoading } = result;
  const streetSegments = data?.data ?? [];
  console.log("this is the result", result);

  return {
    streetSegments,
    isLoading,
  };
};
