import React from "react";

import { MapView } from "./map-view";
//import { Allotment } from "allotment";
import { Splitter } from "antd";
import { Layout } from "antd";
import {
  SanFranciscoCenterLatLon,
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../constants/map-dimensions";
import { ControlPanel } from "./control-panel";
//import "allotment/dist/style.css";
// import { useStreetMapControl } from "./hooks/use-street-map-control";
import { useStreetMapData } from "./hooks/use-street-map-data";

export const MapPage: React.FC = () => {
  // const { getStreetSegmentsForZoomLevel } = useStreetMapControl();
  useStreetMapData();
  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Splitter>
        <Splitter.Panel style={{ position: "relative" }}>
          <ControlPanel />
          {/* <MapView
            initalNESWBounds={[
              SanFranciscoNEPoint[0],
              SanFranciscoNEPoint[1],
              SanFranciscoSWPoint[0],
              SanFranciscoSWPoint[1],
            ]}
            centerLatLon={[...SanFranciscoCenterLatLon]}
            getStreetSegmentsForZoomLevel={getStreetSegmentsForZoomLevel}
          /> */}
        </Splitter.Panel>
        <Splitter.Panel defaultSize={0}>
          <div>Additional Content</div>
        </Splitter.Panel>
      </Splitter>
    </Layout>
  );
};
