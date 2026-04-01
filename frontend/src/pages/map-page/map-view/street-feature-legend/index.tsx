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
      <Card style={{ pointerEvents: "all", maxWidth: "900px" }}>
        <Row gutter={[8, 8]}>
          {legend.map((legendVal) => {
            return (
              <Col span={4}>
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
