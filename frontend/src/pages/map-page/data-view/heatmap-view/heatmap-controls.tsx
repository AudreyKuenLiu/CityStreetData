import {
  Flex,
  Slider,
  SliderSingleProps,
  Switch,
  Typography,
  Select,
} from "antd";
import React, { useState, useMemo, useEffect } from "react";
import {
  useHeatmapTimeSegmentDates,
  useActions,
  useFullTimePeriodDisplay,
  useHeatmapFilter,
} from "../../store/heatmap-data";
import { HeatmapFilterEnum } from "../../store/heatmap-data/types";
import _ from "lodash";
import { useDataViewContext } from "../../context/data-view";

const heatmapOptions = [
  {
    label: <span>Traffic Injuries</span>,
    title: "Traffic Injuries",
    options: [
      {
        label: <span>All Injuries</span>,
        value: HeatmapFilterEnum.AllInjuries,
      },
      {
        label: <span>Severe Injuries</span>,
        value: HeatmapFilterEnum.SevereInjuries,
      },
    ],
  },
  {
    label: <span>Traffic Crashes</span>,
    title: "Traffic Crashes",
    options: [
      {
        label: <span>Vehicle Involved</span>,
        value: HeatmapFilterEnum.VehicleInvolvedCrashes,
      },
      {
        label: <span>Bicycle Involved </span>,
        value: HeatmapFilterEnum.BicycleInvolvedCrashes,
      },
      {
        label: <span>Pedestrian Involved</span>,
        value: HeatmapFilterEnum.PedestrianInvolvedCrashes,
      },
    ],
  },
];

export const HeatmapControls = (): React.JSX.Element => {
  const dates = useHeatmapTimeSegmentDates();
  const { setTimeSegmentIdx, toggleFullTimePeriodDisplay, setHeatmapFilter } =
    useActions();
  const [idx, setIdx] = useState(0);
  const shouldDisplayFullTimePeriod = useFullTimePeriodDisplay();
  const heatmapFilter = useHeatmapFilter();
  const { selectedTimeSegment, selectedStartEndTime } = useDataViewContext();
  useEffect(() => {
    setIdx(0);
  }, [selectedTimeSegment, selectedStartEndTime, setIdx]);

  const throttleTimeSegment = useMemo(
    () =>
      _.throttle((val: number) => {
        console.log("calling");
        setTimeSegmentIdx({ newIdx: val });
      }, 250),
    [setTimeSegmentIdx],
  );

  const marks: SliderSingleProps["marks"] = {
    0: dates[0]?.toLocaleDateString(),
    [dates.length - 1]: dates[dates.length - 1]?.toLocaleDateString(),
  };
  return (
    <Flex
      id="heatmapControls"
      style={{
        position: "absolute",
        gap: "8px",
        padding: "16px",
        right: 0,
        left: 0,
        justifyContent: "space-between",
        zIndex: "2",
      }}
    >
      <Select
        style={{ height: "fit-content" }}
        placeholder="Select data type"
        value={heatmapFilter}
        onChange={(newOpt) => {
          setHeatmapFilter({ heatmapFilter: newOpt });
        }}
        options={heatmapOptions}
        size="large"
      />
      <Flex
        style={{
          minWidth: "300px",
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
          value={idx}
          onChange={(val) => {
            console.log("setting time segment", val);
            setIdx(val);
            throttleTimeSegment(val);
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
