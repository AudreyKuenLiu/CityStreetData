import React, { useState, useEffect } from "react";
import { Button, Dropdown, Space } from "antd";
import {
  AreaChartOutlined,
  BuildFilled,
  HeatMapOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useDataViewQuery } from "./hooks";
import { useIsDirty } from "../../../store/street-map-data-form";
import { DataViewEnum, DataViewKeys } from "../../../context/data-view/types";

const DataViewConfig = {
  [DataViewEnum.NoView]: {
    icon: <BuildFilled />,
    label: "Generate View",
  },
  [DataViewEnum.GraphView]: {
    icon: <AreaChartOutlined />,
    label: "Graph",
  },
  [DataViewEnum.HeatmapView]: {
    icon: <HeatMapOutlined />,
    label: "Heatmap",
  },
} as const;

const viewOptions = [
  {
    label: (
      <Space size="small">
        <AreaChartOutlined /> Graph
      </Space>
    ),
    key: DataViewEnum.GraphView,
  },
  {
    label: (
      <Space size="small">
        <HeatMapOutlined />
        Heatmap
      </Space>
    ),
    key: DataViewEnum.HeatmapView,
  },
];

export const RunQueryButton = ({
  onClick,
}: {
  onClick: () => void;
}): React.JSX.Element => {
  const [validRun, setValidRun] = useState(false);
  const isDirty = useIsDirty();

  const {
    canGetData: canRunQuery,
    getData: runQuery,
    setDataView,
    currentDataView,
    isLoading,
  } = useDataViewQuery();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
      if (e.key === "Enter" && canRunQuery && isDirty) {
        await runQuery();
        setValidRun(true);
        if (currentDataView === DataViewEnum.NoView) {
          setDataView(DataViewKeys.parse(DataViewEnum.GraphView));
        }
        onClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canRunQuery, runQuery, setDataView, onClick, currentDataView, isDirty]);

  useEffect(() => {
    if (!canRunQuery) {
      setValidRun(false);
      setDataView(DataViewEnum.NoView);
    }
  }, [canRunQuery, setDataView]);

  return (
    <Space.Compact>
      <Dropdown
        menu={{
          items: viewOptions,
          onClick: async (e) => {
            const selectedDataView = DataViewKeys.parse(e.key);
            await runQuery(selectedDataView);
            setDataView(selectedDataView);
            setValidRun(true);
            onClick();
          },
        }}
        disabled={!canRunQuery}
      >
        <Button
          size="large"
          type="primary"
          icon={
            isDirty && validRun ? (
              <RedoOutlined />
            ) : (
              DataViewConfig[currentDataView].icon
            )
          }
          loading={isLoading}
          disabled={!canRunQuery}
          onClick={async () => {
            if (isDirty) {
              await runQuery();
            }
            setValidRun(true);
            if (currentDataView === DataViewEnum.NoView) {
              setDataView(DataViewKeys.parse(DataViewEnum.GraphView));
            }
            onClick();
          }}
          style={{
            width: "160px",
            justifyContent: "center",
            alignItems: "center",
            // for some reason this button is always transparent when disabled
            backgroundColor: !canRunQuery
              ? "#d9d9d9"
              : isDirty && validRun
                ? "#ed8821"
                : undefined,
          }}
        >
          {DataViewConfig[currentDataView].label}
        </Button>
      </Dropdown>
    </Space.Compact>
  );
};
