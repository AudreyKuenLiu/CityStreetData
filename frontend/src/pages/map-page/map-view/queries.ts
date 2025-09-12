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
  const { data } = result;
  const streetSegments = data?.data ?? [];

  return {
    streetSegments,
  };
};
