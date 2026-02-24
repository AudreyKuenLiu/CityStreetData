import { create } from "zustand";
import {
  emptyGroupId,
  TimeSegments,
  StreetMapFormActions,
  StreetMapForm,
  StreetGroup,
  GroupId,
} from "./types";
import { StreetSegment } from "../../../../models/map-models";
import { devtools } from "zustand/middleware";
import { actions } from "./actions";
import { useShallow } from "zustand/shallow";

const useStreetMapDataForm = create<StreetMapForm>()(
  devtools(
    (set) => ({
      streetGroups: new Map<string, StreetGroup>(),
      currentGroupId: emptyGroupId,
      timeSegment: null,
      startDate: null,
      endDate: null,
      isReady: false,
      isDirtyHash: null,
      _cnnToGroupId: new Map<number, string>(), //more of an internal field to keep track of where cnns are do not use in selector
      actions: actions({ setState: set }),
    }),
    { name: "StreetMapDataForm" },
  ),
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
export const useIsDirty = (): boolean => {
  return useStreetMapDataForm(useShallow((state) => state.isDirtyHash)) != null;
};
export const useIsDirtyHash = (): string | null => {
  return useStreetMapDataForm(useShallow((state) => state.isDirtyHash));
};
export const useIsReady = (): boolean => {
  return useStreetMapDataForm(useShallow((state) => state.isReady));
};
export const useCnns = (): StreetSegment[] => {
  return useStreetMapDataForm(
    useShallow((state) => {
      const streetGroups = Array.from(state.streetGroups.entries()).map(
        ([_, streetGroups]) => streetGroups,
      );
      const cnns: StreetSegment[] = [];
      for (const streetGroup of streetGroups) {
        for (const [, streetSegment] of streetGroup.cnns.entries()) {
          cnns.push(streetSegment);
        }
      }

      return cnns;
    }),
  );
};
export const useStreetGroups = (): Map<GroupId, StreetGroup> => {
  return useStreetMapDataForm((state) => {
    return state.streetGroups;
  });
};

export const useStreetGroupsRef = (): Map<GroupId, StreetGroup> => {
  return useStreetMapDataForm(
    useShallow((state) => {
      return state.streetGroups;
    }),
  );
};
export const useCurrentStreetGroup = (): StreetGroup | null => {
  return useStreetMapDataForm(
    useShallow((state) => {
      return state.streetGroups.get(state.currentGroupId) ?? null;
    }),
  );
};
export const useActions = (): StreetMapFormActions => {
  return useStreetMapDataForm((state) => state.actions);
};
