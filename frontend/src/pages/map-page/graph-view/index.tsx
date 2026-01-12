import React from "react";
// import type { StreetData } from "../hooks/use-crash-data-for-streets";

import { GraphList } from "./graph-list";
import { useTrafficCrashesData } from "../store/graph-data";
import { GraphFilters } from "./graph-filters";
import { Flex, Typography } from "antd";
import { ContainerOutlined } from "@ant-design/icons";

interface GraphViewParams {
  isLoading: boolean;
}

export const GraphView = ({
  isLoading,
}: GraphViewParams): React.JSX.Element => {
  const trafficCrashGroupData = useTrafficCrashesData();

  if (isLoading) {
    return <div></div>;
  }
  if (trafficCrashGroupData.length === 0) {
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
