import { useMemo, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useActions,
  useEndDate,
  useStartDate,
  useStreetGroups,
  useTimeSegment,
} from "../../../../store/street-map-data-form";
import { CrashStats, StreetFeature } from "../../../../../../models/api-models";
import {
  useActions as useGraphDataActions,
  GraphGroupData,
} from "../../../../store/graph-list-data";
import { UseDataViewControllerProps } from "./types";

export const useCrashDataForStreets = (): UseDataViewControllerProps => {
  const streetGroups = useStreetGroups();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const timeSegment = useTimeSegment();
  const { resetIsDirty } = useActions();
  const { setGraphData } = useGraphDataActions();

  const result = useQuery({
    queryKey: [
      "crashDataForStreets",
      startTime,
      endTime,
      streetGroups,
      timeSegment,
    ],
    enabled: false,
    gcTime: 0,
    queryFn: async (): Promise<{
      graphData: GraphGroupData;
    }> => {
      const allResults = Array.from(streetGroups.values()).map(
        async (streetGroup) => {
          const cnns = Array.from(streetGroup.cnns.keys());
          if (cnns.length === 0 || startTime == null || endTime == null) {
            return {
              id: streetGroup.id,
            };
          }

          const response = await axios.get<{
            data: { [key: number]: CrashStats };
            features: { [key: number]: StreetFeature[] };
          }>(`/api/streets/crashdata`, {
            params: {
              cnns: JSON.stringify(cnns),
              startTime: startTime.getTime() / 1000,
              endTime: endTime.getTime() / 1000,
              timeSegment,
            },
          });

          const crashData = Array.from(Object.entries(response.data.data)).map(
            ([unixTimestampSeconds, crashStats]) => {
              const date = new Date(+unixTimestampSeconds * 1000);
              return [date, crashStats] as const;
            },
          );

          return {
            id: streetGroup.id,
            data: [crashData] as const,
          } as const;
        },
      );

      const responses = await Promise.all(allResults);
      const graphDataMap: GraphGroupData = new Map();

      for (const res of responses) {
        const { id, data } = res;
        const [crashData] = data ?? [];
        graphDataMap.set(id, crashData ?? []);
      }

      return { graphData: graphDataMap };
    },
  });

  const getCrashes = async (): Promise<void> => {
    await result.refetch();
    resetIsDirty();
  };

  const groupCrashes = useMemo(() => {
    const data = result.data;
    return data?.graphData ?? new Map();
  }, [result.data]);

  useEffect(() => {
    if (result.isSuccess) {
      setGraphData(groupCrashes);
    }
  }, [result.isSuccess, groupCrashes, setGraphData]);

  return {
    getData: getCrashes,
    isLoading: result.isLoading,
  };
};
