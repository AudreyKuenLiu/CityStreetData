import React from "react";
import type { StreetData } from "../hooks/use-crash-data-for-streets";

import { GraphList } from "./graph-list";
import { GraphFilters } from "./graph-filters";
import { Flex } from "antd";

interface GraphViewParams {
  isLoading: boolean;
  isSuccess: boolean;
  groupCrashes: StreetData;
}

export const GraphView = ({
  isLoading,
  isSuccess,
  groupCrashes,
}: GraphViewParams): React.JSX.Element => {
  if (isLoading) {
    return <div></div>;
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
      <GraphList isSuccess={isSuccess} groupCrashes={groupCrashes} />
    </Flex>
  );
};
