import React from "react";
import { DatePicker } from "antd";
import { Select } from "antd";

export const ControlPanel: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        float: "right",
        position: "absolute",
        zIndex: 2,
        marginTop: "16px",
        marginLeft: "16px",
        marginRight: "16px",
        gap: "8px",
      }}
    >
      <Select
        placeholder="Segment by"
        options={[{ value: "Streets", label: <span>Streets</span> }]}
      />
      <Select
        placeholder="Select an event"
        options={[
          { value: "Traffic Crashes", label: <span>Traffic Crashes</span> },
        ]}
      />
      <DatePicker.RangePicker />
    </div>
  );
};
