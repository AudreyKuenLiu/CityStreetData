import React, { Suspense } from "react";

import { AreaChartList } from "./area-chart-list/area-chart-list";
import { ControlPanel } from "./area-chart-list/control-panel";
import { Flex, Typography } from "antd";
import { ContainerOutlined } from "@ant-design/icons";
import { useStreetGroupsRef } from "../store/street-map-data-form";
import { useDataViewContext } from "../context/data-view";
import { DataViewEnum } from "../context/data-view/types";
import { HeatmapView } from "./heatmap-view/heatmap-view";
import { TrendChartList } from "./trend-chart-list/trend-chart-list";
import { LoadingDataView } from "./loading-data-view";
import { useAllCrashEvents } from "./use-all-crash-events";

const useHasNoData = (): boolean => {
  // const trafficCrashData = useTrafficCrashesData();
  // const streetGroups = useStreetGroupsRef();
  // const trafficCrashGroupIds = trafficCrashData.map(({ id }) => id);
  // for (const crashGroupId of trafficCrashGroupIds) {
  //   if (streetGroups.has(crashGroupId)) {
  //     return false;
  //   }
  // }
  // return true;
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
    return (
      <Flex
        style={{
          overflow: "scroll",
          flexWrap: "wrap",
          padding: "16px",
          height: "100vh",
          alignContent: "flex-start",
          gap: "20px",
        }}
      >
        <ControlPanel />
        <AreaChartList />
      </Flex>
    );
  }
  if (currentDataView === DataViewEnum.HeatmapView) {
    return <HeatmapView />;
  }
  if (currentDataView === DataViewEnum.TrendView) {
    return <TrendChartList />;
  }
  return <div></div>;
};
