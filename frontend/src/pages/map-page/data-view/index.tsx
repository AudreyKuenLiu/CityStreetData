import React, { Suspense } from "react";

const AreaChartList = React.lazy(() =>
  import("./area-chart-list/area-chart-list").then((module) => ({
    default: module.AreaChartList,
  })),
);
const TrendChartList = React.lazy(() =>
  import("./trend-chart-list/trend-chart-list").then((module) => ({
    default: module.TrendChartList,
  })),
);
const HeatmapView = React.lazy(() =>
  import("./heatmap-view/heatmap-view").then((module) => ({
    default: module.HeatmapView,
  })),
);
import { Flex } from "antd";
import { useStreetGroupsRef } from "../store/street-map-data-form";
import { useDataViewContext } from "../context/data-view";
import { DataViewEnum } from "../context/data-view/types";
import { LoadingDataView } from "./loading-data-view";
import { useAllCrashEvents } from "./use-all-crash-events";

const useHasNoData = (): boolean => {
  const streetGroups = useStreetGroupsRef();
  return streetGroups.size === 0;
};

export const DataView = (): React.JSX.Element => {
  return (
    <Suspense fallback={<LoadingDataView />}>
      <Flex style={{ position: "relative" }}>
        <DataViewBody />
      </Flex>
    </Suspense>
  );
};

const DataViewBody = (): React.JSX.Element => {
  const { currentDataView } = useDataViewContext();
  useAllCrashEvents();
  if (currentDataView === DataViewEnum.AreaChartView) {
    return <AreaChartList />;
  }
  if (currentDataView === DataViewEnum.HeatmapView) {
    return <HeatmapView />;
  }
  if (currentDataView === DataViewEnum.TrendView) {
    return <TrendChartList />;
  }
  return <div></div>;
};
