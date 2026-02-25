import { useMemo, useEffect } from "react";
import axios from "axios";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CrashEventFeatureCollection } from "../../../../models/api-models";
import { useActions as useHeatmapDataActions } from "../../store/heatmap-data";
import type { HeatmapGroupData } from "../../store/heatmap-data";
import { useDataViewContext } from "../../context/data-view";
import { useActions } from "../../store/street-map-data-form";

export const useCrashEventsForStreets = (): void => {
  const {
    selectedTimeSegment: timeSegment,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedIsDirtyHash,
  } = useDataViewContext();
  const [startTime, endTime] = selectedStartEndTime ?? [undefined, undefined];
  const streetGroups = selectedStreetGroups ?? new Map();
  const { resetIsDirty } = useActions();

  const { setHeatmapData } = useHeatmapDataActions();

  const result = useSuspenseQuery({
    queryKey: [
      "crashEventsForStreets",
      timeSegment,
      startTime?.toISOString(),
      endTime?.toISOString(),
      streetGroups,
      selectedIsDirtyHash,
    ],
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

  const groupCrashes = useMemo(() => {
    const data = result.data;
    const newMap: HeatmapGroupData = new Map();
    return data?.crashEvents ?? newMap;
  }, [result.data]);

  useEffect(() => {
    if (result.isSuccess) {
      console.log("setting heatmap data");
      setHeatmapData({
        data: groupCrashes,
      });
      resetIsDirty();
    }
  }, [result.isSuccess, setHeatmapData, groupCrashes, resetIsDirty]);
};
