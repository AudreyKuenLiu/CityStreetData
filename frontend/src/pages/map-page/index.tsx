import React, { useState } from "react";

import { MapView } from "./map-view";
import { Splitter } from "antd";
import { Layout } from "antd";
import {
  SanFranciscoCenterLatLon,
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../constants/map-dimensions";
import { ControlPanel } from "./control-panel";
import { useStreetsForMapView } from "./hooks/use-streets-for-map-view";
import { GraphView } from "./graph-view";
import { useCrashDataForStreets } from "./hooks/use-crash-data-for-streets";

export const MapPage: React.FC = () => {
  const { getStreetSegmentsForZoomLevel } = useStreetsForMapView();
  const { getCrashes, data, isLoading, isSuccess, canGetCrashes } =
    useCrashDataForStreets();
  const [sizes, setSizes] = useState<(number | string)[]>(["100%", 0]);

  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Splitter
        lazy={true}
        onResizeEnd={(sizes) => {
          console.log("setting sizes", sizes);
          setSizes(sizes);
        }}
      >
        <Splitter.Panel
          style={{ position: "relative" }}
          resizable={true}
          collapsible={true}
          size={sizes[0]}
        >
          <ControlPanel
            runQuery={async () => {
              await getCrashes();
              if (sizes[1] === 0) setSizes(["80%", "25%"]);
            }}
            canRunQuery={canGetCrashes}
          />
          <MapView
            initalNESWBounds={[
              SanFranciscoNEPoint[0],
              SanFranciscoNEPoint[1],
              SanFranciscoSWPoint[0],
              SanFranciscoSWPoint[1],
            ]}
            centerLatLon={[...SanFranciscoCenterLatLon]}
            getStreetSegmentsForZoomLevel={getStreetSegmentsForZoomLevel}
          />
        </Splitter.Panel>
        <Splitter.Panel defaultSize={0} collapsible={true} size={sizes[1]}>
          <GraphView
            isLoading={isLoading}
            isSuccess={isSuccess}
            groupCrashes={data}
          />
        </Splitter.Panel>
      </Splitter>
    </Layout>
  );
};
