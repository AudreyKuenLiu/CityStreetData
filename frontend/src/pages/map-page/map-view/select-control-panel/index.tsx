import { Button, Flex, Modal, Space, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { MapControl } from "../hooks/use-map-control-panel";
import { InfoCircleFilled } from "@ant-design/icons";
import { center } from "@turf/turf";

const IconMapping = {
  [MapControl.PointerSelect]: <span className="fg-arrow-o fg-lg" />,
  [MapControl.HoverDelete]: <span className="fg-split fg-lg" />,
  [MapControl.HoverSelect]: <span className="fg-arrow fg-lg" />,
  [MapControl.PolygonSelect]: <span className="fg-arrow-o fg-lg" />,
} as const;

export const SelectControlPanel = ({
  currentMapControl,
  setMapControl,
}: {
  currentMapControl: MapControl;
  setMapControl: (mapControl: MapControl) => void;
}): React.JSX.Element => {
  const [infoEnabled, setInfoEnabled] = useState<boolean>(false);
  return (
    <Flex style={{ flexDirection: "column", pointerEvents: "all" }}>
      <Tooltip title={"Pointer Select"} placement="right">
        <div>
          <ControlButton
            icon={IconMapping[currentMapControl]}
            style={{
              borderRadius: "5px 5px 0px 0px",
            }}
            onClick={() => {
              setMapControl(MapControl.PointerSelect);
            }}
            isActive={
              MapControl.PointerSelect === currentMapControl ||
              MapControl.HoverSelect === currentMapControl ||
              MapControl.HoverDelete === currentMapControl
            }
          />
        </div>
      </Tooltip>
      <Tooltip title={"Polygon Select"} placement="right">
        <div>
          <ControlButton
            icon={<span className="fg-polygon-pt fg-lg" />}
            style={{
              borderRadius: 0,
            }}
            onClick={() => {
              setMapControl(MapControl.PolygonSelect);
            }}
            isActive={MapControl.PolygonSelect === currentMapControl}
          />
        </div>
      </Tooltip>
      <Tooltip title={"Info"} placement="right">
        <div>
          <ControlButton
            icon={
              <InfoCircleFilled
                style={{
                  color: infoEnabled ? "white" : undefined,
                }}
              />
            }
            style={{
              borderRadius: "0px 0px 5px 5px",
            }}
            onClick={() => {
              setInfoEnabled(!infoEnabled);
            }}
            isActive={infoEnabled}
          />
        </div>
      </Tooltip>
      <Modal
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            Short Cuts
          </Typography.Title>
        }
        open={infoEnabled}
        onCancel={() => setInfoEnabled(false)}
        footer={[<Button onClick={() => setInfoEnabled(false)}>Ok</Button>]}
      >
        <Space vertical size={"middle"}>
          <Space style={{ alignItems: "center" }}>
            <span className="fg-arrow fg-lg" />
            <Typography.Text strong>Ctrl + Hover</Typography.Text>
            <Typography.Text>
              selects multiple streets when hovering over
            </Typography.Text>
          </Space>
          <Space style={{ alignItems: "center" }}>
            <span className="fg-split fg-lg" />
            <Typography.Text strong>X + Hover</Typography.Text>
            <Typography.Text>
              de-selects multiple streets when hovering over
            </Typography.Text>
          </Space>
        </Space>
      </Modal>
    </Flex>
  );
};

const ControlButton = ({
  icon,
  isActive,
  style,
  onClick,
}: {
  icon: React.ReactNode;
  isActive: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
}): React.JSX.Element => {
  return (
    <Button
      variant="solid"
      onClick={onClick}
      style={{
        ...style,
        ...(isActive ? activeStyle : null),
      }}
      icon={icon}
    />
  );
};

const activeStyle = {
  background: "#1668dc",
  borderColor: "#1668dc",
  color: "white",
};
