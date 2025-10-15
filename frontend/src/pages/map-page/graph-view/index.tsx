import React from "react";
import { GroupId } from "../store/constants";
import { CrashEvents } from "../../../models/api-models";

interface GraphViewParams {
  isLoading: string;
  GroupCrashes: Map<GroupId, CrashEvents[]>;
}

export const GraphView = ({
  isLoading,
  GroupCrashes,
}: GraphViewParams): React.JSX.Element => {
  return <div></div>;
};
