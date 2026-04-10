import React from "react";
import { Select, Flex } from "antd";
import {
  StreetFeatureEnum,
  StreetFeatureType,
} from "../../../../models/api-models";
import { BookFilled } from "@ant-design/icons";

const StreetFeatureOptions = [
  {
    icon: <span className="fg-pedestrian fg-lg" />,
    value: StreetFeatureEnum.SlowStreet,
    label: "Slow Streets",
  },
  {
    icon: <span className="fg-car fg-lg" />,
    value: StreetFeatureEnum.SpeedLimit,
    label: "Speed Limits",
  },
  {
    icon: <BookFilled />,
    value: StreetFeatureEnum.SchoolZone,
    label: "School Zones",
  },
];

export const StreetFeatureSelect = ({
  streetFeatureLayer,
  setStreetFeatureLayer,
  isLoading,
}: {
  streetFeatureLayer: StreetFeatureType | null;
  setStreetFeatureLayer: (val: StreetFeatureType) => void;
  isLoading: boolean;
}): React.JSX.Element => {
  return (
    <Select
      size="large"
      style={{
        height: "var(--ant-control-height-lg)",
        pointerEvents: "all",
        minWidth: "140px",
        width: "fit-content",
      }}
      allowClear
      placeholder={
        <Flex align="center" gap={"8px"}>
          <span className="fg-layer-alt fg-lg" />
          Layers
        </Flex>
      }
      labelRender={(option) => {
        const featureOption = StreetFeatureOptions.find((v) => {
          return v.value === option.value;
        });
        return (
          <Flex align="center" gap={"8px"}>
            {featureOption?.icon}
            {`${option.label}`}
          </Flex>
        );
      }}
      value={streetFeatureLayer}
      options={StreetFeatureOptions}
      onChange={(val) => {
        setStreetFeatureLayer(val);
      }}
      loading={isLoading}
      optionRender={(option) => (
        <Flex align="center" gap={"8px"}>
          {option.data.icon}
          {`${option.data.label}`}
        </Flex>
      )}
    />
  );
};
