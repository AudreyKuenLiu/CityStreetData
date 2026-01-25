import React, { memo } from "react";
import { Select, DatePicker, Flex } from "antd";
import { GroupSelector } from "./group-selector/group-selector";
import { useRef } from "react";
import type { RefSelectProps } from "antd";
import { TimeSegmentLabels, TimeSegmentOptions } from "./constants";
import {
  useActions,
  useCurrentStreetGroup,
  useStreetGroups,
  useTimeSegment,
  convertToGroupId,
} from "../../store/street-map-data-form";
import { RunQueryButton } from "./run-query-button";

export const ControlPanel = memo(
  ({ onRunQuery }: { onRunQuery: () => void }): React.JSX.Element => {
    const {
      addGroup,
      setCurrentGroup,
      removeGroup,
      editGroup,
      setEndDate,
      setStartDate,
      setTimeSegment,
    } = useActions();
    const currentStreetGroup = useCurrentStreetGroup();
    const streetGroups = useStreetGroups();
    // const isDirty = useIsDirty();
    // const [validRun, setValidRun] = useState(false);
    const timeSegment = useTimeSegment();
    const groups = Array.from(streetGroups.values()).map((streetGroup) => {
      return {
        id: streetGroup.id,
        name: streetGroup.name,
        color: streetGroup.color,
      };
    });
    const timeSegmentSelectRef = useRef<RefSelectProps>(null);

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
            ref={timeSegmentSelectRef}
            placeholder="every 'X' Days"
            onInputKeyDown={(e) => {
              timeSegmentSelectRef.current?.blur();
              e.stopPropagation();
            }}
            options={TimeSegmentOptions}
            value={
              timeSegment != null
                ? [
                    {
                      value: timeSegment,
                      label: TimeSegmentLabels[timeSegment],
                    },
                  ]
                : null
            }
            onSelect={(_, option) => {
              setTimeSegment(option.value);
              timeSegmentSelectRef.current?.blur();
            }}
          />
          <DatePicker.RangePicker
            size="large"
            placeholder={["From Start Date", "To End Date"]}
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
          <RunQueryButton onClick={onRunQuery} />
        </Flex>
      </Flex>
    );
  },
);

ControlPanel.displayName = "ControlPanel";
