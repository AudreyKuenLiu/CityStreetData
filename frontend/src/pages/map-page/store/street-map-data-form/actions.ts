import {
  StreetMapFormActions,
  StreetMapForm,
  GroupId,
  StreetMapFormState,
  StreetGroup,
} from "./types";
import { StreetSegment } from "../../../../models/map-grid";
import { getRandomColor } from "../../../../utils";
import { StoreApi } from "zustand";

const isStreetMapFormReady = (
  oldState: StreetMapFormState,
  newState: Partial<StreetMapFormState>,
): boolean => {
  const streetGroupHasCnn = (
    streetGroup: Map<GroupId, StreetGroup>,
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

  return (
    hasCnns &&
    // &&  hasStreetEvent
    hasStartDate &&
    hasEndDate &&
    hasTimeSegment
  );
};
const getCurrentStreetGroup = (
  curState: StreetMapFormState,
): [StreetGroup, true] | [undefined, false] => {
  const streetGroup = curState.streetGroups.get(curState.currentGroupId);
  if (streetGroup == null) {
    return [undefined, false];
  }
  return [streetGroup, true];
};
const removeCnnFromGroup = (
  curState: StreetMapFormState,
  cnn: number,
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
  curState._cnnToGroupId.delete(cnn);
  return true;
};
const addStreetToGroup = (
  curState: StreetMapForm,
  curStreetGroup: StreetGroup,
  streetSegment: StreetSegment,
): void => {
  const cnnMap = curStreetGroup.cnns;
  removeCnnFromGroup(curState, streetSegment.cnn);
  cnnMap.set(streetSegment.cnn, streetSegment);
  curState._cnnToGroupId.set(streetSegment.cnn, curStreetGroup.id);
};

export const actions = ({
  setState,
}: Pick<StoreApi<StreetMapForm>, "setState">): StreetMapFormActions => ({
  addGroup: ({ name }: { name: string }): { id: GroupId; color: string } => {
    const id = crypto.randomUUID() as GroupId;
    let color = "";
    setState((state) => {
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
    setState((state) => {
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
    setState((state) => {
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
    let ret = true;
    setState((state) => {
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
    setState((state) => {
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
    setState((state) => {
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
    setState((state) => {
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
  setTimeSegment: (timeSegment): void => {
    setState((state) => {
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
    setState((state) => {
      return {
        startDate: newDate,
        isReady: isStreetMapFormReady(state, { startDate: newDate }),
        isDirty: true,
      };
    });
  },
  setEndDate: (endDate): void => {
    const newDate = endDate != null ? new Date(endDate) : null;
    setState((state) => {
      return {
        endDate: newDate,
        isReady: isStreetMapFormReady(state, { endDate: newDate }),
        isDirty: true,
      };
    });
  },
  resetIsDirty: (): void => {
    setState(() => {
      return {
        isDirty: false,
      };
    });
  },
});
