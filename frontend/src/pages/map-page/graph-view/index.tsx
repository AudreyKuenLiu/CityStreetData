import React, { useEffect, useState } from "react";
import type { StreetData } from "../hooks/use-crash-data-for-streets";
import { ResponsiveLine } from "@nivo/line";
import { Flex, Typography } from "antd";
import { useStreetGroups } from "../store/street-map-data-form";
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
        overflow: "scroll",
        padding: "50px",
        flexWrap: "wrap",
        alignContent: "flex-start",
        gap: "20px",
        height: "100vh",
      }}
    >
      {Array.from(crashEvents.entries()).map(([id, groupCrash]) => {
        const streetGroup = streetGroups.get(id);
        if (streetGroup == null) {
          return null;
        }
        const sortedGroupCrashes = groupCrash.sort(
          (crashEventA, crashEventB) => {
            const crashTimeA = crashEventA[0]?.getTime();
            const crashTimeB = crashEventB[0]?.getTime();
            return crashTimeA - crashTimeB;
          }
        );
        const fatalitiesData = sortedGroupCrashes.map(([time, crashEvents]) => {
          return {
            x: time,
            y: crashEvents.numberKilled,
          };
        });
        const severeInjuriesData = sortedGroupCrashes.map(
          ([time, crashEvents]) => {
            return {
              x: time,
              y: crashEvents.numberSeriouslyInjured,
            };
          }
        );
        const nonSevereInjuriesData = sortedGroupCrashes.map(
          ([time, crashEvents]) => {
            return {
              x: time,
              y: crashEvents.numberInjured - crashEvents.numberSeriouslyInjured,
            };
          }
        );
        const combinedData = [
          { id: "Fatalities", data: fatalitiesData },
          { id: "Severe Injuries", data: severeInjuriesData },
          { id: "Injuries", data: nonSevereInjuriesData },
        ];
        const totalWidth = Math.max(sortedGroupCrashes.length * 30, 1400);

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
            }}
          >
            <Flex
              align="middle"
              style={{
                alignItems: "center",
                gap: "1.5em",
                paddingLeft: "24px",
                marginBottom: "1em",
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
                data={combinedData}
                colors={(datum) => {
                  if (datum.id === "Fatalities") {
                    return "#E34444";
                  }
                  if (datum.id === "Severe Injuries") {
                    return "#ffab57";
                  }
                  if (datum.id === "Injuries") {
                    return "#EDD296";
                  }
                  return "#000000";
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
                pointSize={8}
                axisLeft={{
                  format: (e) => {
                    if (typeof e == "number" && Number.isInteger(e)) {
                      return e;
                    }
                    return "";
                  },
                  legend: "Traffic Injuries and Fatalities",
                  legendOffset: -40,
                }}
                axisBottom={{
                  format: "%Y-%m-%d",
                }}
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
                margin={{ bottom: 40, left: 80, top: 50, right: 30 }}
              />
            </div>
          </Flex>
        );
      })}
    </Flex>
  );
};

// import React, { useEffect, useState } from "react";
// import type { StreetData } from "../hooks/use-crash-data-for-streets";
// import { ResponsiveBarCanvas } from "@nivo/bar";
// import { Flex, Typography } from "antd";
// import { useStreetGroups } from "../store/street-map-data-form";
// import { dateToPacificTimeMonth } from "../../../utils";
// import { XFilled } from "@ant-design/icons";

// interface GraphViewParams {
//   isLoading: boolean;
//   isSuccess: boolean;
//   groupCrashes: StreetData;
// }

// export const GraphView = ({
//   isLoading,
//   isSuccess,
//   groupCrashes,
// }: GraphViewParams): React.JSX.Element => {
//   const [crashEvents, setCrashEvents] = useState<StreetData>(new Map());
//   const streetGroups = useStreetGroups();
//   console.log("loading graphView", isLoading, isSuccess, groupCrashes);

//   useEffect(() => {
//     if (isSuccess) {
//       console.log("setting crash events");
//       setCrashEvents(groupCrashes);
//     }
//   }, [isSuccess, groupCrashes]);

//   if (isLoading) {
//     return <div></div>;
//   }

//   return (
//     <Flex
//       style={{
//         overflow: "hidden",
//         overflowY: "scroll",
//         padding: "20px 20px 20px 20px",
//         gap: "20px",
//         flexWrap: "wrap",
//         height: "100vh",
//       }}
//     >
//       {Array.from(crashEvents.entries()).map(([id, groupCrash]) => {
//         const sortedGroupCrashes = groupCrash.sort(
//           (crashEventA, crashEventB) => {
//             const crashTimeA = crashEventA[0]?.getTime();
//             const crashTimeB = crashEventB[0]?.getTime();
//             return crashTimeA - crashTimeB;
//           }
//         );
//         let maxVal = 0;
//         const crashBarData = sortedGroupCrashes.map(([time, crashStats]) => {
//           maxVal = Math.max(
//             maxVal,
//             crashStats.numberInjured + crashStats.numberKilled
//           );
//           return {
//             time: dateToPacificTimeMonth(time),
//             injuries:
//               crashStats.numberInjured - crashStats.numberSeriouslyInjured,
//             severeInjuries: crashStats.numberSeriouslyInjured,
//             fatalities: crashStats.numberKilled,
//           };
//         });
//         const totalHeight = Math.max(crashBarData.length * 30, 300);
//         const allowedValues: number[] = Array.from(
//           { length: maxVal + 1 },
//           (_, i) => i
//         );

//         return (
//           <Flex
//             key={`${id}_graph`}
//             style={{
//               flexDirection: "column",
//               flexGrow: 1,
//               border: `1px solid #d3d3d3`,
//               backgroundColor: "#FAFAFA",
//               borderRadius: "5px",
//               paddingRight: "20px",
//             }}
//           >
//             <Flex
//               align="middle"
//               style={{
//                 alignItems: "center",
//                 gap: "1.5em",
//                 paddingLeft: "24px",
//               }}
//             >
//               <XFilled
//                 style={{
//                   fontSize: "32px",
//                   color: streetGroups.get(id)?.color ?? "black",
//                 }}
//               />
//               <Typography.Title level={2}>
//                 {streetGroups.get(id)?.name}
//               </Typography.Title>
//             </Flex>
//             <div
//               style={{
//                 width: "100%",
//                 minWidth: "400px",
//                 height: `${totalHeight}px`,
//               }}
//             >
//               <ResponsiveBarCanvas
//                 data={crashBarData}
//                 layout="horizontal"
//                 colors={["#EDD296", "#E34444", "#ED8F2F"]}
//                 theme={{
//                   text: { fontWeight: "lighter" },
//                   axis: {
//                     legend: {
//                       text: {
//                         fontWeight: "bold",
//                       },
//                     },
//                   },
//                 }}
//                 axisTop={{
//                   legend: "Traffic Injuries and Fatalities",
//                   legendOffset: -40,
//                   tickValues: allowedValues,
//                 }}
//                 label={(d) => {
//                   return d.value == null || d.value === 0
//                     ? ""
//                     : d.value.toString();
//                 }}
//                 axisBottom={null}
//                 keys={["injuries", "fatalities", "severeInjuries"]}
//                 margin={{ bottom: 20, left: 80, top: 50, right: 10 }}
//                 indexBy="time"
//               />
//             </div>
//           </Flex>
//         );
//       })}
//     </Flex>
//   );
// };
