import { useEffect, useMemo } from "react";
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
import { CrashEventFeatureCollection } from "../../../../../../models/api-models";
import type { GroupTrendData } from "../../../../store/trend-chart-list-data";
import { useActions as useTrendChartListActions } from "../../../../store/trend-chart-list-data";

export const useCrashTrendsForStreets = (): UseDataViewControllerProps => {
  const streetGroups = useStreetGroupsRef();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const timeSegment = useTimeSegment();
  const { resetIsDirty } = useActions();
  const { setGraphData } = useTrendChartListActions();

  const result = useQuery({
    queryKey: [
      "crashTrendsForStreets",
      startTime,
      endTime,
      streetGroups,
      timeSegment,
    ],
    enabled: false,
    gcTime: 0,
    queryFn: async (): Promise<GroupTrendData> => {
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
          } as const;
        },
      );

      const responses = await Promise.all(allResults);
      const groupTrendData: GroupTrendData = new Map();

      for (const res of responses) {
        const { id, data } = res;
        const dataArr = data?.map(([date, crashEventFeatureCollection]) => {
          return {
            timeSegment: date,
            crashStats: crashEventFeatureCollection.features.map((feature) => {
              return {
                crashClassification: feature.properties.crash_classification,
                collisionSeverity: feature.properties.collision_severity,
                numberInjured: feature.properties.number_injured,
                numberKilled: feature.properties.number_killed,
                occuredAt: new Date(+feature.properties.occured_at * 1000),
              };
            }),
          };
        });
        groupTrendData.set(id, dataArr ?? []);
      }

      return groupTrendData;
    },
  });

  const getCrashTrends = async (): Promise<void> => {
    await result.refetch();
    resetIsDirty();
  };

  const groupCrashTrends = useMemo(() => {
    const data = result.data;
    return data ?? new Map();
  }, [result.data]);

  useEffect(() => {
    if (result.isSuccess) {
      setGraphData(groupCrashTrends);
    }
  }, [result.isSuccess, groupCrashTrends, setGraphData]);

  return {
    getData: getCrashTrends,
    isLoading: result.isLoading,
  };
};
