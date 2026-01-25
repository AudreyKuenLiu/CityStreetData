import React from "react";

import { GraphList } from "./graph-list/graph-list";
import { DataFilters } from "./graph-list/data-filters";
import { useTrafficCrashesData } from "../store/graph-data";
import { Flex, Typography } from "antd";
import { ContainerOutlined } from "@ant-design/icons";
import { useStreetGroups } from "../store/street-map-data-form";
import { useDataViewContext } from "../context/data-view";
import { DataViewEnum } from "../context/data-view/types";
import { HeatmapView } from "./heatmap-view";

const useHasNoData = (): boolean => {
  const trafficCrashData = useTrafficCrashesData();
  const streetGroups = useStreetGroups();
  const trafficCrashGroupIds = trafficCrashData.map(({ id }) => id);
  for (const crashGroupId of trafficCrashGroupIds) {
    if (streetGroups.has(crashGroupId)) {
      return false;
    }
  }
  return true;
};

export const DataView = (): React.JSX.Element => {
  const hasNoData = useHasNoData();
  if (hasNoData) {
    return (
      <Flex
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ContainerOutlined style={{ fontSize: "64px", color: "gray" }} />
        <Typography.Title level={3} type="secondary">
          No Data
        </Typography.Title>
      </Flex>
    );
  }
  return (
    <Flex
      style={{
        overflow: "scroll",
        padding: "16px",
        // flexWrap: "wrap",
        // alignContent: "flex-start",
        // gap: "20px",
        height: "100vh",
      }}
    >
      <DataViewBody />
    </Flex>
  );
};

const DataViewBody = (): React.JSX.Element => {
  const { currentDataView } = useDataViewContext();
  if (currentDataView === DataViewEnum.GraphView) {
    return (
      <Flex
        style={{
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: "20px",
        }}
      >
        <DataFilters />
        <GraphList />
      </Flex>
    );
  }
  if (currentDataView === DataViewEnum.HeatmapView) {
    return <HeatmapView />;
  }
  return <GraphList />;
};
