import React, { useState } from "react";

import { MapView } from "./map-view";
import { ConfigProvider, Splitter } from "antd";
import { Layout } from "antd";
import { SanFranciscoCenterLatLon } from "../../constants/map-dimensions";
import { ControlPanel } from "./map-view/control-panel";
import { useStreetsForMapView } from "./hooks/use-streets-for-map-view";
import { DataView } from "./data-view";
import { DataViewProvider } from "./context/data-view";
import { LeftPanelClassName, RightPanelClassName } from "./map-view/constants";

export const MapPage: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorFill: "#6d8196",
        },
      }}
    >
      <DataViewProvider>
        <MapPageBody />
      </DataViewProvider>
    </ConfigProvider>
  );
};

const MapPageBody = (): React.JSX.Element => {
  const { getStreetSegmentsForZoomLevel } = useStreetsForMapView();
  const [sizes, setSizes] = useState<(number | string)[]>(["100%", 0]);

  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Splitter
        lazy={true}
        onResizeEnd={(sizes) => {
          setSizes(sizes);
        }}
      >
        <Splitter.Panel
          className={LeftPanelClassName}
          style={{ position: "relative" }}
          resizable={true}
          collapsible={true}
          size={sizes[0]}
        >
          <ControlPanel
            onRunQuery={() => {
              if (sizes[1] === 0) setSizes(["80%", "20%"]);
            }}
          />
          <MapView
            centerLatLon={[...SanFranciscoCenterLatLon]}
            getStreetSegmentsForZoomLevel={getStreetSegmentsForZoomLevel}
          />
        </Splitter.Panel>
        <Splitter.Panel
          className={RightPanelClassName}
          defaultSize={0}
          collapsible={true}
          size={sizes[1]}
        >
          <DataView />
        </Splitter.Panel>
      </Splitter>
    </Layout>
  );
};
