import React, { useState, useEffect } from "react";
import { Button, Dropdown, Space } from "antd";
import {
  AreaChartOutlined,
  BuildFilled,
  HeatMapOutlined,
  LineChartOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useIsDirty, useIsReady } from "../../../store/street-map-data-form";
import { DataViewEnum, DataViewKeys } from "../../../context/data-view/types";
import { useDataViewContext } from "../../../context/data-view";

const DataViewConfig = {
  [DataViewEnum.NoView]: {
    icon: <BuildFilled />,
    label: "Generate View",
  },
  [DataViewEnum.AreaChartView]: {
    icon: <AreaChartOutlined />,
    label: "Area Chart",
  },
  [DataViewEnum.HeatmapView]: {
    icon: <HeatMapOutlined />,
    label: "Heat Map",
  },
  [DataViewEnum.TrendView]: {
    icon: <LineChartOutlined />,
    label: "Trend Chart",
  },
} as const;

const viewOptions = [
  {
    label: (
      <Space size="small">
        <AreaChartOutlined /> Area chart
      </Space>
    ),
    key: DataViewEnum.AreaChartView,
  },
  {
    label: (
      <Space size="small">
        <HeatMapOutlined />
        Heat Map
      </Space>
    ),
    key: DataViewEnum.HeatmapView,
  },
  {
    label: (
      <Space size="small">
        <LineChartOutlined />
        Trend Chart
      </Space>
    ),
    key: DataViewEnum.TrendView,
  },
];

export const RunQueryButton = ({
  onClick,
}: {
  onClick: () => void;
}): React.JSX.Element => {
  const [validRun, setValidRun] = useState(false);
  const isDirty = useIsDirty();
  const canRunQuery = useIsReady();
  const { currentDataView, setDataView } = useDataViewContext();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
      if (e.key === "Enter" && canRunQuery && isDirty) {
        setValidRun(true);
        if (currentDataView === DataViewEnum.NoView) {
          setDataView(DataViewKeys.parse(DataViewEnum.AreaChartView));
        }
        onClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canRunQuery, setDataView, onClick, currentDataView, isDirty]);

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
          disabled={!canRunQuery}
          onClick={async () => {
            setValidRun(true);
            if (currentDataView === DataViewEnum.NoView) {
              setDataView(DataViewKeys.parse(DataViewEnum.AreaChartView));
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
