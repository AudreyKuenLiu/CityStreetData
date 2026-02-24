import React, { createContext, useContext, useState } from "react";
import { DataViewEnum, type DataView } from "./types";
import { TimeSegments } from "../../store/street-map-data-form";

type DataViewFields = {
  currentDataView: DataView;
  setDataView: (dataView: DataView) => void;
  selectedTimeSegment: TimeSegments | null;
  setSelectedTimeSegment: (timeSegment: TimeSegments) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

const DataViewContext = createContext<DataViewFields | null>(null);

export const DataViewProvider = ({
  children,
}: {
  children: React.JSX.Element;
}): React.JSX.Element => {
  const [currentDataView, setDataView] = useState<DataView>(
    DataViewEnum.NoView,
  );
  const [selectedTimeSegment, setSelectedTimeSegment] =
    useState<TimeSegments | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <DataViewContext.Provider
      value={{
        currentDataView,
        setDataView,
        selectedTimeSegment,
        setSelectedTimeSegment,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </DataViewContext.Provider>
  );
};

export const useDataViewContext = (): DataViewFields => {
  const dataViewContext = useContext(DataViewContext);
  if (dataViewContext == null) {
    throw new Error("cannot use DataViewContext outside of DataViewProvider");
  }
  return dataViewContext;
};
