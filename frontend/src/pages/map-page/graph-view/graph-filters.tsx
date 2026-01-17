import React from "react";
import { Divider, Flex, Radio, Switch, Typography } from "antd";
import type { GraphType } from "../store/graph-data";
import { useActions, useCurrentGraphType } from "../store/graph-data";
import { CheckboxGroupProps } from "antd/es/checkbox";

const options: CheckboxGroupProps<GraphType>["options"] = [
  { label: "Injuries and Deaths", value: "InjuriesAndFatalities" },
  { label: "Crashes", value: "CrashGroups" },
];

export const GraphFilters = (): React.JSX.Element => {
  const currentOption = useCurrentGraphType();
  const { selectCurrentGraph } = useActions();
  console.log("currentOption", currentOption);
  return (
    <Flex
      style={{
        position: "sticky",
        alignItems: "center",
        top: "0",
        left: "0",
        zIndex: "2",
        minWidth: "2000px",
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
      <Divider style={{ height: "80%" }} size="large" orientation="vertical" />
      <Flex
        style={{
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Typography.Title
          level={5}
          style={{ marginTop: 0, marginBottom: "4px" }}
        >
          Heat map
        </Typography.Title>
        <Switch />
      </Flex>
    </Flex>
  );
};
