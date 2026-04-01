import React from "react";
import { Flex, Card } from "antd";
import type { StreetFeatureLegend as StreetFeatureLegendType } from "../hooks/use-street-features";
import { LineOutlined } from "@ant-design/icons";

export const StreetFeatureLegend = ({
  legend,
}: {
  legend: StreetFeatureLegendType;
}): React.JSX.Element | null => {
  if (legend.length === 0) {
    return null;
  }

  return (
    <Flex
      style={{
        pointerEvents: "none",
        position: "absolute",
        justifyContent: "center",
        width: "100%",
        bottom: "20px",
      }}
    >
      <Card>
        {legend.map((legendVal) => {
          return (
            <Flex style={{ alignItems: "center" }} gap="small">
              <LineOutlined style={{ color: legendVal.color }} />
              {legendVal.value}
            </Flex>
          );
        })}
      </Card>
    </Flex>
  );
};
