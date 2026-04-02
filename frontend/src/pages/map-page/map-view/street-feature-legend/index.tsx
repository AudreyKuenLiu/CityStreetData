import React from "react";
import { Flex, Card, Col, Row } from "antd";
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
      <Card
        style={{
          pointerEvents: "all",
          maxWidth: "1200px",
          border: "1px solid #d3d3d3",
        }}
      >
        <Row gutter={[8, 8]}>
          {legend.map((legendVal) => {
            let colSpan = 12;
            if (legend.length >= 8) {
              colSpan = 6;
            }

            if (legend.length >= 12) {
              colSpan = 3;
            }
            return (
              <Col span={colSpan}>
                <Flex
                  style={{
                    alignItems: "center",
                    width: "fit-content",
                    textTransform: "capitalize",
                  }}
                  gap="small"
                >
                  <LineOutlined style={{ color: legendVal.color }} />
                  {legendVal.value}
                </Flex>
              </Col>
            );
          })}
        </Row>
      </Card>
    </Flex>
  );
};
