import React from "react";
import { Select, Button, DatePicker } from "antd";

export const ControlPanel: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        zIndex: 2,
        marginTop: "16px",
        marginLeft: "16px",
        marginRight: "16px",
        right: "0px",
        gap: "8px",
      }}
    >
      <Select
        placeholder="Select an event"
        options={[
          { value: "Traffic Crashes", label: <span>Traffic Crashes</span> },
        ]}
      />
      {/* <Select
        placeholder="Segment by"
        options={[{ value: "Streets", label: <span>Streets</span> }]}
      /> */}
      <DatePicker.RangePicker />
      <Button
        type="primary"
        disabled
        style={{ backgroundColor: "#d9d9d9", borderColor: "#d9d9d9" }}
      >
        Query
      </Button>
    </div>
  );
};
