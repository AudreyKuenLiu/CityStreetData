import React from "react";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const LoadingDataView = (): React.JSX.Element => {
  return (
    <Flex
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
    </Flex>
  );
};
