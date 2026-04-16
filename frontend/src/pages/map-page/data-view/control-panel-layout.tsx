import React from "react";
import { Flex } from "antd";

export const ControlPanelLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <Flex
      style={{
        position: "sticky",
        alignItems: "center",
        top: "16px",
        left: "0",
        zIndex: "2",
        minWidth: "500px",
        width: "100%",
      }}
    >
      {children}
    </Flex>
  );
};
