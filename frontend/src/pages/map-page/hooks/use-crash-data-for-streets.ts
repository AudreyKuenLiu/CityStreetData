import { useMemo, useState, useCallback, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { dataTagSymbol, useQuery } from "@tanstack/react-query";
import {
  useEndDate,
  useIsReady,
  useStartDate,
  useStreetGroups,
  useTimeSegment,
} from "../store/street-map-data-form";
import { dateToPacificRFC3339Time } from "../../../utils";
import {
  collisionTypeSchema,
  collisionSeveritySchema,
  ApiCrashEvents,
  CrashEvents,
  CrashStats,
} from "../../../models/api-models";
import { GroupId } from "../store/constants";

type DateCrashStats = readonly [Date, CrashStats];
export type StreetData = Map<GroupId, DateCrashStats[]>;

interface useCrashDataForStreetsReturn {
  canGetCrashes: boolean;
  getCrashes: () => Promise<void>;
  isSuccess: boolean;
  isLoading: boolean;
  data: StreetData;
}

export const useCrashDataForStreets = (): useCrashDataForStreetsReturn => {
  const streetGroups = useStreetGroups();
  const startTime = useStartDate();
  const endTime = useEndDate();
  const timeSegment = useTimeSegment();
  const isReady = useIsReady();

  //console.log("these are the street groups", streetGroups);

  // const oldResult = useQuery({
  //   queryKey: ["crashesForCnns", startTime, endTime, streetGroups],
  //   enabled: false,
  //   queryFn: async (): Promise<{ id: GroupId; response: CrashEvents[] }[]> => {
  //     const pacificStartTime = dateToPacificRFC3339Time(startTime);
  //     const pacificEndTime = dateToPacificRFC3339Time(endTime);
  //     const allResults = Array.from(streetGroups.values()).map(
  //       async (streetGroup) => {
  //         const cnns = Array.from(streetGroup.cnns.keys());
  //         if (cnns.length === 0) {
  //           return {
  //             id: streetGroup.id,
  //             response: [],
  //           };
  //         }

  //         const response = await axios.get<ApiCrashEvents[]>(
  //           `/api/crashesForCnns`,
  //           {
  //             params: {
  //               cnns: JSON.stringify(cnns),
  //               startTime: pacificStartTime,
  //               endTime: pacificEndTime,
  //             },
  //           }
  //         );

  //         return {
  //           id: streetGroup.id,
  //           response: response.data.map((data) => {
  //             return {
  //               cnn: data.cnn,
  //               occuredAt:
  //                 data.occured_at != null ? new Date(data.occured_at) : null,
  //               collisionSeverity:
  //                 data.collision_severity != null
  //                   ? collisionSeveritySchema.parse(data.collision_severity)
  //                   : data.collision_severity,
  //               collisionType:
  //                 data.collision_type != null
  //                   ? collisionTypeSchema.parse(data.collision_type)
  //                   : data.collision_type,
  //               numberKilled: data.number_killed,
  //               numberInjured: data.number_injured,
  //             };
  //           }),
  //         };
  //       }
  //     );
  //     return Promise.all(allResults);
  //   },
  // });

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
    queryFn: async (): Promise<
      { id: GroupId; response: DateCrashStats[] }[]
    > => {
      // const pacificStartTime = dateToPacificRFC3339Time(startTime);
      // const pacificEndTime = dateToPacificRFC3339Time(endTime);
      // console.log(
      //   "this is the startTime, endTime",
      //   startTime,
      //   pacificStartTime
      // );
      const allResults = Array.from(streetGroups.values()).map(
        async (streetGroup) => {
          const cnns = Array.from(streetGroup.cnns.keys());
          if (cnns.length === 0 || startTime == null || endTime == null) {
            return {
              id: streetGroup.id,
              response: [],
            };
          }

          const response = await axios.get<{ [key: number]: CrashStats }>(
            `/api/crashDataForStreets`,
            {
              params: {
                cnns: JSON.stringify(cnns),
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                timeSegment,
              },
            }
          );
          return {
            id: streetGroup.id,
            response: Array.from(Object.entries(response.data)).map(
              ([unixTimestampSeconds, crashStats]) => {
                const date = new Date(+unixTimestampSeconds * 1000);
                return [date, crashStats] as const;
              }
            ),
          };
        }
      );
      console.log("these are the promise map", allResults);
      return Promise.all(allResults);
    },
  });

  const getCrashes = async (): Promise<void> => {
    console.log("calling refetch again");
    //await oldResult.refetch();
    await result.refetch();
  };
  const groupCrashes = useMemo(() => {
    const data = result.data ?? [];
    const groupCrashesMap = new Map<GroupId, DateCrashStats[]>();
    for (const dataGroup of data) {
      groupCrashesMap.set(dataGroup.id, dataGroup.response);
    }
    return groupCrashesMap;
  }, [result.data]);

  return {
    getCrashes,
    canGetCrashes: isReady,
    isSuccess: result.isSuccess,
    isLoading: result.isLoading,
    data: groupCrashes,
  };
};
