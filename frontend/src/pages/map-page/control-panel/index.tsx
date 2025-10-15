import React, { memo } from "react";
import { Select, Button, DatePicker, Flex } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { GroupSelector } from "./group-selector/group-selector";
import { useRef } from "react";
import type { RefSelectProps } from "antd";
import { StreetEventLabels, StreetEventOptions } from "./constants";
import {
  useActions,
  useCurrentStreetGroup,
  useStreetGroups,
  useStreetEvent,
} from "../store/street-map-data-form";
import { convertToGroupId } from "../store/constants";

export const ControlPanel = memo(
  ({
    runQuery,
    canRunQuery,
  }: {
    runQuery: () => Promise<void>;
    canRunQuery: boolean;
  }): React.JSX.Element => {
    console.log("can get crashes", canRunQuery);
    const {
      addGroup,
      setCurrentGroup,
      removeGroup,
      editGroup,
      setEndDate,
      setStartDate,
      setStreetEvent,
    } = useActions();
    const currentStreetGroup = useCurrentStreetGroup();
    const streetGroups = useStreetGroups();
    const streetEvent = useStreetEvent();
    const groups = Array.from(streetGroups.values()).map((streetGroup) => {
      return {
        id: streetGroup.id,
        name: streetGroup.name,
        color: streetGroup.color,
      };
    });
    const selectRef = useRef<RefSelectProps>(null);

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
              const groupId = convertToGroupId(id);
              if (groupId == null) {
                return;
              }
              return setCurrentGroup({ id: groupId });
            }}
            onDeleteItem={(option) => {
              const groupId = convertToGroupId(option.id);
              if (groupId == null) {
                return;
              }
              return removeGroup({ id: groupId });
            }}
            onEditItem={(option, name) => {
              const groupId = convertToGroupId(option.id);
              if (groupId == null) {
                return;
              }
              return editGroup({ id: groupId, name });
            }}
          />
          <Select
            size="large"
            ref={selectRef}
            placeholder="Select an event"
            onInputKeyDown={(e) => {
              selectRef.current?.blur();
              e.stopPropagation();
            }}
            value={[
              {
                value: streetEvent,
                label: StreetEventLabels[streetEvent],
              },
            ]}
            options={StreetEventOptions}
            onSelect={(_, option) => {
              setStreetEvent(option.value);
              selectRef.current?.blur();
            }}
          />
          <DatePicker.RangePicker
            size="large"
            onChange={(value) => {
              if (
                value == null ||
                value[0]?.date == null ||
                value[1]?.date == null
              ) {
                setStartDate(null);
                setEndDate(null);
                return;
              }
              setStartDate(value[0].toDate());
              setEndDate(value[1].toDate());
            }}
          />
          <Button
            size="large"
            type="primary"
            icon={<SearchOutlined />}
            disabled={!canRunQuery}
            onClick={async () => {
              await runQuery();
            }}
            style={{
              justifyContent: "center",
              // for some reason this button is always transparent when disabled
              backgroundColor: !canRunQuery ? "#d9d9d9" : undefined,
            }}
          >
            Query
          </Button>
        </Flex>
      </Flex>
    );
  }
);

ControlPanel.displayName = "ControlPanel";
