import { create } from "zustand";
import { StreetSegment } from "../../../../models/map-grid";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { getRandomColor } from "../../../../utils";

enum StreetEvent {
  TrafficCrashes = "TRAFFIC_CRASHES",
}
type StreetMapFormActions = {
  addGroup: ({ name }: { name: string }) => { id: string; color: string };
  removeGroup: ({ id }: { id: string }) => boolean;
  setCurrentGroup: ({ id }: { id: string }) => boolean;
  editGroup: ({ id, name }: { id: string; name: string }) => boolean;
  toggleStreet: (streetSegment: StreetSegment) => boolean;
  addStreet: (StreetSegment: StreetSegment) => boolean;
  removeStreet: (cnn: number) => boolean;
  setStreetEvent: (streetEvent: StreetEvent | null) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
};

type StreetGroup = {
  id: string;
  name: string;
  color: string;
  cnns: Map<number, StreetSegment>;
};

type StreetMapForm = {
  streetGroups: Map<string, StreetGroup>;
  _cnnToGroupId: Map<number, string>;
  currentGroupId: string | null;
  streetEvent: StreetEvent | null;
  startDate: Date | null;
  endDate: Date | null;
  isReady: boolean;
  actions: StreetMapFormActions;
};

type StreetMapFormState = Omit<StreetMapForm, "actions">;

const isStreetMapFormReady = (
  oldState: StreetMapFormState,
  newState: Partial<StreetMapFormState>
): boolean => {
  // const hasCnns =
  //   newState.streetGroups !== undefined
  //     ? newState.streetGroups.entries.length> 0
  //     : oldState.streetGroups.entries.length> 0;
  const hasStreetEvent =
    newState.streetEvent !== undefined
      ? newState.streetEvent != null
      : oldState.streetEvent != null;
  const hasStartDate =
    newState.startDate !== undefined
      ? newState.startDate != null
      : oldState.startDate != null;
  const hasEndDate =
    newState.endDate !== undefined
      ? newState.endDate != null
      : oldState.endDate != null;

  //return hasCnns && hasStreetEvent && hasStartDate && hasEndDate;
  return hasStreetEvent && hasStartDate && hasEndDate;
};

const getCurrentStreetGroup = (
  curState: StreetMapFormState
):
  | [Map<string, StreetGroup>, StreetGroup, true]
  | [undefined, undefined, false] => {
  const updatedStreetGroups = new Map(curState.streetGroups);
  const streetGroup = updatedStreetGroups.get(curState.currentGroupId ?? "");
  if (streetGroup == null) {
    return [undefined, undefined, false];
  }
  return [updatedStreetGroups, streetGroup, true];
};
const removeCnnFromGroup = (
  curState: StreetMapFormState,
  cnn: number
): boolean => {
  const _cnnToGroupId = curState._cnnToGroupId;
  const groupId = _cnnToGroupId.get(cnn);
  if (groupId == null) {
    return false;
  }
  const oldStreetSegmentGroup = curState.streetGroups.get(groupId);
  if (oldStreetSegmentGroup == null) {
    return false;
  }
  oldStreetSegmentGroup.cnns.delete(cnn);
  return true;
};

