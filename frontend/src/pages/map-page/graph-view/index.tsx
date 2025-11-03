import React, { useEffect, useState } from "react";
//import { CrashEvents } from "../../../models/api-models";
import type { StreetData } from "../hooks/use-crash-data-for-streets";
import { ResponsiveBarCanvas } from "@nivo/bar";
import { Flex, Typography } from "antd";
import { useStreetGroups } from "../store/street-map-data-form";
import { dateToPacificTimeMonth } from "../../../utils";
import { XFilled } from "@ant-design/icons";

interface GraphViewParams {
  isLoading: boolean;
  isSuccess: boolean;
  groupCrashes: StreetData;
}

export const GraphView = ({
  isLoading,
  isSuccess,
  groupCrashes,
}: GraphViewParams): React.JSX.Element => {
  const [crashEvents, setCrashEvents] = useState<StreetData>(new Map());
  const streetGroups = useStreetGroups();
  console.log("loading graphView", isLoading, isSuccess, groupCrashes);

  useEffect(() => {
    if (isSuccess) {
      console.log("setting crash events");
      setCrashEvents(groupCrashes);
    }
  }, [isSuccess, groupCrashes]);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <Flex
      style={{
        overflow: "hidden",
        overflowY: "scroll",
        padding: "20px 20px 20px 20px",
        gap: "20px",
        flexWrap: "wrap",
        height: "100vh",
      }}
    >
      {Array.from(crashEvents.entries()).map(([id, groupCrash]) => {
        const sortedGroupCrashes = groupCrash.sort(
          (crashEventA, crashEventB) => {
            const crashTimeA = crashEventA[0]?.getTime();
            const crashTimeB = crashEventB[0]?.getTime();
            return crashTimeA - crashTimeB;
          }
        );
        let maxVal = 0;
        const crashBarData = sortedGroupCrashes.map(([time, crashStats]) => {
          maxVal = Math.max(
            maxVal,
            crashStats.numberInjured + crashStats.numberKilled
          );
          return {
            time: dateToPacificTimeMonth(time),
            injuries:
              crashStats.numberInjured - crashStats.numberSeriouslyInjured,
            severeInjuries: crashStats.numberSeriouslyInjured,
            fatalities: crashStats.numberKilled,
          };
        });
        const totalHeight = crashBarData.length * 20;
        const allowedValues: number[] = Array.from(
          { length: maxVal + 1 },
          (_, i) => i
        );

        return (
          <Flex
            key={`${id}_graph`}
            style={{
              flexDirection: "column",
              flexGrow: 1,
              border: `1px solid #d3d3d3`,
              backgroundColor: "#FAFAFA",
              borderRadius: "5px",
              paddingRight: "20px",
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
                  color: streetGroups.get(id)?.color ?? "black",
                }}
              />
              <Typography.Title level={2}>
                {streetGroups.get(id)?.name}
              </Typography.Title>
            </Flex>
            <div
              style={{
                width: "100%",
                minWidth: "400px",
                height: `${totalHeight}px`,
              }}
            >
              <ResponsiveBarCanvas
                data={crashBarData}
                layout="horizontal"
                colors={["#EDD296", "#E34444", "#ED8F2F"]}
                theme={{
                  text: { fontWeight: "lighter" },
                  axis: {
                    legend: {
                      text: {
                        fontWeight: "bold",
                      },
                    },
                  },
                }}
                axisTop={{
                  legend: "Traffic Injuries and Fatalities",
                  legendOffset: -40,
                  tickValues: allowedValues,
                }}
                label={(d) => {
                  return d.value == null || d.value === 0
                    ? ""
                    : d.value.toString();
                }}
                axisBottom={null}
                keys={["injuries", "fatalities", "severeInjuries"]}
                margin={{ bottom: 20, left: 80, top: 50, right: 10 }}
                indexBy="time"
              />
            </div>
          </Flex>
        );
      })}
    </Flex>
  );
};
