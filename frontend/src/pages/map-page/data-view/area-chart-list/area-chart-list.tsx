import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { Flex, Typography } from "antd";
import { useStreetGroupsRef } from "../../store/street-map-data-form";
import { useTrafficCrashesData } from "../../store/area-chart-list-data";
import { XFilled } from "@ant-design/icons";
import type { SliceTooltipProps } from "@nivo/line";

export const AreaChartList = (): React.JSX.Element => {
  //TODO: optimize the rendering of this component to handle large number of values instead of just rendering every possible value
  const streetGroups = useStreetGroupsRef();
  const trafficCrashGroupData = useTrafficCrashesData();

  return (
    <Flex
      style={{
        flexWrap: "wrap",
        alignContent: "flex-start",
        gap: "20px",
      }}
    >
      {trafficCrashGroupData.map(
        ({ id, tickValues, lineSeries, axisLegend }) => {
          const streetGroup = streetGroups.get(id);
          if (streetGroup == null) {
            return null;
          }
          const totalWidth = Math.max(tickValues.length * 80, 1400);
          return (
            <Flex
              key={`${id}_graph`}
              style={{
                flexDirection: "column",
                border: `1px solid #d3d3d3`,
                backgroundColor: "#FAFAFA",
                borderRadius: "5px",
                paddingTop: "20px",
                paddingRight: "20px",
                height: "500px",
                //boxShadow: "0 3px 6px rgba(0,0,0,.05),0 3px 6px rgba(0,0,0,.05)",
              }}
            >
              <Flex
                align="middle"
                style={{
                  alignItems: "center",
                  gap: "1.5em",
                  paddingLeft: "24px",
                }}
              >
                <XFilled
                  style={{
                    fontSize: "32px",
                    color: streetGroup.color,
                  }}
                />
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {streetGroup.name}
                </Typography.Title>
              </Flex>
              <div
                style={{
                  minHeight: "400px",
                  width: `${totalWidth}px`,
                }}
              >
                <ResponsiveLine
                  animate={false}
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
                    tickPadding: 10,
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
