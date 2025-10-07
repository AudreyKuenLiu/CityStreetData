import React, { useState, useRef, forwardRef, useEffect } from "react";
import { Divider, Button, Input, Select, Space, Tooltip, Flex } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  XFilled,
} from "@ant-design/icons";
import type { InputRef, RefSelectProps } from "antd";

let index = 1;
type GroupOption = {
  id: string;
  name: string;
  color: string;
};

interface GroupSelectorParams {
  currentOption: GroupOption | null;
  groups: GroupOption[];
  onAddItem: (name: string) => GroupOption;
  onSelectItem: (id: string) => void;
  onDeleteItem: (deletedOption: GroupOption) => void;
  onEditItem: (editedOption: GroupOption, newName: string) => void;
}

export const GroupSelector: React.FC<GroupSelectorParams> = ({
  currentOption,
  groups,
  onAddItem,
  onSelectItem,
  onDeleteItem,
  onEditItem,
}) => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const selectRef = useRef<RefSelectProps>(null);

  useEffect(() => {
    if (groups.length === 0 && index === 1) {
      const group = onAddItem(`Group ${index++}`);
      onSelectItem(group.id);
    }
  }, [groups, onAddItem, onSelectItem]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const addItem = (): void => {
    const { id } = onAddItem(name || `Group ${index++}`);
    setName("");
    onSelectItem(id);
    setOpen(false);
    selectRef.current?.blur();
  };

  const deleteItem = (deletedOption: GroupOption): void => {
    onDeleteItem(deletedOption);
    const newGroups = groups.filter((group) => group.id !== deletedOption.id);
    if (newGroups.length > 0) {
      onSelectItem(newGroups[0].id);
    } else {
      index = 1;
    }
  };

  return (
    <Select
      size="large"
      prefix={
        <XFilled
          style={{
            marginRight: "6px",
            color: currentOption?.color,
          }}
        />
      }
      ref={selectRef}
      style={{ width: 300 }}
      open={open}
      onOpenChange={(visible) => setOpen(visible)}
      placeholder="Select a group"
      defaultActiveFirstOption={true}
      onSelect={(_, option) => {
        onSelectItem(option.value);
        selectRef.current?.blur();
      }}
      value={currentOption?.id}
      options={groups.map((group) => {
        return {
          label: group.name,
          value: group.id,
          color: group.color,
        };
      })}
      optionRender={(option) => {
        return (
          <OptionRender
            label={option.data.label}
            color={option.data.color}
            deleteItem={() =>
              deleteItem({
                id: option.data.value,
                name: option.data.label,
                color: option.data.color,
              })
            }
            editItem={(newName: string) => {
              onEditItem(
                {
                  id: option.data.value,
                  name: option.data.label,
                  color: option.data.color,
                },
                newName
              );
            }}
          />
        );
      }}
      popupRender={(menu) => (
        <PopupRender
          menu={menu}
          name={name}
          ref={inputRef}
          onNameChange={onNameChange}
          addItem={addItem}
        />
      )}
    />
  );
};

const OptionRender = ({
  label,
  color,
  deleteItem,
  editItem,
}: {
  label: string;
  color: string;
  deleteItem: () => void;
  editItem: (newName: string) => void;
}): React.ReactNode => {
  const [openNameEditor, setOpenNameEditor] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(label);
  const [currentName, setCurrentName] = useState<string>(label);
  const inputRef = useRef<InputRef>(null);

  return (
    <Flex style={{ gap: "4px", alignItems: "center" }}>
      <XFilled
        style={{
          marginRight: "6px",
          color,
        }}
      />
      <Flex>
        {openNameEditor ? (
          <Input
            value={newName}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                editItem(newName);
                setOpenNameEditor(false);
                setCurrentName(newName);
              }
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewName(e.target.value);
            }}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.focus();
            }}
          />
        ) : (
          <div
            style={{
              maxWidth: 185,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentName}
          </div>
        )}
      </Flex>
      <Flex style={{ marginLeft: "auto", gap: "2px" }}>
        <Tooltip title="Edit name">
          <Button
            size="small"
            shape="circle"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setOpenNameEditor(true);
            }}
          />
        </Tooltip>
        <Tooltip title="Delete group">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              deleteItem();
            }}
            size="small"
            shape="circle"
            icon={<DeleteOutlined />}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

const PopupRender = forwardRef(
  (
    {
      menu,
      name,
      onNameChange,
      addItem,
    }: {
      menu: React.ReactElement;
      name: string;
      onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
      addItem: () => void;
    },
    ref: React.Ref<InputRef>
  ): React.ReactNode => {
    return (
      <>
        {menu}
        <Divider style={{ margin: "8px 0" }} />
        <Space style={{ padding: "0 8px 4px" }}>
          <Input
            placeholder="Enter a name"
            ref={ref}
            value={name}
            onChange={onNameChange}
            onKeyDown={(e) => e.stopPropagation()}
            onPressEnter={() => addItem()}
          />
          <Button type="text" icon={<PlusOutlined />} onClick={() => addItem()}>
            Create group
          </Button>
        </Space>
      </>
    );
  }
);
