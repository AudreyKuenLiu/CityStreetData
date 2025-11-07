import { create } from "zustand";
import { StreetSegment } from "../../../models/map-grid";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { getRandomColor } from "../../../utils";
import { StreetEvent, GroupId, emptyGroupId, TimeSegments } from "./constants";

type StreetMapFormActions = {
  addGroup: ({ name }: { name: string }) => { id: GroupId; color: string };
  removeGroup: ({ id }: { id: GroupId }) => boolean;
  setCurrentGroup: ({ id }: { id: GroupId }) => boolean;
  editGroup: ({ id, name }: { id: GroupId; name: string }) => boolean;
  toggleStreet: (streetSegment: StreetSegment) => boolean;
  addStreet: (StreetSegment: StreetSegment) => boolean;
  removeStreet: (cnn: number) => boolean;
  setTimeSegment: (timeSegment: TimeSegments) => void;
  setStreetEvent: (streetEvent: StreetEvent) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  resetIsDirty: () => void;
};

type StreetGroup = {
  id: GroupId;
  name: string;
  color: string;
  cnns: Map<number, StreetSegment>;
};

type StreetMapForm = {
  streetGroups: Map<GroupId, StreetGroup>;
  _cnnToGroupId: Map<number, GroupId>;
  currentGroupId: GroupId;
  streetEvent: StreetEvent;
  startDate: Date | null;
  endDate: Date | null;
  timeSegment: TimeSegments | null;
  isReady: boolean;
  isDirty: boolean;
  actions: StreetMapFormActions;
};

type StreetMapFormState = Omit<StreetMapForm, "actions">;

const isStreetMapFormReady = (
  oldState: StreetMapFormState,
  newState: Partial<StreetMapFormState>
): boolean => {
  const streetGroupHasCnn = (
    streetGroup: Map<GroupId, StreetGroup>
  ): boolean => {
    const streetGroups = Array.from(streetGroup.entries());
    return streetGroups.some(([_, streetGroup]) => {
      return streetGroup.cnns.size > 0;
    });
  };
  const hasCnns =
    newState.streetGroups !== undefined
      ? streetGroupHasCnn(newState.streetGroups)
      : streetGroupHasCnn(oldState.streetGroups);
  // const hasStreetEvent =
  //   newState.streetEvent !== undefined
  //     ? newState.streetEvent != null
  //     : oldState.streetEvent != null;
  const hasStartDate =
    newState.startDate !== undefined
      ? newState.startDate != null
      : oldState.startDate != null;
  const hasEndDate =
    newState.endDate !== undefined
      ? newState.endDate != null
      : oldState.endDate != null;
  const hasTimeSegment =
    newState.timeSegment !== undefined
      ? newState.timeSegment != null
      : oldState.timeSegment != null;

  console.log("it is ready", hasCnns, hasEndDate, hasStartDate, hasTimeSegment);

  return (
    hasCnns &&
    // &&  hasStreetEvent
    hasStartDate &&
    hasEndDate &&
    hasTimeSegment
  );
};

