import React from "react";
import { XFilled } from "@ant-design/icons";
import { Flex, Typography } from "antd";

export const GraphCard = ({
  id,
  groupColor,
  groupName,
  children,
}: {
  id: string;
  groupColor: string;
  groupName: string;
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <Flex
      key={`${id}_graph`}
      style={{
        flexDirection: "column",
        border: `1px solid #d3d3d3`,
        backgroundColor: "#FAFAFA",
        borderRadius: "12px",
        paddingTop: "20px",
        width: "100%",
      }}
    >
      <Flex
        align="middle"
        style={{
          alignItems: "center",
          gap: "1em",
          paddingLeft: "24px",
        }}
      >
        <XFilled
          style={{
            fontSize: "24px",
            color: groupColor,
          }}
        />
        <Typography.Title level={3} style={{ margin: 0 }}>
          {groupName}
        </Typography.Title>
      </Flex>
      <div
        style={{
          minHeight: "400px",
        }}
      >
        {children}
      </div>
    </Flex>
  );
};
