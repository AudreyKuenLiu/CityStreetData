import React from "react";
import { Flex, Radio } from "antd";
import type { GraphType } from "../../store/graph-data";
import { useActions, useCurrentGraphType } from "../../store/graph-data";
import { CheckboxGroupProps } from "antd/es/checkbox";

const TrafficCrashOptions: CheckboxGroupProps<GraphType>["options"] = [
  { label: "Injuries and Deaths", value: "InjuriesAndFatalities" },
  { label: "Crashes", value: "CrashGroups" },
];

export const DataFilters = (): React.JSX.Element => {
  const currentOption = useCurrentGraphType();
  const { selectCurrentGraph } = useActions();

  return (
    <Flex
      style={{
        position: "sticky",
        alignItems: "center",
        top: "0",
        left: "0",
        zIndex: "2",
        minWidth: "800px",
        width: "100%",
      }}
    >
      <Radio.Group
        size="large"
        options={TrafficCrashOptions}
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
