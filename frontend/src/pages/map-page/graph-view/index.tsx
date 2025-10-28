import React, { useEffect, useState } from "react";
import { GroupId } from "../store/constants";
import { CrashEvents } from "../../../models/api-models";
import { ResponsiveLine } from "@nivo/line";
import { Flex, Typography } from "antd";
import { useStreetGroups } from "../store/street-map-data-form";

interface GraphViewParams {
  isLoading: boolean;
  isSuccess: boolean;
  groupCrashes: Map<GroupId, CrashEvents[]>;
}

export const GraphView = ({
  isLoading,
  isSuccess,
  groupCrashes,
}: GraphViewParams): React.JSX.Element => {
  const [crashEvents, setCrashEvents] = useState<Map<GroupId, CrashEvents[]>>(
    new Map()
  );
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
        padding: "20px",
        gap: "60px",
        flexWrap: "wrap",
        position: "absolute",
        zIndex: 2,
      }}
    >
      {Array.from(crashEvents.entries()).map(([id, groupCrash]) => {
        console.time("processing");
        const sortedGroupCrashes = groupCrash
          .sort((crashEventA, crashEventB) => {
            const crashTimeA =
              crashEventA.occuredAt?.getTime() ?? new Date().getTime();
            const crashTimeB =
              crashEventB.occuredAt?.getTime() ?? new Date().getTime();
            return crashTimeA - crashTimeB;
          })
          .filter((groupCrash) => groupCrash.occuredAt != null);

        let maxVal = 0;
        const data = sortedGroupCrashes.map((crashEvent) => {
          maxVal = Math.max(
            maxVal,
            crashEvent.numberInjured + crashEvent.numberKilled
          );
          return {
            x: crashEvent.occuredAt,
            y: crashEvent.numberInjured + crashEvent.numberKilled,
          };
        });

        const lineData = {
          id,
          color: "red",
          data,
        };
        const yValuesArr = Array.from({ length: maxVal + 1 }, (_, i) => i);
        console.timeEnd("processing");

        return (
          <Flex
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography.Title level={3}>
              {streetGroups.get(id)?.name}
            </Typography.Title>
            <div
              style={{
                width: 500,
                height: 500,
              }}
            >
              <ResponsiveLine
                data={[lineData]}
                curve="linear"
                xScale={{
                  type: "time",
                  precision: "day",
                  useUTC: false,
                }}
                crosshairType="x"
                enableGridX={false}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: "auto",
                  stacked: false,
                  reverse: false,
                }}
                axisBottom={{
                  tickValues: "every 1 year",
                  tickRotation: 30,
                  format: "%Y",
                  legend: "Date",
                  legendOffset: 40,
                  legendPosition: "middle",
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legendOffset: -40,
                  legend: "People Injured and Killed",
                  legendPosition: "middle",
                  tickValues: yValuesArr,
                }}
                pointSize={10}
                lineWidth={2}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                useMesh={true}
                margin={{ bottom: 50, left: 50, top: 15, right: 50 }}
              />
            </div>
          </Flex>
        );
      })}
    </Flex>
  );
};
