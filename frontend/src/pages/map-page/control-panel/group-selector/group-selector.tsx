import React, {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { Divider, Button, Input, Select, Space, Tooltip, Flex } from "antd";
import { DeleteOutlined, PlusOutlined, XFilled } from "@ant-design/icons";
import type { InputRef, RefSelectProps } from "antd";

let index = 1;
type GroupOption = {
  id: string;
  name: string;
  color: string;
};

interface GroupSelectorParams {
  onAddItem: (name: string) => GroupOption;
  onSelectItem: (id: string) => void;
  onDeleteItem: (deletedOption: GroupOption) => void;
  onEditItem?: (editedOption: GroupOption) => void;
}

export const GroupSelector: React.FC<GroupSelectorParams> = ({
  onAddItem,
  onSelectItem,
  onDeleteItem,
  onEditItem,
}) => {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<GroupOption | null>(null);
  const inputRef = useRef<InputRef>(null);
  const selectRef = useRef<RefSelectProps>(null);

  useEffect(() => {
    if (groups.length === 0 && index === 1) {
      const group = onAddItem(`Group ${index++}`);
      onSelectItem(group.id);
      setOption(group);
      setGroups([group]);
    }
  }, [groups, onAddItem, onSelectItem]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const addItem = (): void => {
    const { id, color } = onAddItem(name);
    const newGroup = {
      id,
      name: name || `Group ${index++}`,
      color,
    };
    setGroups([...groups, newGroup]);
    setName("");
    onSelectItem(id);
    setOption(newGroup);
    setOpen(false);
    selectRef.current?.blur();
  };

  const deleteItem = (deletedOption: GroupOption): void => {
    onDeleteItem(deletedOption);
    const newGroups = groups.filter((group) => group.id !== deletedOption.id);
    if (newGroups.length > 0) {
      onSelectItem(newGroups[0].id);
      setOption(newGroups[0]);
    } else {
      index = 1;
    }
    setGroups([...newGroups]);
  };

  return (
    <Select
      size="large"
      prefix={
        <XFilled
          style={{
            marginRight: "6px",
            color: option?.color,
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
        setOption({
          id: option.value,
          name: option.label,
          color: option.color,
        });
        selectRef.current?.blur();
      }}
      value={option?.id}
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
            label={option.label}
            color={option.data.color}
            deleteItem={() =>
              deleteItem({
                id: option.data.value,
                name: option.data.label,
                color: option.data.color,
              })
            }
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
}: {
  label: string | React.ReactNode;
  color: string;
  deleteItem: () => void;
}): React.ReactNode => {
  return (
    <Flex>
      <XFilled
        style={{
          marginRight: "6px",
          color,
        }}
      />
      {label}
      <Tooltip title="Delete group">
        <Button
          style={{ marginLeft: "auto" }}
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
