import React from "react";
import { Select, Button, DatePicker, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { GroupSelector } from "./group-selector/group-selector";
import {
  useActions,
  useCurrentStreetGroup,
  useStreetGroups,
} from "../map-view/store/street-map-data-form";

export const ControlPanel: React.FC = () => {
  const { addGroup, setCurrentGroup, removeGroup, editGroup } = useActions();
  const currentStreetGroup = useCurrentStreetGroup();
  const streetGroups = useStreetGroups();
  const groups = Array.from(streetGroups.values()).map((streetGroup) => {
    return {
      id: streetGroup.id,
      name: streetGroup.name,
      color: streetGroup.color,
    };
  });

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
      <Flex
        style={{
          gap: "8px",
        }}
      >
        <GroupSelector
          currentOption={
            currentStreetGroup != null
              ? {
                  id: currentStreetGroup.id,
                  name: currentStreetGroup.name,
                  color: currentStreetGroup.color,
                }
              : null
          }
          groups={groups}
          onAddItem={(name) => {
            const group = addGroup({ name });
            return {
              id: group.id,
              name,
              color: group.color,
            };
          }}
          onSelectItem={(id) => {
            return setCurrentGroup({ id });
          }}
          onDeleteItem={(option) => {
            return removeGroup({ id: option.id });
          }}
          onEditItem={(option, name) => {
            return editGroup({ id: option.id, name });
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
