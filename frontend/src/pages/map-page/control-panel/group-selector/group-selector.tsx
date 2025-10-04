import React, { useState, useRef } from "react";
import { Divider, Button, Input, Select, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { InputRef, RefSelectProps } from "antd";

let index = 2;
type GroupOption = {
  id: string;
  name: string;
};

interface GroupSelectorParams {
  onAddItem: (name: string) => string;
  onSelectItem: (id: string) => void;
  onEditItem?: (editedOption: GroupOption) => void;
  onDeleteItem?: (deletedOption: GroupOption) => void;
}

export const GroupSelector: React.FC<GroupSelectorParams> = ({
  onAddItem,
  onSelectItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const inputRef = useRef<InputRef>(null);
  const selectRef = useRef<RefSelectProps>(null);

  if (groups.length === 0) {
    const groupName = "Group 1";
    const id = onAddItem("Group 1");
    setGroups([{ id, name: groupName }]);
    onSelectItem(id);
    setValue(id);
  }

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ): void => {
    e.preventDefault();
    const id = onAddItem(name);
    const newGroup = {
      id,
      name: name || `Group ${index++}`,
    };
    setGroups([...groups, newGroup]);
    setName("");
    onSelectItem(id);
    setValue(id);
    setOpen(false);
    selectRef.current?.blur();
  };

  return (
    <Select
      size="large"
      ref={selectRef}
      style={{ width: 300 }}
      open={open}
      onOpenChange={(visible) => setOpen(visible)}
      placeholder="Select a group"
      defaultActiveFirstOption={true}
      onSelect={(_, option) => {
        console.log("selecting new group", option.value);
        onSelectItem(option.value);
        setValue(option.value);
        selectRef.current?.blur();
      }}
      value={value}
      options={groups.map((group) => {
        return {
          label: group.name,
          value: group.id,
        };
      })}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Space style={{ padding: "0 8px 4px" }}>
            <Input
              placeholder="Enter a name"
              ref={inputRef}
              value={name}
              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
              Create group
            </Button>
          </Space>
        </>
      )}
    />
  );
};
