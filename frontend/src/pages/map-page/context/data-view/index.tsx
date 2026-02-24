import React, { createContext, useContext, useState } from "react";
import { DataViewEnum, type DataView } from "./types";
import {
  TimeSegments,
  useStreetGroupsRef,
} from "../../store/street-map-data-form";

type StreetGroups = ReturnType<typeof useStreetGroupsRef>;

type DataViewFields = {
  currentDataView: DataView;
  selectedIsDirtyHash: string | null;
  setSelectedIsDirtyHash: (isDirtyHash: string) => void;
  setDataView: (dataView: DataView) => void;
  selectedTimeSegment: TimeSegments | null;
  setSelectedTimeSegment: (timeSegment: TimeSegments) => void;
  selectedStartEndTime: [Date, Date] | null;
  setSelectedStartEndTime: (startEndTime: [Date, Date]) => void;
  selectedStreetGroups: StreetGroups | null;
  setSelectedStreetGroups: (streetGroups: StreetGroups) => void;
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
