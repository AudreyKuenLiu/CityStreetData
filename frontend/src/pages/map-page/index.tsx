import React, { useState } from "react";

import { MapView } from "./map-view";
import { ConfigProvider, Splitter } from "antd";
import { Layout } from "antd";
import { SanFranciscoCenterLatLon } from "../../constants/map-dimensions";
import { ControlPanel } from "./map-view/control-panel";
import { useStreetsForMapView } from "./hooks/use-streets-for-map-view";
import { DataView } from "./data-view";
import { DataViewProvider } from "./context/data-view";

export const MapPage: React.FC = () => {
  const { getStreetSegmentsForZoomLevel } = useStreetsForMapView();
  const [sizes, setSizes] = useState<(number | string)[]>(["100%", 0]);

  return (
    <DataViewProvider>
      <ConfigProvider
        theme={{
          token: {
            colorFill: "#6d8196",
          },
        }}
      >
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
                onRunQuery={() => {
                  if (sizes[1] === 0) setSizes(["80%", "25%"]);
                }}
              />
              <MapView
                centerLatLon={[...SanFranciscoCenterLatLon]}
                getStreetSegmentsForZoomLevel={getStreetSegmentsForZoomLevel}
              />
            </Splitter.Panel>
            <Splitter.Panel defaultSize={0} collapsible={true} size={sizes[1]}>
              <DataView />
            </Splitter.Panel>
          </Splitter>
        </Layout>
      </ConfigProvider>
    </DataViewProvider>
  );
};
