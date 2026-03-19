import React, { useMemo, useEffect } from "react";
import { Flex, Slider } from "antd";
import _ from "lodash";

export const ChartScroller = ({
  allTicks,
  interval,
  scrollHandler,
  resetHandler,
  totalLength,
}: {
  allTicks: Date[];
  interval: [number, number];
  resetHandler: (totalLength: number) => void;
  scrollHandler: (range: [number, number]) => void;
  totalLength: number;
}): React.JSX.Element => {
  useEffect(() => {
    resetHandler(totalLength);
  }, [totalLength, resetHandler]);
  const marks = {
    0: allTicks[0].toLocaleDateString(),
    [totalLength - 1]: allTicks[totalLength - 1].toLocaleDateString(),
  };

  const throttledFn = useMemo(
    () =>
      _.throttle((val: [number, number]) => {
        scrollHandler(val);
      }, 50),
    [scrollHandler],
  );

  return (
    <Flex
      style={{
        position: "sticky",
        zIndex: 2,
        bottom: "16px",
        width: "100%",
        minWidth: "500px",
        borderRadius: "5px",
        padding: "6px 32px 6px 32px",
        alignSelf: "center",
        border: `1px solid #d3d3d3`,
        backgroundColor: "#FAFAFA",
        boxShadow: "0 3px 6px rgba(0,0,0,.1),0 3px 6px rgba(0,0,0,.1)",
      }}
    >
      <Slider
        style={{ width: "100%" }}
        range={{ draggableTrack: true }}
        min={0}
        max={totalLength - 1}
        value={interval}
        marks={marks}
        onChange={(v: number | number[]) => {
          throttledFn(v as [number, number]);
        }}
        tooltip={{
          formatter: (value) => {
            if (value == null) {
              return;
            }
            return allTicks[value].toLocaleDateString();
          },
        }}
      />
    </Flex>
  );
};
