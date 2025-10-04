import React from "react";
import { Select, Button, DatePicker, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { GroupSelector } from "./group-selector/group-selector";
import { useActions } from "../map-view/store/street-map-data-form";

export const ControlPanel: React.FC = () => {
  const { addGroup, setCurrentGroup } = useActions();
  return (
    <Flex
      style={{
        position: "absolute",
        zIndex: 2,
        alignItems: "center",
        marginTop: "16px",
        marginLeft: "16px",
        marginRight: "16px",
        right: "0px",
        gap: "4px",
      }}
    >
      {/* <Divider
        type="vertical"
        style={{ height: "38px", borderColor: "#666666" }}
      /> */}
      <Flex
        style={{
          gap: "8px",
        }}
      >
        <GroupSelector
          onAddItem={(name) => {
            return addGroup({ name }).id;
          }}
          onSelectItem={(id) => {
            return setCurrentGroup({ id });
          }}
        />
        <Select
          size="large"
          placeholder="Select an event"
          options={[
            { value: "Traffic Crashes", label: <span>Traffic Crashes</span> },
          ]}
        />
        {/* <Select
        placeholder="Segment by"
        options={[{ value: "Streets", label: <span>Streets</span> }]}
      /> */}
        <DatePicker.RangePicker size="large" />
        <Button
          size="large"
          type="primary"
          icon={<SearchOutlined />}
          disabled
          style={{
            backgroundColor: "#d9d9d9",
            borderColor: "#d9d9d9",
            justifyContent: "center",
          }}
        >
          Query
        </Button>
      </Flex>
    </Flex>
  );
};
