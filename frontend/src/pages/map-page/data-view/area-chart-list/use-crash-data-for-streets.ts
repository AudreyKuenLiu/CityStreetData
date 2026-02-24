import { useMemo, useEffect } from "react";
import axios from "axios";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useActions } from "../../store/street-map-data-form";
import { CrashStats, StreetFeature } from "../../../../models/api-models";
import {
  useActions as useGraphDataActions,
  GraphGroupData,
} from "../../store/area-chart-list-data";
import { GroupId, StreetGroup } from "../../store/street-map-data-form/types";
import { length } from "@turf/turf";
import { useDataViewContext } from "../../context/data-view";

const getTotalMiles = (
  streetGroups: Map<GroupId, StreetGroup>,
): Map<GroupId, number> => {
  return new Map(
    streetGroups.entries().map(([groupId, streetGroup]) => {
      let totalMiles = 0;
      for (const cnn of streetGroup.cnns) {
        const [, streetSegment] = cnn;
        totalMiles += length(
          { type: "Feature", geometry: streetSegment.line, properties: {} },
          { units: "miles" },
        );
      }
      return [groupId, totalMiles];
    }),
  );
};

export const useCrashDataForStreets = (): void => {
  const {
    selectedTimeSegment: timeSegment,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedIsDirtyHash,
  } = useDataViewContext();
  const [startTime, endTime] = selectedStartEndTime ?? [undefined, undefined];
  const streetGroups = selectedStreetGroups ?? new Map();
  const { resetIsDirty } = useActions();
  const { setGraphData } = useGraphDataActions();

  const result = useSuspenseQuery({
    queryKey: [
      "crashDataForStreets",
      startTime,
      endTime,
      streetGroups,
      timeSegment,
      selectedIsDirtyHash,
    ],
    gcTime: 0,
    queryFn: async (): Promise<{
      graphData: GraphGroupData;
    }> => {
      const allResults = Array.from(streetGroups.values()).map(
        async (streetGroup) => {
          const cnns = Array.from(streetGroup.cnns.keys());
          if (
            cnns.length === 0 ||
            startTime == null ||
            endTime == null ||
            timeSegment == null
          ) {
            return {
              id: streetGroup.id,
            };
          }
          console.log("calling again in api");

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
      const groupsToTotalMiles = getTotalMiles(streetGroups);

      for (const res of responses) {
        const { id, data } = res;
        const [crashData] = data ?? [];
        graphDataMap.set(id, {
          totalMiles: groupsToTotalMiles.get(id) ?? 0,
          dateCrashStats: crashData ?? [],
        });
      }

      return { graphData: graphDataMap };
    },
  });

  const groupCrashes = useMemo(() => {
    const data = result.data;
    return data?.graphData ?? new Map();
  }, [result.data]);

  useEffect(() => {
    if (result.isSuccess) {
      console.log("setting graph data");
      setGraphData(groupCrashes);
      resetIsDirty();
    }
  }, [result.isSuccess, groupCrashes, setGraphData, resetIsDirty]);
};
