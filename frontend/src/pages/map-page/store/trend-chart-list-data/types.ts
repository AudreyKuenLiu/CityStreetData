import { GroupId } from "../street-map-data-form";
import {
  CollisionSeverity,
  CrashClassification,
} from "../../../../models/api-models";
import { CrashMap } from "../../../../models/map-models";
import { UserFields } from "../../context/data-view";
import z from "zod";
import { InjuryCrashTypeFilter } from "../../types/data-view";

export enum TimeTrendsEnum {
  HOURLY, //0-24hrs
  DAILY, //Mon - Fri
  MONTHLY, //Jan - Dec
}

const TimeTrendFilterSchema = z.object({
  AllInjuries: "AllInjuries",
  SevereInjuries: "SevereInjuries",
  VehicleInvolvedCrashes: "VehicleInvolvedCrashes",
  BicycleInvolvedCrashes: "BicycleInvolvedCrashes",
  PedestrianInvolvedCrashes: "PedestrianInvolvedCrashes",
} as const);
export const TimeTrendFilterKeys = TimeTrendFilterSchema.keyof();
export const TimeTrendFilterEnum = TimeTrendFilterSchema.shape;
export type TimeTrendFilter =
  (typeof TimeTrendFilterEnum)[keyof typeof TimeTrendFilterEnum];

export const AverageLineSeriesId = "Average";
export const timeTrendsToAxis = {
  [TimeTrendsEnum.HOURLY]: [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ],
  [TimeTrendsEnum.DAILY]: ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"],
  [TimeTrendsEnum.MONTHLY]: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
} as const;

export type TimeTrendCrashStat = {
  crashClassification: CrashClassification;
  collisionSeverity: CollisionSeverity;
  numberInjured: number;
  numberKilled: number;
  occuredAt: Date;
};

export type GroupTimeTrendData = (readonly [
  GroupId,
  { timeSegment: Date; crashStats: TimeTrendCrashStat[] }[],
])[];

export type TrendListData = {
  currentTimeTrend: TimeTrendsEnum;
  currentTimeTrendFilter: InjuryCrashTypeFilter;
  groupTimeTrendData: GroupTimeTrendData;
  actions: TrendListActions;
};
export type TrendListActions = {
  initializeGraphData: ({
    data,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedTimeSegment,
  }: { data: CrashMap } & UserFields) => void;
  setGraphData: (data: GroupTimeTrendData) => void;
  setTimeTrendFilter: (filter: InjuryCrashTypeFilter) => void;
  setCurrentTimeTrend: (timeTrend: TimeTrendsEnum) => void;
};
