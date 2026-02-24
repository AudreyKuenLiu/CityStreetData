import React, { memo } from "react";
import { Select, DatePicker, Flex } from "antd";
import { GroupSelector } from "./group-selector/group-selector";
import { useRef } from "react";
import type { RefSelectProps } from "antd";
import { TimeSegmentLabels, TimeSegmentOptions } from "./constants";
import {
  useActions,
  useCurrentStreetGroup,
  // useStreetGroupsRef,
  useTimeSegment,
  convertToGroupId,
  useStartDate,
  useEndDate,
  useStreetGroupsRef,
  useIsDirtyHash,
} from "../../store/street-map-data-form";
import { RunQueryButton } from "./run-query-button";
import { useDataViewContext } from "../../context/data-view";

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
    const {
      setSelectedTimeSegment,
      setSelectedStreetGroups,
      setSelectedStartEndTime,
      setSelectedIsDirtyHash,
    } = useDataViewContext();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const currentStreetGroup = useCurrentStreetGroup();
    const streetGroups = useStreetGroupsRef();
    const timeSegment = useTimeSegment();
    const isDirtyHash = useIsDirtyHash();
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
          gap: "8px",
          height: "fit-content",
          pointerEvents: "all",
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
        <RunQueryButton
          onClick={() => {
            if (timeSegment != null) {
              setSelectedTimeSegment(timeSegment);
            }
            if (startDate != null && endDate != null) {
              setSelectedStartEndTime([startDate, endDate]);
            }
            setSelectedStreetGroups(streetGroups);
            if (isDirtyHash) {
              setSelectedIsDirtyHash(isDirtyHash);
            }
            onRunQuery();
          }}
        />
      </Flex>
    );
  },
);

ControlPanel.displayName = "ControlPanel";

export { TimeSegmentLabels } from "./constants";
