import { UseDataViewQueryProps } from "./types";
import { DataViewEnum } from "../../../../context/data-view/types";
import type { DataView } from "../../../../context/data-view/types";
// import { useCrashDataForStreets } from "./use-crash-data-for-streets";
import { useCrashEventsForStreets } from "./use-crash-events-for-streets";
import { useIsReady } from "../../../../store/street-map-data-form";
import { useDataViewContext } from "../../../../context/data-view";
import { useCrashTrendsForStreets } from "./use-crash-trends-for-streets";

export const useDataViewQuery = (): UseDataViewQueryProps => {
  const {
    currentDataView,
    setDataView: setCurrentDataView,
    isLoading: isCurrentApiLoading,
    setIsLoading,
  } = useDataViewContext();
  const isReady = useIsReady();
  // const { getData: getCrashes, isLoading: isGetCrashesLoading } =
  //   useCrashDataForStreets();
  const { getData: getCrashEvents, isLoading: isCrashEventsLoading } =
    useCrashEventsForStreets();
  const { getData: getCrashTrends, isLoading: isCrashTrendsLoading } =
    useCrashTrendsForStreets();

  const getData = async (selectedDataView?: DataView): Promise<void> => {
    const dataView = selectedDataView ?? currentDataView;
    // if (
    //   dataView === DataViewEnum.AreaChartView ||
    //   dataView === DataViewEnum.NoView
    // ) {
    //   getCrashes();
    // }
    if (dataView === DataViewEnum.HeatmapView) {
      getCrashEvents();
    }
    if (dataView === DataViewEnum.TrendView) {
      getCrashTrends();
    }
    return;
  };

  //let isLoading: boolean = isGetCrashesLoading;
  let isLoading = false;
  if (currentDataView === DataViewEnum.HeatmapView) {
    isLoading = isCrashEventsLoading;
  }
  if (currentDataView === DataViewEnum.TrendView) {
    isLoading = isCrashTrendsLoading;
  }
  if (isLoading !== isCurrentApiLoading) {
    setIsLoading(isLoading);
  }

  return {
    currentDataView,
    setDataView: setCurrentDataView,
    canGetData: isReady,
    getData,
    isLoading,
  };
};
