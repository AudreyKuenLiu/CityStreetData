import { Brand } from "../../../../types";
import { StreetSegment } from "../../../../models/map-grid";

export enum TimeSegments {
  OneMonth = "1M",
  ThreeMonths = "3M",
  OneYear = "1Y",
}

export type GroupId = Brand<string, "GroupId">;
export const emptyGroupId = "00000000-0000-0000-0000-000000000000" as GroupId;
const validateIsGroupId = (id: string): boolean => {
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
};
export const convertToGroupId = (id: string): GroupId | undefined => {
  if (validateIsGroupId(id)) {
    return id as GroupId;
  }
  return;
};

export type StreetGroup = {
  id: GroupId;
  name: string;
  color: string;
  cnns: Map<number, StreetSegment>;
};

export type StreetMapFormActions = {
  addGroup: ({ name }: { name: string }) => { id: GroupId; color: string };
  removeGroup: ({ id }: { id: GroupId }) => boolean;
  setCurrentGroup: ({ id }: { id: GroupId }) => boolean;
  editGroup: ({ id, name }: { id: GroupId; name: string }) => boolean;
  toggleStreet: (streetSegment: StreetSegment) => boolean;
  addStreet: (StreetSegment: StreetSegment) => boolean;
  removeStreet: (cnn: number) => boolean;
  setTimeSegment: (timeSegment: TimeSegments) => void;
  setStartDate: (startDate: Date | null) => void;
  setEndDate: (endDate: Date | null) => void;
  resetIsDirty: () => void;
};

export type StreetMapFormState = Omit<StreetMapForm, "actions">;

export type StreetMapForm = {
  streetGroups: Map<GroupId, StreetGroup>;
  _cnnToGroupId: Map<number, GroupId>;
  currentGroupId: GroupId;
  startDate: Date | null;
  endDate: Date | null;
  timeSegment: TimeSegments | null;
  isReady: boolean;
  isDirty: boolean;
  actions: StreetMapFormActions;
};
