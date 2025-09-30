import React from "react";

import { MapView } from "./map-view";
import { Allotment } from "allotment";
import { Layout } from "antd";
import {
  SanFranciscoCenterLatLon,
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../constants/map-dimensions";
import "allotment/dist/style.css";
import { useStreetMapControl } from "./hooks/use-street-map-control";

export const MapPage: React.FC = () => {
  const { getStreetSegmentsForZoomLevel } = useStreetMapControl();
  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Allotment>
        <Allotment.Pane>
          <MapView
            initalNESWBounds={[
              SanFranciscoNEPoint[0],
              SanFranciscoNEPoint[1],
              SanFranciscoSWPoint[0],
              SanFranciscoSWPoint[1],
            ]}
            centerLatLon={[...SanFranciscoCenterLatLon]}
            getStreetSegmentsForZoomLevel={getStreetSegmentsForZoomLevel}
            //mapConfig={mapConfig}
          />
        </Allotment.Pane>
        <Allotment.Pane snap>
          <div>Additional Content</div>
        </Allotment.Pane>
      </Allotment>
    </Layout>
  );
};
