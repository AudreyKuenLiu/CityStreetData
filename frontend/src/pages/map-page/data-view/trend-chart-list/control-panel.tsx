import React from "react";
import { Flex, Segmented, SegmentedProps } from "antd";
import { TimeTrends } from "../../store/trend-chart-list-data/types";
import { useCurrentTimeTrend } from "../../store/trend-chart-list-data";
import { useActions } from "../../store/trend-chart-list-data";
import { useDataViewContext } from "../../context/data-view";
import { TimeSegments } from "../../store/street-map-data-form";

export const ControlPanel = (): React.JSX.Element => {
  const currentOption = useCurrentTimeTrend();
  const { setCurrentTimeTrend } = useActions();
  const { selectedTimeSegment } = useDataViewContext();
  let TimeTrendOptions: SegmentedProps<TimeTrends>["options"] = [
    { label: "Hourly", value: TimeTrends.HOURLY },
    { label: "Daily", value: TimeTrends.DAILY },
    { label: "Monthly", value: TimeTrends.MONTHLY },
  ];
  if (selectedTimeSegment !== TimeSegments.OneYear) {
    TimeTrendOptions = [
      { label: "Hourly", value: TimeTrends.HOURLY },
      { label: "Daily", value: TimeTrends.DAILY },
    ];
  }

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
        options={TimeTrendOptions}
        value={currentOption}
        onChange={(e) => {
          if (e != null) {
            setCurrentTimeTrend(e);
          }
        }}
      />
    </Flex>
  );
};
