import React, { createContext, useContext, useState } from "react";
import { DataViewEnum, type DataView } from "./types";

type DataViewFields = {
  currentDataView: DataView;
  setDataView: (dataView: DataView) => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <DataViewContext.Provider
      value={{
        currentDataView,
        setDataView,
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
