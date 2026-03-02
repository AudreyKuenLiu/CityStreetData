import { useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiCrashEventPoint } from "../../../models/api-models";
import { useActions as useHeatmapActions } from "../store/heatmap-data";
import { useActions } from "../store/street-map-data-form";
import { useActions as useAreaChartListAction } from "../store/area-chart-list-data";
import { useActions as useTrendChartListAction } from "../store/trend-chart-list-data";
import { useEffect } from "react";
import { CrashMap } from "../../../models/map-models";
import { useDataViewContext } from "../context/data-view";
import { DataViewEnum } from "../context/data-view/types";
import { TimeSegments } from "../store/street-map-data-form";

export const useAllCrashEvents = (): void => {
  const { initializeHeatmap } = useHeatmapActions();
  const { initializeGraphData } = useAreaChartListAction();
  const { initializeGraphData: initializeChartGraphData } =
    useTrendChartListAction();
  const {
    selectedStreetGroups,
    selectedStartEndTime,
    currentDataView,
    selectedTimeSegment,
  } = useDataViewContext();
  const { resetIsDirty } = useActions();

  const result = useSuspenseQuery({
    queryKey: ["allCrashEvents"],
    gcTime: Infinity,
    staleTime: Infinity,
    queryFn: async (): Promise<CrashMap> => {
      const result = await axios.get<ApiCrashEventPoint[]>(
        `/api/streets/crashevents/all`,
      );

      const cnnMap = new Map<number, ApiCrashEventPoint[]>();
      for (const crashEvent of result.data) {
        const arr = cnnMap.get(crashEvent.cnn) ?? [];
        arr.push(crashEvent);
        cnnMap.set(crashEvent.cnn, arr);
      }

      return cnnMap;
    },
  });

  useEffect(() => {
    if (result.data == null) {
      return;
    }
    if (currentDataView === DataViewEnum.HeatmapView) {
      console.log("reinitializing map");
      initializeHeatmap({
        data: result.data,
        selectedStartEndTime: selectedStartEndTime ?? [new Date(), new Date()],
        selectedStreetGroups: selectedStreetGroups ?? new Map(),
        selectedTimeSegment: selectedTimeSegment ?? TimeSegments.OneYear,
      });
    }
    if (currentDataView === DataViewEnum.AreaChartView) {
      console.log("reinitializing areachart");
      initializeGraphData({
        data: result.data,
        selectedStartEndTime: selectedStartEndTime ?? [new Date(), new Date()],
        selectedStreetGroups: selectedStreetGroups ?? new Map(),
        selectedTimeSegment: selectedTimeSegment ?? TimeSegments.OneYear,
      });
    }
    if (currentDataView === DataViewEnum.TrendView) {
      console.log("reinitializing trendView");
      initializeChartGraphData({
        data: result.data,
        selectedStartEndTime: selectedStartEndTime ?? [new Date(), new Date()],
        selectedStreetGroups: selectedStreetGroups ?? new Map(),
        selectedTimeSegment: selectedTimeSegment ?? TimeSegments.OneYear,
      });
    }
    resetIsDirty();
  }, [
    result.data,
    initializeHeatmap,
    initializeGraphData,
    initializeChartGraphData,
    currentDataView,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedTimeSegment,
    resetIsDirty,
  ]);
};
