import React from "react";
import { Flex, Radio } from "antd";
import type { GraphType } from "../store/graph-data";
import { useActions, useCurrentGraphType } from "../store/graph-data";
import { CheckboxGroupProps } from "antd/es/checkbox";

const options: CheckboxGroupProps<GraphType>["options"] = [
  { label: "Injuries and Deaths", value: "InjuriesAndFatalities" },
  { label: "Traffic Crash Groups", value: "CrashGroups" },
];

export const GraphFilters = (): React.JSX.Element => {
  const currentOption = useCurrentGraphType();
  const { selectCurrentGraph } = useActions();
  console.log("currentOption", currentOption);
  return (
    <Flex
      style={{
        gap: "20px",
        position: "sticky",
        top: "0",
        left: "0",
        zIndex: "2",
        minWidth: "800px",
      }}
    >
      <Radio.Group
        size="large"
        options={options}
        value={currentOption}
        onChange={(e) => {
          selectCurrentGraph(e.target.value);
        }}
        optionType="button"
        buttonStyle="solid"
      />
    </Flex>
  );
};
