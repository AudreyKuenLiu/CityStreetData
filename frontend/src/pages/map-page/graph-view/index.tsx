import React from "react";
import { GroupId } from "../store/constants";
import { CrashEvents } from "../../../models/api-models";
import { ResponsiveLine } from "@nivo/line";
import { Flex } from "antd";

interface GraphViewParams {
  isLoading: boolean;
  groupCrashes: Map<GroupId, CrashEvents[]>;
}

export const GraphView = ({
  isLoading,
  groupCrashes,
}: GraphViewParams): React.JSX.Element => {
  console.log("loading graphView", isLoading, groupCrashes);
  if (isLoading) {
    return <div></div>;
  }
  return (
    <Flex
      style={{
        margin: "60px",
        gap: "30px",
        flexWrap: "wrap",
        zIndex: 2,
        position: "absolute",
      }}
    >
      {Array.from(groupCrashes.entries()).map(([id, groupCrash]) => {
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

        const data = sortedGroupCrashes.map((crashEvent) => {
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
        console.timeEnd("processing");

        return (
          <div style={{ height: 400, width: 400 }}>
            <ResponsiveLine
              data={[lineData]}
              curve="linear"
              xScale={{
                type: "time",
                precision: "month",
                useUTC: false,
              }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              axisBottom={{
                tickValues: "every 1 month",
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 45,
                //format: "%b %d",
                legend: "Date",
                legendOffset: 70,
                legendPosition: "middle",
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Value",
                legendOffset: -40,
                legendPosition: "middle",
              }}
              pointSize={10}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              useMesh={true}
            />
          </div>
        );
      })}
    </Flex>
  );
};
