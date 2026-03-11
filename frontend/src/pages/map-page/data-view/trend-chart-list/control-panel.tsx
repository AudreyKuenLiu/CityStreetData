import React from "react";
import { Divider, Flex, Segmented, SegmentedProps, Select } from "antd";
import { TimeTrendsEnum } from "../../store/trend-chart-list-data/types";
import {
  useCurrentTimeSegments,
  useCurrentTimeTrend,
  useCurrentTimeTrendFilter,
  useTimeSegmentOptions,
} from "../../store/trend-chart-list-data";
import { useActions } from "../../store/trend-chart-list-data";
import { useDataViewContext } from "../../context/data-view";
import { TimeSegments } from "../../store/street-map-data-form";
import { injuryCrashTypeOptions } from "../../types/data-view";
import { TimeSegmentsToName } from "../../store/street-map-data-form/types";

export const ControlPanel = (): React.JSX.Element => {
  const currentOption = useCurrentTimeTrend();
  const timeFilter = useCurrentTimeTrendFilter();
  const { setCurrentTimeTrend, setTimeTrendFilter, setTimeSegments } =
    useActions();
  const { selectedTimeSegment } = useDataViewContext();
  const currentTimeSegments = useCurrentTimeSegments();
  const timeSelectOption = useTimeSegmentOptions();
  let TimeTrendOptions: SegmentedProps<TimeTrendsEnum>["options"] = [
    { label: "Hourly", value: TimeTrendsEnum.HOURLY },
    { label: "Daily", value: TimeTrendsEnum.DAILY },
    { label: "Monthly", value: TimeTrendsEnum.MONTHLY },
  ];
  if (selectedTimeSegment !== TimeSegments.OneYear) {
    TimeTrendOptions = [
      { label: "Hourly", value: TimeTrendsEnum.HOURLY },
      { label: "Daily", value: TimeTrendsEnum.DAILY },
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
      <Select
        style={{ height: "fit-content" }}
        placeholder="Select data type"
        value={timeFilter}
        onChange={(newOpt) => {
          setTimeTrendFilter(newOpt);
        }}
        options={injuryCrashTypeOptions}
        size="large"
      />
      <Divider orientation="vertical" size="large" style={{ height: "85%" }} />
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
      <Divider orientation="vertical" size="large" style={{ height: "85%" }} />
      <Select
        mode="multiple"
        style={{ width: 300, overflow: "hidden" }}
        size="large"
        maxCount={60}
        maxTagCount={"responsive"}
        allowClear
        value={currentTimeSegments}
        placeholder={`Select time periods`}
        onChange={(vals) => {
          setTimeSegments(vals);
        }}
        options={timeSelectOption}
      />
    </Flex>
  );
};
