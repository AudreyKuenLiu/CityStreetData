import React, { useRef } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Flex, Typography } from "antd";
import { useStreetGroupsRef } from "../../store/street-map-data-form";
import { useTrafficCrashesData } from "../../store/area-chart-list-data";
import { XFilled } from "@ant-design/icons";
import type { SliceTooltipProps } from "@nivo/line";
import { ControlPanel } from "./control-panel";
import { ChartScroller } from "../chart-scroller";
import { useVirtualChartData } from "../chart-scroller/use-virtual-chart-data";

export const AreaChartList = (): React.JSX.Element => {
  const streetGroups = useStreetGroupsRef();
  const chartPanel = useRef<HTMLElement | null>(null);
  const { scrollHandler, truncatedDataHandler, interval, resetHandler } =
    useVirtualChartData({
      sizePerTick: 80,
      panel: chartPanel.current,
    });
  const trafficCrashGroupData = useTrafficCrashesData([truncatedDataHandler]);
  if (trafficCrashGroupData?.[0] == null) {
    return <div />;
  }

  const allTickValues = trafficCrashGroupData[0]?.allTickValues;
  const totalLength = trafficCrashGroupData[0]?.allTickValues.length;

  return (
    <Flex
      style={{
        position: "relative",
        margin: "16px 16px 0px 16px",
        width: "100%",
      }}
    >
      <Flex
        style={{
          //overflow: "scroll",
          flexWrap: "wrap",
          height: "100vh",
          alignContent: "flex-start",
          gap: "20px",
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
          {trafficCrashGroupData.map(
            ({ id, tickValues, lineSeries, axisLegend }) => {
              const streetGroup = streetGroups.get(id);
              if (streetGroup == null) {
                return null;
              }
              return (
                <Flex
                  key={`${id}_graph`}
                  style={{
                    flexDirection: "column",
                    border: `1px solid #d3d3d3`,
                    backgroundColor: "#FAFAFA",
                    borderRadius: "5px",
                    paddingTop: "20px",
                    // paddingRight: "20px",
                    //height: "500px",
                    width: "100%",
                    //boxShadow: "0 3px 6px rgba(0,0,0,.05),0 3px 6px rgba(0,0,0,.05)",
                  }}
                >
                  <Flex
                    align="middle"
                    style={{
                      alignItems: "center",
                      gap: "1em",
                      paddingLeft: "24px",
                    }}
                  >
                    <XFilled
                      style={{
                        fontSize: "24px",
                        color: streetGroup.color,
                      }}
                    />
                    <Typography.Title level={3} style={{ margin: 0 }}>
                      {streetGroup.name}
                    </Typography.Title>
                  </Flex>
                  <div
                    style={{
                      minHeight: "400px",
                      //width: `${totalWidth}px`,
                    }}
                  >
                    <ResponsiveLine
                      animate={false}
                      curve="monotoneX"
                      enableGridX={false}
                      //enableGridY={false}
                      data={lineSeries}
                      colors={(datum) => {
                        return datum.color;
                      }}
                      theme={{
                        text: {
                          fontWeight: "bold",
                          textShadow:
                            "-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white",
                        },
                        axis: {
                          legend: {
                            text: {
                              fontWeight: "bold",
                              fontSize: 14,
                            },
                          },
                        },
                      }}
                      enableArea={true}
                      areaOpacity={1}
                      enablePointLabel={true}
                      pointLabel={(label) => {
                        if (label.data.y === 0) {
                          return "";
                        }
                        return label.data.yFormatted;
                      }}
                      useMesh={false}
                      pointSize={8}
                      axisLeft={{
                        format: (e) => {
                          if (typeof e == "number" && Number.isInteger(e)) {
                            return e;
                          }
                          return "";
                        },
                        legend: axisLegend,
                        legendOffset: -50,
                      }}
                      axisBottom={{
                        format: "%Y-%b-%d",
                        tickPadding: 20,
                        tickValues: tickValues,
                      }}
                      sliceTooltip={SliceTooltip}
                      xScale={{
                        type: "time",
                      }}
                      yScale={{
                        type: "linear",
                        min: 0,
                        max: "auto",
                        stacked: true,
                        reverse: false,
                      }}
                      enableSlices="x"
                      margin={{ bottom: 40, left: 80, top: 50, right: 40 }}
                    />
                  </div>
                </Flex>
              );
            },
          )}
        </Flex>
        <ChartScroller
          allTicks={allTickValues}
          toLabel={(t) => t.toLocaleDateString()}
          totalLength={totalLength}
          interval={interval}
          scrollHandler={scrollHandler}
          resetHandler={resetHandler}
        />
      </Flex>
    </Flex>
  );
};

type sliceData = {
  id: string;
  color: string;
  data: {
    x: Date;
    y: number;
  }[];
};

export const SliceTooltip = ({
  slice,
}: SliceTooltipProps<sliceData>): React.JSX.Element => {
  return (
    <div
      style={{
        background: "white",
        padding: "14px",
        width: "200px",
        border: "1px solid #ccc",
        transform: "translate(115px, -100px)",
        borderRadius: 5,
      }}
    >
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {slice.points[0].data.x.toDateString()}
      </Typography.Title>
      <Flex
        style={{
          flexDirection: "column",
        }}
      >
        {slice.points.map((point) => (
          <Flex
            key={point.id}
            style={{
              justifyContent: "space-between",
              color: point.seriesColor,
              padding: "3px 0",
            }}
          >
            <Flex style={{ alignItems: "center", gap: "0.3em" }}>
              <XFilled
                style={{
                  fontSize: "12px",
                  color: point.seriesColor,
                }}
              />
              <Typography.Text strong>{point.seriesId}</Typography.Text>
            </Flex>
            <Typography.Text>{point.data.yFormatted}</Typography.Text>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};
