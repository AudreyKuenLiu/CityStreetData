import { create } from "zustand";
import {
  emptyGroupId,
  TimeSegments,
  StreetMapFormActions,
  StreetMapForm,
  StreetGroup,
} from "./types";
import { StreetSegment } from "../../../../models/map-grid";
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
      isDirty: false,
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
    }),
  );
};
export const useStreetGroups = (): Map<string, StreetGroup> => {
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
