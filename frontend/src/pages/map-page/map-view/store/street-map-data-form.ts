import { create } from "zustand";
import { StreetSegment } from "../../../../models/map-grid";
import { useShallow } from "zustand/shallow";

enum StreetEvent {
  TrafficCrashes = "TRAFFIC_CRASHES",
}
type StreetMapFormActions = {
  toggleStreet: (streetSegment: StreetSegment) => void;
  addStreet: (StreetSegment: StreetSegment) => void;
  removeStreet: (cnn: number) => void;
  setStreetEvent: (streetEvent: StreetEvent | null) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
};

type StreetMapForm = {
  cnns: Map<number, StreetSegment>;
  streetEvent: StreetEvent | null;
  startDate: Date | null;
  endDate: Date | null;
  isReady: boolean;
  actions: StreetMapFormActions;
};

const isStretMapFormReady = (
  oldState: Omit<StreetMapForm, "actions">,
  newState: Partial<Omit<StreetMapForm, "actions">>
): boolean => {
  const hasCnns =
    newState.cnns !== undefined
      ? newState.cnns.size > 0
      : oldState.cnns.size > 0;
  const hasStreetEvent =
    newState.streetEvent !== undefined
      ? newState.streetEvent != null
      : oldState.streetEvent != null;
  const hasStartDate =
    newState.cnns !== undefined
      ? newState.startDate != null
      : oldState.startDate != null;
  const hasEndDate =
    newState.cnns !== undefined
      ? newState.endDate != null
      : oldState.endDate != null;

  return hasCnns && hasStreetEvent && hasStartDate && hasEndDate;
};

const useStreetMapDataForm = create<StreetMapForm>((set) => ({
  cnns: new Map(),
  streetEvent: null,
  startDate: null,
  endDate: null,
  isReady: false,
  actions: {
    toggleStreet: (streetSegment: StreetSegment): void => {
      set((state) => {
        const updatedMap = new Map(state.cnns);
        if (updatedMap.has(streetSegment.cnn)) {
          updatedMap.delete(streetSegment.cnn);
        } else {
          updatedMap.set(streetSegment.cnn, streetSegment);
        }

        return {
          cnns: updatedMap,
          isReady: isStretMapFormReady(state, { cnns: updatedMap }),
        };
      });
    },
    addStreet: (streetSegment: StreetSegment): void => {
      set((state) => {
        const updatedMap = new Map(state.cnns);
        updatedMap.set(streetSegment.cnn, streetSegment);
        return {
          cnns: updatedMap,
          isReady: isStretMapFormReady(state, { cnns: updatedMap }),
        };
      });
    },
    removeStreet: (cnn: number): void => {
      set((state) => {
        const updatedMap = new Map(state.cnns);
        updatedMap.delete(cnn);
        return {
          cnns: updatedMap,
          isReady: isStretMapFormReady(state, { cnns: updatedMap }),
        };
      });
    },
    setStreetEvent: (streetEvent): void => {
      set((state) => {
        return {
          streetEvent,
          isReady: isStretMapFormReady(state, { streetEvent }),
        };
      });
    },
    setStartDate: (startDate): void => {
      set((state) => {
        return {
          startDate,
          isReady: isStretMapFormReady(state, { startDate }),
        };
      });
    },
    setEndDate: (endDate): void => {
      set((state) => {
        return {
          endDate,
          isReady: isStretMapFormReady(state, { endDate }),
        };
      });
    },
  },
}));

export const useIsReady = (): boolean => {
  return useStreetMapDataForm((state) => state.isReady);
};
export const useCnns = (): StreetSegment[] => {
  return useStreetMapDataForm(
    useShallow((state) => Array.from(state.cnns.values()))
  );
};
export const useActions = (): StreetMapFormActions => {
  return useStreetMapDataForm((state) => state.actions);
};