const useStreetMapDataForm = create<StreetMapForm>()(
  devtools(
    (set) => ({
      streetGroups: new Map<string, StreetGroup>(),
      currentGroupId: null,
      //cnns: new Map(),
      streetEvent: null,
      startDate: null,
      endDate: null,
      isReady: false,
      _cnnToGroupId: new Map<number, string>(), //more of an internal field to keep track of where cnns are do not use in selector
      actions: {
        addGroup: ({
          name,
        }: {
          name: string;
        }): { id: string; color: string } => {
          const id = crypto.randomUUID();
          let color = "";
          set((state) => {
            const newStreetGroups = new Map(state.streetGroups);
            color = getRandomColor();
            newStreetGroups.set(id, {
              id,
              name,
              color,
              cnns: new Map<number, StreetSegment>(),
            });
            return {
              streetGroups: newStreetGroups,
            };
          });
          return { id, color };
        },
        removeGroup: ({ id }: { id: string }): boolean => {
          let ret = true;
          set((state) => {
            if (!state.streetGroups.has(id)) {
              ret = false;
              return {};
            }
            const updatedMap = new Map(state.streetGroups);
            const streetGroup = updatedMap.get(id);
            for (const cnn of streetGroup?.cnns.keys() ?? []) {
              state._cnnToGroupId.delete(cnn);
            }
            updatedMap.delete(id);
            return {
              streetGroups: updatedMap,
              _cnnToGroupId: state._cnnToGroupId,
            };
          });
          return ret;
        },
        editGroup: ({ id, name }: { id: string; name: string }): boolean => {
          let ret = true;
          set((state) => {
            const updatedMap = new Map(state.streetGroups);
            const streetGroup = updatedMap.get(id);
            if (streetGroup == null) {
              ret = false;
              return {};
            }
            const newStreetGroup = { ...streetGroup };
            newStreetGroup.name = name;
            updatedMap.set(id, newStreetGroup);
            return {
              streetGroups: updatedMap,
            };
          });
          return ret;
        },
        setCurrentGroup: ({ id }: { id: string }): boolean => {
          let ret = true;
          console.log("selecting currentGroupId", id);
          set((state) => {
            if (!state.streetGroups.has(id)) {
              ret = false;
              return {};
            }
            return {
              currentGroupId: id,
            };
          });
          return ret;
        },
        toggleStreet: (streetSegment: StreetSegment): boolean => {
          let ret = true;
          set((state) => {
            const [updatedStreetGroups, streetGroup, isNull] =
              getCurrentStreetGroup(state);
            if (isNull === false) {
              ret = false;
              return {};
            }

            const cnnMap = streetGroup.cnns;
            if (cnnMap.has(streetSegment.cnn)) {
              cnnMap.delete(streetSegment.cnn);
            } else {
              removeCnnFromGroup(state, streetSegment.cnn);
              cnnMap.set(streetSegment.cnn, streetSegment);
              state._cnnToGroupId.set(streetSegment.cnn, streetGroup.id);
            }

            return {
              streetGroups: updatedStreetGroups,
              _cnnToGroupId: state._cnnToGroupId,
              isReady: isStreetMapFormReady(state, {
                streetGroups: updatedStreetGroups,
              }),
            };
          });
          return ret;
        },
        addStreet: (streetSegment: StreetSegment): boolean => {
          let ret = true;
          set((state) => {
            const [updatedStreetGroups, streetGroup, isNull] =
              getCurrentStreetGroup(state);
            if (isNull === false) {
              ret = false;
              return {};
            }

            const cnnMap = streetGroup.cnns;
            removeCnnFromGroup(state, streetSegment.cnn);
            cnnMap.set(streetSegment.cnn, streetSegment);
            state._cnnToGroupId.set(streetSegment.cnn, streetGroup.id);

            return {
              streetGroups: updatedStreetGroups,
              _cnnToGroupId: state._cnnToGroupId,
              isReady: isStreetMapFormReady(state, {
                streetGroups: updatedStreetGroups,
              }),
            };
          });
          return ret;
        },
        removeStreet: (cnn: number): boolean => {
          let ret = true;
          set((state) => {
            if (removeCnnFromGroup(state, cnn) === false) {
              ret = false;
              return {};
            }

            return {
              streetGroups: state.streetGroups,
              _cnnToGroupId: state._cnnToGroupId,
              isReady: isStreetMapFormReady(state, {
                streetGroups: state.streetGroups,
              }),
            };
          });
          return ret;
        },
        setStreetEvent: (streetEvent): void => {
          set((state) => {
            return {
              streetEvent,
              isReady: isStreetMapFormReady(state, { streetEvent }),
            };
          });
        },
        setStartDate: (startDate): void => {
          set((state) => {
            return {
              startDate,
              isReady: isStreetMapFormReady(state, { startDate }),
            };
          });
        },
        setEndDate: (endDate): void => {
          set((state) => {
            return {
              endDate,
              isReady: isStreetMapFormReady(state, { endDate }),
            };
          });
        },
      },
    }),
    { name: "StreetMapDataForm" }
  )
);

export const useIsReady = (): boolean => {
  return useStreetMapDataForm((state) => state.isReady);
};
export const useCnns = (): StreetSegment[] => {
  return useStreetMapDataForm(
    useShallow((state) => {
      const currentGroup = state.streetGroups.get(state.currentGroupId ?? "");
      if (currentGroup == null) {
        return [];
      }
      return Array.from(currentGroup.cnns.values());
    })
  );
};
export const useStreetGroups = (): Map<string, StreetGroup> => {
  return useStreetMapDataForm(
    useShallow((state) => {
      return state.streetGroups;
    })
  );
};
export const useCurrentStreetGroup = (): StreetGroup | null => {
  return useStreetMapDataForm(
    useShallow((state) => {
      return state.streetGroups.get(state.currentGroupId ?? "") ?? null;
    })
  );
};
export const useActions = (): StreetMapFormActions => {
  return useStreetMapDataForm((state) => state.actions);
};
