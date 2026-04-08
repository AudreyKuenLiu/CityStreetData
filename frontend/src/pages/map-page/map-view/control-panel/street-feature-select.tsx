import React from "react";
import { Select } from "antd";
import { StreetFeatureOptions } from "./constants";
import { StreetFeatureType } from "../../../../models/api-models";

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
      }}
      allowClear
      placeholder="View Street Features"
      value={streetFeatureLayer}
      options={StreetFeatureOptions}
      onChange={(val) => {
        setStreetFeatureLayer(val);
      }}
      loading={isLoading}
    />
  );
};