const getCurrentStreetGroup = (
  curState: StreetMapFormState
): [StreetGroup, true] | [undefined, false] => {
  const streetGroup = curState.streetGroups.get(curState.currentGroupId);
  if (streetGroup == null) {
    return [undefined, false];
  }
  return [streetGroup, true];
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
const addStreetToGroup = (
  curState: StreetMapForm,
  curStreetGroup: StreetGroup,
  streetSegment: StreetSegment
): void => {
  const cnnMap = curStreetGroup.cnns;
  removeCnnFromGroup(curState, streetSegment.cnn);
  cnnMap.set(streetSegment.cnn, streetSegment);
  curState._cnnToGroupId.set(streetSegment.cnn, curStreetGroup.id);
};

const useStreetMapDataForm = create<StreetMapForm>()(
  devtools(
    (set) => ({
      streetGroups: new Map<string, StreetGroup>(),
      currentGroupId: emptyGroupId,
      streetEvent: StreetEvent.TrafficCrashes,
      timeSegment: null,
      startDate: null,
      endDate: null,
      isReady: false,
      isDirty: false,
      _cnnToGroupId: new Map<number, string>(), //more of an internal field to keep track of where cnns are do not use in selector
      actions: {
        addGroup: ({
          name,
        }: {
          name: string;
        }): { id: GroupId; color: string } => {
          const id = crypto.randomUUID() as GroupId;
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
        removeGroup: ({ id }: { id: GroupId }): boolean => {
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
              isReady: isStreetMapFormReady(state, {
                streetGroups: updatedMap,
              }),
            };
          });
          return ret;
        },
        editGroup: ({ id, name }: { id: GroupId; name: string }): boolean => {
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
        setCurrentGroup: ({ id }: { id: GroupId }): boolean => {
          console.log("setting current group", id);
          let ret = true;
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
            const [streetGroup, isNull] = getCurrentStreetGroup(state);
            if (isNull === false) {
              ret = false;
              return {};
            }

            const cnnMap = streetGroup.cnns;
            if (cnnMap.has(streetSegment.cnn)) {
              cnnMap.delete(streetSegment.cnn);
            } else {
              addStreetToGroup(state, streetGroup, streetSegment);
            }

            return {
              isReady: isStreetMapFormReady(state, {
                streetGroups: state.streetGroups,
              }),
              isDirty: true,
            };
          });
          return ret;
        },
        addStreet: (streetSegment: StreetSegment): boolean => {
          let ret = true;
          set((state) => {
            const [streetGroup, isNull] = getCurrentStreetGroup(state);
            if (isNull === false) {
              ret = false;
              return {};
            }
            addStreetToGroup(state, streetGroup, streetSegment);
            return {
              isReady: isStreetMapFormReady(state, {
                streetGroups: state.streetGroups,
              }),
              isDirty: true,
            };
          });
          return ret;
        },
        removeStreet: (cnn: number): boolean => {
          let ret = true;
          set((state) => {
            if (!removeCnnFromGroup(state, cnn)) {
              ret = false;
              return {};
            }

            return {
              isReady: isStreetMapFormReady(state, {
                streetGroups: state.streetGroups,
              }),
              isDirty: true,
            };
          });
          return ret;
        },
        setStreetEvent: (streetEvent): void => {
          set((state) => {
            return {
              streetEvent,
              isReady: isStreetMapFormReady(state, { streetEvent }),
              isDirty: true,
            };
          });
        },
        setTimeSegment: (timeSegment): void => {
          set((state) => {
            return {
              timeSegment,
              isReady: isStreetMapFormReady(state, {
                timeSegment,
              }),
              isDirty: true,
            };
          });
        },
        setStartDate: (startDate): void => {
          const newDate = startDate != null ? new Date(startDate) : null;
          set((state) => {
            return {
              startDate: newDate,
              isReady: isStreetMapFormReady(state, { startDate: newDate }),
              isDirty: true,
            };
          });
        },
        setEndDate: (endDate): void => {
          const newDate = endDate != null ? new Date(endDate) : null;
          set((state) => {
            return {
              endDate: newDate,
              isReady: isStreetMapFormReady(state, { endDate: newDate }),
              isDirty: true,
            };
          });
        },
        resetIsDirty: (): void => {
          set(() => {
            return {
              isDirty: false,
            };
          });
        },
      },
    }),
    { name: "StreetMapDataForm" }
  )
);

export const useTimeSegment = (): TimeSegments | null => {
  return useStreetMapDataForm((state) => state.timeSegment);
};
export const useStartDate = (): Date | null => {
  return useStreetMapDataForm((state) => state.startDate);
};
export const useEndDate = (): Date | null => {
  return useStreetMapDataForm((state) => state.endDate);
};
export const useStreetEvent = (): StreetEvent => {
  return useStreetMapDataForm((state) => state.streetEvent);
};
export const useIsDirty = (): boolean => {
  return useStreetMapDataForm(useShallow((state) => state.isDirty));
};
export const useIsReady = (): boolean => {
  return useStreetMapDataForm(useShallow((state) => state.isReady));
};
export const useCnns = (): StreetSegment[] => {
  return useStreetMapDataForm(
    useShallow((state) => {
      const currentGroup = state.streetGroups.get(state.currentGroupId);
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
      return state.streetGroups.get(state.currentGroupId) ?? null;
    })
  );
};
export const useActions = (): StreetMapFormActions => {
  return useStreetMapDataForm((state) => state.actions);
};
