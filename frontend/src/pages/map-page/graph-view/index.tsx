import React from "react";

import { GraphList } from "./graph-list";
import { useTrafficCrashesData } from "../store/graph-data";
import { GraphFilters } from "./graph-filters";
import { Flex, Typography } from "antd";
import { ContainerOutlined } from "@ant-design/icons";
import { useStreetGroups } from "../store/street-map-data-form";

interface GraphViewParams {
  isLoading: boolean;
}

const useHasNoData = (): boolean => {
  const trafficCrashData = useTrafficCrashesData();
  const streetGroups = useStreetGroups();
  const trafficCrashGroupIds = trafficCrashData.map(([id]) => id);
  for (const crashGroupId of trafficCrashGroupIds) {
    if (streetGroups.has(crashGroupId)) {
      return false;
    }
  }
  return true;
};

export const GraphView = ({
  isLoading,
}: GraphViewParams): React.JSX.Element => {
  const hasNoData = useHasNoData();
  if (isLoading) {
    return <div></div>;
  }
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
        flexWrap: "wrap",
        alignContent: "flex-start",
        gap: "20px",
        height: "100vh",
      }}
    >
      <GraphFilters />
      <GraphList />
    </Flex>
  );
};
