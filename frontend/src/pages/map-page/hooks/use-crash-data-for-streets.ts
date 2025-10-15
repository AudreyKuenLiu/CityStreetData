import { useMemo } from "react";
import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  useEndDate,
  useIsReady,
  useStartDate,
  useStreetGroups,
} from "../store/street-map-data-form";
import { dateToPacificRFC3339Time } from "../../../utils";
import { CrashEvents } from "../../../models/api-models";
import { GroupId } from "../store/constants";

interface useCrashDataForStreetsReturn {
  canGetCrashes: boolean;
  getCrashes: () => Promise<void>;
  isLoading: boolean;
  data: Map<GroupId, CrashEvents[]>;
}

export const useCrashDataForStreets = (): useCrashDataForStreetsReturn => {
  const streetGroups = useStreetGroups();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const isReady = useIsReady();

  const result = useQuery({
    queryKey: [
      "crashesForCnns",
      "cnns",
      startTime,
      endTime,
      streetGroups,
    ] as const,
    staleTime: Infinity,
    enabled: false,
    queryFn: async (): Promise<{ id: GroupId; response: CrashEvents[] }[]> => {
      const pacificStartTime = dateToPacificRFC3339Time(startTime);
      const pacificEndTime = dateToPacificRFC3339Time(endTime);
      const allResults = Array.from(streetGroups.values()).map(
        async (streetGroup) => {
          const cnns = Array.from(streetGroup.cnns.keys());
          const response = await axios.get<CrashEvents[]>(
            `/api/crashesForCnns`,
            {
              params: {
                cnns: JSON.stringify(cnns),
                startTime: pacificStartTime,
                endTime: pacificEndTime,
              },
            }
          );

          return {
            id: streetGroup.id,
            response: response.data,
          };
        }
      );
      return Promise.all(allResults);
    },
  });
  const getCrashes = async (): Promise<void> => {
    await result.refetch();
  };
  const groupCrashes = useMemo(() => {
    const data = result.data ?? [];
    const groupCrashesMap = new Map<GroupId, CrashEvents[]>();
    for (const dataGroup of data) {
      groupCrashesMap.set(dataGroup.id, dataGroup.response);
    }
    return groupCrashesMap;
  }, [result.data]);

  return {
    getCrashes,
    canGetCrashes: isReady,
    isLoading: result.isLoading,
    data: groupCrashes,
  };
};
