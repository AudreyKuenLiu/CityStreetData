import type { DataView } from "../../../../context/data-view/types";

export interface UseDataViewControllerProps {
  getData: () => Promise<void>;
  isLoading: boolean;
}

export interface UseDataViewQueryProps {
  canGetData: boolean;
  currentDataView: DataView;
  setDataView: (e: DataView) => void;
  getData: (selectedDataView?: DataView) => Promise<void>;
  isLoading: boolean;
}
