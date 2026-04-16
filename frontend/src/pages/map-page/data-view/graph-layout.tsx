import React from "react";
import { Flex } from "antd";

export const GraphLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <Flex
      style={{
        flexDirection: "column",
        alignContent: "flex-start",
        height: "100vh",
        gap: "20px",
        padding: "16px",
        width: "100%",
      }}
    >
      {children}
    </Flex>
  );
};
