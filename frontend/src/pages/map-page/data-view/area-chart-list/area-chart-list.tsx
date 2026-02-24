import React from "react";
import { ResponsiveLine } from "@nivo/line";
import { Flex, Typography } from "antd";
import { useStreetGroupsRef } from "../../store/street-map-data-form";
import { useTrafficCrashesData } from "../../store/area-chart-list-data";
import { XFilled } from "@ant-design/icons";
import { SliceTooltip } from "../slice-tooltip";

export const AreaChartList = (): React.JSX.Element => {
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
