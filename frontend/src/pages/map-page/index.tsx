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
  const { getCrashes, data, isLoading, isSuccess, canGetCrashes, dateRange } =
    useCrashDataForStreets();
  const [panelSizes, setPanelSizes] = useState([0, 0]);
  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Splitter
        lazy={true}
        onResizeEnd={(event) => {
          setPanelSizes(event);
        }}
      >
        <Splitter.Panel style={{ position: "relative" }}>
          <ControlPanel runQuery={getCrashes} canRunQuery={canGetCrashes} />
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
        <Splitter.Panel defaultSize={0} collapsible={true} min={500}>
          <GraphView
            isLoading={isLoading}
            isSuccess={isSuccess}
            groupCrashes={data}
            panelSize={panelSizes[1]}
            dateRange={dateRange}
          />
        </Splitter.Panel>
      </Splitter>
    </Layout>
  );
};
