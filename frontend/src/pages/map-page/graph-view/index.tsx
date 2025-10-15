import React from "react";
import { GroupId } from "../store/constants";
import { CrashEvents } from "../../../models/api-models";

interface GraphViewParams {
  isLoading: boolean;
  groupCrashes: Map<GroupId, CrashEvents[]>;
}

export const GraphView = ({
  isLoading,
  groupCrashes,
}: GraphViewParams): React.JSX.Element => {
  if (isLoading) {
    return <div></div>;
  }
  return <div></div>;
};
