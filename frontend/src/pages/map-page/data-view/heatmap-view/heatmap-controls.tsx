import { Flex, Slider, SliderSingleProps } from "antd";
import React from "react";
import {
  useHeatmapTimeSegmentDates,
  useDateFeatureCollectionsIndex,
  useActions,
} from "../../store/heatmap-data";

export const HeatmapControls = (): React.JSX.Element => {
  const dates = useHeatmapTimeSegmentDates();
  const { setDateFeatureCollectionsIndex } = useActions();
  const currentIdx = useDateFeatureCollectionsIndex();

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
          background: "white",
          borderRadius: "5px",
          border: "1px solid #6d8196",
          paddingLeft: "30px",
          paddingRight: "30px",
        }}
      >
        <Slider
          style={{ width: "100%" }}
          min={0}
          max={dates.length - 1}
          value={currentIdx}
          onChange={(val) => {
            setDateFeatureCollectionsIndex({ newIdx: val });
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
