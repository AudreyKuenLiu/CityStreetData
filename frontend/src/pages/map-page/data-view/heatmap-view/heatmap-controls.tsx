import { Flex, Slider, SliderSingleProps, Switch, Typography } from "antd";
import React from "react";
import {
  useHeatmapTimeSegmentDates,
  useFeatureCollectionsIndex,
  useActions,
  useFullTimePeriodDisply,
} from "../../store/heatmap-data";

export const HeatmapControls = (): React.JSX.Element => {
  const dates = useHeatmapTimeSegmentDates();
  const { setFeatureCollectionsIndex, toggleFullTimePeriodDisplay } =
    useActions();
  const currentIdx = useFeatureCollectionsIndex();
  const shouldDisplayFullTimePeriod = useFullTimePeriodDisply();

  const marks: SliderSingleProps["marks"] = {
    0: dates[0]?.toLocaleDateString(),
    [dates.length - 1]: dates[dates.length - 1]?.toLocaleDateString(),
  };

  return (
    <Flex
      style={{
        position: "absolute",
        margin: "16px",
        zIndex: "2",
        width: "100%",
      }}
    >
      <Flex
        style={{
          width: "300px",
          flexDirection: "column",
          background: "white",
          gap: "8px",
          borderRadius: "5px",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #6d8196",
          padding: "16px 40px 10px 40px",
        }}
      >
        <Flex
          style={{
            width: "100%",
            alignSelf: "flex-start",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography.Text strong style={{ margin: 0 }}>
            View by whole period
          </Typography.Text>
          <Switch
            defaultChecked={shouldDisplayFullTimePeriod}
            onChange={() => {
              toggleFullTimePeriodDisplay();
            }}
          />
        </Flex>
        <Slider
          disabled={shouldDisplayFullTimePeriod}
          style={{ width: "100%" }}
          min={0}
          max={dates.length - 1}
          value={currentIdx}
          onChange={(val) => {
            setFeatureCollectionsIndex({ newIdx: val });
          }}
          tooltip={{
            formatter: (value) => {
              if (value == null) {
                return;
              }
              return dates[value].toLocaleDateString();
            },
          }}
          marks={marks}
          included={false}
        />
      </Flex>
    </Flex>
  );
};
