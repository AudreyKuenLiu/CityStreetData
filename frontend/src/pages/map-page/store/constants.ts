import { Brand } from "../../../types";

export enum StreetEvent {
  TrafficCrashes = "TRAFFIC_CRASHES",
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
