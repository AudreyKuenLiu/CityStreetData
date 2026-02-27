import React, { createContext, useContext, useState } from "react";
import { DataViewEnum, type DataView } from "./types";
import { TimeSegments } from "../../store/street-map-data-form";
import type { StreetGroups } from "../../store/street-map-data-form";

export interface UserFields {
  selectedTimeSegment: TimeSegments;
  selectedStartEndTime: [Date, Date];
  selectedStreetGroups: StreetGroups;
}

type OptionalFields<T> = {
  [K in keyof T]: T[K] | null;
};

type DataViewFields = {
  currentDataView: DataView;
  selectedIsDirtyHash: string | null;
  setSelectedIsDirtyHash: (isDirtyHash: string) => void;
  setDataView: (dataView: DataView) => void;
  setSelectedTimeSegment: (timeSegment: TimeSegments) => void;
  setSelectedStartEndTime: (startEndTime: [Date, Date]) => void;
  setSelectedStreetGroups: (streetGroups: StreetGroups) => void;
} & OptionalFields<UserFields>;

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
  const [selectedStartEndTime, setSelectedStartEndTime] = useState<
    [Date, Date] | null
  >(null);
  const [selectedStreetGroups, setSelectedStreetGroups] =
    useState<StreetGroups | null>(null);
  const [selectedIsDirtyHash, setSelectedIsDirtyHash] = useState<string | null>(
    null,
  );

  return (
    <DataViewContext.Provider
      value={{
        selectedIsDirtyHash,
        setSelectedIsDirtyHash,
        currentDataView,
        setDataView,
        selectedTimeSegment,
        setSelectedTimeSegment,
        selectedStartEndTime,
        setSelectedStartEndTime,
        selectedStreetGroups,
        setSelectedStreetGroups,
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
