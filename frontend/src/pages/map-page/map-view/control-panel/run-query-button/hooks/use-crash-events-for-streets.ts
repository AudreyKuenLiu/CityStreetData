import { useMemo } from "react";
import { UseDataViewControllerProps } from "./types";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  GroupId,
  useActions,
  useEndDate,
  useStartDate,
  useStreetGroups,
} from "../../../../store/street-map-data-form";
import { useEffect } from "react";
import { CrashEventFeatureCollection } from "../../../../../../models/api-models";

export const useCrashEventsForStreets = (): UseDataViewControllerProps => {
  const streetGroups = useStreetGroups();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const { resetIsDirty } = useActions();

  const result = useQuery({
    queryKey: ["crashEventsForStreets", startTime, endTime, streetGroups],
    enabled: false,
    gcTime: 0,
    queryFn: async (): Promise<{
      crashData: Map<GroupId, CrashEventFeatureCollection>;
    }> => {
      const allResults = Array.from(streetGroups.values()).map(
        async (streetGroup) => {
          const cnns = Array.from(streetGroup.cnns.keys());
          if (cnns.length === 0 || startTime == null || endTime == null) {
            return {
              id: streetGroup.id,
            };
          }

          const crashEvents = await axios.get<CrashEventFeatureCollection>(
            `/api/crashEventsForStreets`,
            {
              params: {
                cnns: JSON.stringify(cnns),
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
              },
            },
          );

          return {
            id: streetGroup.id,
            data: crashEvents.data,
          };
        },
      );

      const responses = await Promise.all(allResults);
      const graphDataMap: Map<GroupId, CrashEventFeatureCollection> = new Map();

      for (const res of responses) {
        const { id, data } = res;
        graphDataMap.set(
          id,
          data ?? {
            type: "FeatureCollection",
            features: [],
          },
        );
      }

      return { crashData: graphDataMap };
    },
  });

  const getCrashEvents = async (): Promise<void> => {
    await result.refetch();
    resetIsDirty();
  };

  const groupCrashes = useMemo(() => {
    const data = result.data;
    return data?.crashData ?? new Map();
  }, [result.data]);

  useEffect(() => {
    if (result.isSuccess) {
    }
  }, [result.isSuccess]);

  return {
    getData: getCrashEvents,
    isLoading: result.isLoading,
  };
};
