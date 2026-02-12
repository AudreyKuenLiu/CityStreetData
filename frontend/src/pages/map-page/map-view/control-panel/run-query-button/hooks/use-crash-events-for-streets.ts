import { useMemo } from "react";
import { UseDataViewControllerProps } from "./types";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useActions,
  useEndDate,
  useStartDate,
  useStreetGroupsRef,
  useTimeSegment,
} from "../../../../store/street-map-data-form";
import { useEffect } from "react";
import { CrashEventFeatureCollection } from "../../../../../../models/api-models";
import { useActions as useHeatmapDataActions } from "../../../../store/heatmap-data";
import type { HeatmapGroupData } from "../../../../store/heatmap-data";

export const useCrashEventsForStreets = (): UseDataViewControllerProps => {
  const streetGroups = useStreetGroupsRef();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const timeSegment = useTimeSegment();
  const { resetIsDirty } = useActions();
  const { setHeatmapData } = useHeatmapDataActions();

  const result = useQuery({
    queryKey: ["crashEventsForStreets", startTime, endTime, streetGroups],
    enabled: false,
    gcTime: 0,
    queryFn: async (): Promise<{
      crashEvents: HeatmapGroupData;
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
            data: { [key: number]: CrashEventFeatureCollection };
          }>(`/api/streets/crashevents`, {
            params: {
              cnns: JSON.stringify(cnns),
              startTime: startTime.getTime() / 1000,
              endTime: endTime.getTime() / 1000,
              timeSegment: timeSegment,
            },
          });

          const crashEvents = Array.from(
            Object.entries(response.data.data),
          ).map(([unixTimestampSeconds, crashEvent]) => {
            const date = new Date(+unixTimestampSeconds * 1000);
            return [date, crashEvent] as const;
          });

          return {
            id: streetGroup.id,
            data: crashEvents,
          };
        },
      );

      const responses = await Promise.all(allResults);
      const graphDataMap: HeatmapGroupData = new Map();

      for (const res of responses) {
        const { id, data } = res;
        graphDataMap.set(id, data ?? []);
      }

      return { crashEvents: graphDataMap };
    },
  });

  const getCrashEvents = async (): Promise<void> => {
    await result.refetch();
    resetIsDirty();
  };

  const groupCrashes = useMemo(() => {
    const data = result.data;
    const newMap: HeatmapGroupData = new Map();
    return data?.crashEvents ?? newMap;
  }, [result.data]);

  useEffect(() => {
    if (result.isSuccess) {
      setHeatmapData({
        data: groupCrashes,
      });
    }
  }, [
    result.isSuccess,
    setHeatmapData,
    groupCrashes,
    endTime,
    startTime,
    timeSegment,
  ]);

  return {
    getData: getCrashEvents,
    isLoading: result.isLoading,
  };
};
