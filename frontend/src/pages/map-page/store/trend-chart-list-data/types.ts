import { GroupId } from "../street-map-data-form";
import {
  CollisionSeverity,
  CrashClassification,
} from "../../../../models/api-models";

export enum TimeTrends {
  HOURLY, //0-24hrs
  DAILY, //Mon - Fri
  MONTHLY, //Jan - Dec
}

export const AverageLineSeriesId = "Average";

type DateCrashStats = {
  crashClassification: CrashClassification;
  collisionSeverity: CollisionSeverity;
  numberInjured: number;
  numberKilled: number;
  occuredAt: Date;
};

export type GroupTrendData = Map<
  GroupId,
  { timeSegment: Date; crashStats: DateCrashStats[] }[]
>;
export type TrendListData = {
  currentTimeTrend: TimeTrends;
  groupTrendData: GroupTrendData;
  actions: TrendListActions;
};
export type TrendListActions = {
  setGraphData: (data: GroupTrendData) => void;
  setCurrentTimeTrend: (timeTrend: TimeTrends) => void;
};
