import { Typography, Flex } from "antd";
import { XFilled } from "@ant-design/icons";
import { SliceTooltipProps } from "@nivo/line";

type sliceData = {
  id: string;
  color: string;
  data: {
    x: Date;
    y: number;
  }[];
};

export const SliceTooltip = ({
  slice,
}: SliceTooltipProps<sliceData>): React.JSX.Element => {
  return (
    <div
      style={{
        background: "white",
        padding: "14px",
        width: "200px",
        border: "1px solid #ccc",
        transform: "translate(115px, -100px)",
        borderRadius: 5,
      }}
    >
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {slice.points[0].data.x.toDateString()}
      </Typography.Title>
      <Flex
        style={{
          flexDirection: "column",
        }}
      >
        {slice.points.map((point) => (
          <Flex
            key={point.id}
            style={{
              justifyContent: "space-between",
              color: point.seriesColor,
              padding: "3px 0",
            }}
          >
            <Flex style={{ alignItems: "center", gap: "0.3em" }}>
              <XFilled
                style={{
                  fontSize: "12px",
                  color: point.seriesColor,
                }}
              />
              <Typography.Text strong>{point.seriesId}</Typography.Text>
            </Flex>
            <Typography.Text>{point.data.yFormatted}</Typography.Text>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};
