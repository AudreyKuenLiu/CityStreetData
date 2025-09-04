import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

export const useStreetSegmentsForViewport = () => {
  const { data } = useSuspenseQuery({
    queryKey: ["ping"],
    queryFn: async () => {
      return await axios.get("/api/ping");
    },
  });
  return data;
};
