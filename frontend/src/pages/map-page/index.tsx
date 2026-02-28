import React, { useState } from "react";

import { MapView } from "./map-view";
import { ConfigProvider, Splitter } from "antd";
import { Layout } from "antd";
import { DataView } from "./data-view";
// const DataView = React.lazy(() =>
//   import("./data-view").then((module) => ({ default: module.DataView })),
// );
import { DataViewProvider } from "./context/data-view";
import { LeftPanelClassName, RightPanelClassName } from "./map-view/constants";

export const MapPage: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorFill: "#6d8196",
        },
        components: {
          Segmented: {
            itemSelectedBg: "#1677ff",
            itemSelectedColor: "white",
            itemColor: "black",
          },
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
          resizable={true}
          collapsible={true}
          size={sizes[0]}
        >
          <MapView
            onRunQuery={() => {
              if (sizes[1] === 0) setSizes(["80%", "20%"]);
            }}
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
