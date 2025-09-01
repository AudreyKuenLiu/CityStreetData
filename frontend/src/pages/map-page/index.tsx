import React from "react";

import { MapView } from "./map-view";
import { Allotment } from "allotment";
import { Layout } from "antd";

import "allotment/dist/style.css";

export const MapPage: React.FC = () => {
  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Allotment>
        <Allotment.Pane>
          <MapView />
        </Allotment.Pane>
        <Allotment.Pane snap>
          <div>Additional Content</div>
        </Allotment.Pane>
      </Allotment>
    </Layout>
  );
};
