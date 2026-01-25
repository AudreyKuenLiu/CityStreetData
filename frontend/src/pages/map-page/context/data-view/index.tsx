import React, { createContext, useContext, useState } from "react";
import { DataViewEnum, type DataView } from "./types";

type DataViewFields = {
  currentDataView: DataView;
  setDataView: (dataView: DataView) => void;
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

  return (
    <DataViewContext.Provider
      value={{
        currentDataView,
        setDataView,
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
