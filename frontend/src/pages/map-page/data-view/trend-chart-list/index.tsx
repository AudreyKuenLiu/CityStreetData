import React from "react";
import { useStreetGroupsRef } from "../../store/street-map-data-form";
import { Flex } from "antd";

export const TrendChartList = (): React.JSX.Element => {
  const streetGroups = useStreetGroupsRef();

  return (
    <Flex
      style={{
        flexWrap: "wrap",
        alignContent: "flex-start",
        gap: "20px",
      }}
    ></Flex>
  );
};
