import React from "react";

import { MapView } from "./map-view";
import { Allotment } from "allotment";
import { Layout } from "antd";
import {
  SanFranciscoCenterLatLon,
  SanFranciscoNWPoint,
  SanFranciscoSEPoint,
} from "../../constants/map-dimensions";

import "allotment/dist/style.css";

export const MapPage: React.FC = () => {
  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Allotment>
        <Allotment.Pane>
          <MapView
            initalNESWBounds={[
              SanFranciscoNWPoint[0],
              SanFranciscoSEPoint[1],
              SanFranciscoSEPoint[0],
              SanFranciscoNWPoint[1],
            ]}
            centerLatLon={[...SanFranciscoCenterLatLon]}
          />
        </Allotment.Pane>
        <Allotment.Pane snap>
          <div>Additional Content</div>
        </Allotment.Pane>
      </Allotment>
    </Layout>
  );
};
