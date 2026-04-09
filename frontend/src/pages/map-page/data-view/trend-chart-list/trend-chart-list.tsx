import React, { useRef } from "react";
import { useStreetGroupsRef } from "../../store/street-map-data-form";
import { Flex, Typography } from "antd";
import { XFilled } from "@ant-design/icons";
import { useCrashTrendData } from "../../store/trend-chart-list-data";
import { PointTooltipProps, ResponsiveLine } from "@nivo/line";
import { ControlPanel } from "./control-panel";
import { AverageLineSeriesId } from "../../store/trend-chart-list-data/types";
import { ChartScroller } from "../chart-scroller";
import { useVirtualChartData } from "../chart-scroller/use-virtual-chart-data";
import { GraphCard } from "../graph-card";

export const TrendChartList = (): React.JSX.Element => {
  const streetGroups = useStreetGroupsRef();
  const chartPanel = useRef<HTMLElement | null>(null);

  const { scrollHandler, resetHandler, truncatedDataHandler, interval } =
    useVirtualChartData({
      sizePerTick: 80,
      panel: chartPanel.current,
    });
  const crashTrendData = useCrashTrendData([truncatedDataHandler]);
  if (crashTrendData?.[0] == null) {
    return <div />;
  }
  const allTickValues = crashTrendData[0]?.allTickValues;
  const totalLength = crashTrendData[0]?.allTickValues.length;

  return (
    <Flex
      style={{
        overflow: "scroll",
        flexWrap: "wrap",
        alignContent: "flex-start",
        height: "100vh",
        gap: "20px",
        padding: "16px",
        width: "100%",
      }}
    >
      <ControlPanel />
      <Flex
        ref={chartPanel}
        style={{
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: "20px",
          minWidth: "500px",
          width: "100%",
        }}
      >
        {crashTrendData.map(({ id, tickValues, lineSeries, axisLegend }) => {
          const streetGroup = streetGroups.get(id);
          if (streetGroup == null) {
            return null;
          }
          return (
            <GraphCard
              id={id}
              groupName={streetGroup.name}
              groupColor={streetGroup.color}
            >
              <ResponsiveLine
                animate={false}
                curve="monotoneX"
                enableGridX={false}
                data={lineSeries}
                colors={(datum) => {
                  return datum.color;
                }}
                theme={{
                  text: {
                    fontWeight: 400,
                    fill: "#595959",
                    textShadow:
                      "-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white",
                  },
                  axis: {
                    legend: {
                      text: {
                        fontWeight: 500,
                        letterSpacing: "0.03em",
                        fill: "#595959",
                        fontSize: 16,
                        textShadow: "none",
                      },
                    },
                  },
                }}
                areaOpacity={1}
                enablePointLabel={true}
                pointLabel={(label) => {
                  if (label.id.includes(AverageLineSeriesId)) {
                    return label.data.yFormatted;
                  }
                  return "";
                }}
                pointSize={6}
                axisTop={{
                  format: (e) => {
                    if (typeof e == "number" && Number.isInteger(e)) {
                      return e;
                    }
                    return "";
                  },
                  legend: axisLegend,
                  tickSize: 0,
                  legendOffset: -30,
                }}
                axisBottom={{
                  tickPadding: 25,
                  tickValues: tickValues,
                }}
                // sliceTooltip={SliceTooltip}
                // xScale={{
                //   type: "time",
                // }}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: "auto",
                  reverse: false,
                }}
                //enableTouchCrosshair
                useMesh={true}
                margin={{ bottom: 45, left: 50, top: 40, right: 40 }}
                tooltip={TrendTooltip}
                //enableSlices="x"
              />
            </GraphCard>
          );
        })}
      </Flex>
      <ChartScroller
        allTicks={allTickValues}
        toLabel={(t) => t}
        interval={interval}
        scrollHandler={scrollHandler}
        resetHandler={resetHandler}
        totalLength={totalLength}
      />
    </Flex>
  );
};

const TrendTooltip = ({
  point,
}: PointTooltipProps<{
  readonly id: string;
  readonly data: {
    x: string;
    y: number;
  }[];
  readonly color: string;
}>): React.JSX.Element => {
  const titleString = point.id.split(".")[0];

  return (
    <div
      style={{
        background: "white",
        padding: "14px",
        width: "200px",
        border: "1px solid #ccc",
        //transform: "translate(115px, -100px)",
        borderRadius: 5,
      }}
    >
      <Flex gap={"middle"} style={{ alignItems: "center" }}>
        <XFilled
          style={{
            fontSize: "24px",
            color: point.seriesColor,
          }}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {titleString}
        </Typography.Title>
      </Flex>
      <Flex
        key={point.id}
        style={{
          justifyContent: "space-between",
          padding: "3px 0",
        }}
      >
        <Flex style={{ alignItems: "center", gap: "0.3em" }}>
          <Typography.Text strong>{point.data.x}</Typography.Text>
        </Flex>
        <Typography.Text>{point.data.yFormatted}</Typography.Text>
      </Flex>
    </div>
  );
};
