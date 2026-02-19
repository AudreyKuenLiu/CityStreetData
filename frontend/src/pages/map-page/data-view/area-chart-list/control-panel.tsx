import React from "react";
import {
  Divider,
  Flex,
  Segmented,
  SegmentedProps,
  Space,
  Switch,
  Typography,
} from "antd";
import type { GraphType } from "../../store/area-chart-list-data";
import {
  useActions,
  useCurrentGraphType,
  useShouldNormalizeGraphData,
} from "../../store/area-chart-list-data";

const TrafficCrashOptions: SegmentedProps<GraphType>["options"] = [
  { label: "Injuries and Deaths", value: "InjuriesAndFatalities" },
  { label: "Crashes", value: "CrashGroups" },
] as const;

export const ControlPanel = (): React.JSX.Element => {
  const currentOption = useCurrentGraphType();
  const { selectCurrentGraph, toggleNormalize } = useActions();
  const shouldNormalizeGraphData = useShouldNormalizeGraphData();

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
      <Segmented
        size="large"
        style={{ background: "white" }}
        styles={{
          root: {
            border: "1px solid #d3d3d3",
          },
        }}
        options={TrafficCrashOptions}
        value={currentOption}
        onChange={(e) => {
          selectCurrentGraph(e);
        }}
      />
      <Divider orientation="vertical" size="large" style={{ height: "85%" }} />
      <Space style={{ alignItems: "center" }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Normalize
        </Typography.Title>
        <Switch
          defaultChecked={shouldNormalizeGraphData}
          onChange={() => {
            toggleNormalize();
          }}
        />
      </Space>
    </Flex>
  );
};
