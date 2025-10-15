import { useCallback, useMemo } from "react";
import axios, { AxiosResponse } from "axios";
import { useQuery, useQueries } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  useEndDate,
  useIsReady,
  useStartDate,
  useStreetGroups,
} from "../store/street-map-data-form";
import { dateToPacificRFC3339Time } from "../../../utils";

interface useCrashDataForStreetsReturn {
  canGetCrashes: boolean;
  getCrashes: () => Promise<void>;
  isLoading: boolean;
}

//figure out why there is a infinite rerender bug
export const useCrashDataForStreets = (): useCrashDataForStreetsReturn => {
  const streetGroups = useStreetGroups();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const isReady = useIsReady();
  console.log(
    "this is the streetGroups",
    streetGroups,
    startTime,
    endTime,
    isReady
  );

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
    queryFn: async (): Promise<{ id: string; response: AxiosResponse }[]> => {
      const pacificStartTime = dateToPacificRFC3339Time(startTime);
      const pacificEndTime = dateToPacificRFC3339Time(endTime);
      const allResults = Array.from(streetGroups.values()).map(
        async (streetGroup) => {
          const cnns = Array.from(streetGroup.cnns.keys());
          const response = await axios.get(`/api/crashesForCnns`, {
            params: {
              cnns: JSON.stringify(cnns),
              startTime: pacificStartTime,
              endTime: pacificEndTime,
            },
          });
          return {
            id: streetGroup.id,
            response,
          };
        }
      );
      return Promise.all(allResults);
    },
  });
  const getCrashes = async (): Promise<void> => {
    await result.refetch();
  };

  return {
    getCrashes,
    canGetCrashes: isReady,
    isLoading: result.isLoading,
  };

  // const queriesConfig = useMemo(() => {
  //   return Array.from(streetGroups.values()).map((streetGroup) => {
  //     const cnns = Array.from(streetGroup.cnns.keys());
  //     return {
  //       queryKey: ["crashesForCnns", cnns, startTime, endTime] as const,
  //       staleTime: Infinity,
  //       enabled: false,
  //       queryFn: async (): Promise<{ id: string; response: AxiosResponse }> => {
  //         const pacificStartTime = dateToPacificRFC3339Time(startTime);
  //         const pacificEndTime = dateToPacificRFC3339Time(endTime);
  //         const response = await axios.get(`/api/crashesForCnns`, {
  //           params: {
  //             cnns: JSON.stringify(cnns),
  //             startTime: pacificStartTime,
  //             endTime: pacificEndTime,
  //           },
  //         });
  //         return {
  //           id: streetGroup.id,
  //           response,
  //         };
  //       },
  //     };
  //   });
  // }, [startTime, endTime, streetGroups]);

  // const results = useQueries({
  //   queries: queriesConfig,
  //   combine: (results) => {
  //     const getCrashes = async (): Promise<void> => {
  //       const refetchQueries = results.map((result) => {
  //         return result.refetch;
  //       });
  //       await Promise.all(
  //         refetchQueries.map((refetchQuery) => {
  //           return refetchQuery();
  //         })
  //       );
  //     };

  //     const isLoading = results
  //       .map((result) => {
  //         return result.isLoading;
  //       })
  //       .some((isOneLoading) => isOneLoading);

  //     const data = results.map((result) => {
  //       return result.data;
  //     });

  //     return {
  //       getCrashes,
  //       isLoading,
  //       data,
  //     };
  //   },
  // });

  // return {
  //   getCrashes: results.getCrashes,
  //   isLoading: results.isLoading,
  //   canGetCrashes: isReady,
  // };

  // return {
  //   getCrashes: async (): Promise<void> => {
  //     return;
  //   },
  //   isLoading: false,
  //   canGetCrashes: isReady,
  // };
};
