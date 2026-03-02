import type { GroupId } from "../store/street-map-data-form";
import { CrashClassificationEnum } from "../../../models/api-models";
import z from "zod";

export type GroupLineData<
  T extends string[] | string = string,
  X extends string | number | Date = Date,
  Y extends string | number | Date = number,
> = {
  id: GroupId;
  tickValues: X[];
  lineSeries: readonly {
    readonly id: T extends string ? T : T[number];
    readonly data: { x: X; y: Y }[];
    readonly color: string;
  }[];
  axisLegend: string;
}[];

const InjuryCrashTypeFilterSchema = z.object({
  AllInjuries: "AllInjuries",
  SevereInjuries: "SevereInjuries",
  VehicleInvolvedCrashes: "VehicleInvolvedCrashes",
  BicycleInvolvedCrashes: "BicycleInvolvedCrashes",
  PedestrianInvolvedCrashes: "PedestrianInvolvedCrashes",
} as const);
export const InjuryCrashTypeFilterKeys = InjuryCrashTypeFilterSchema.keyof();
export const InjuryCrashTypeFilterEnum = InjuryCrashTypeFilterSchema.shape;
export type InjuryCrashTypeFilter =
  (typeof InjuryCrashTypeFilterEnum)[keyof typeof InjuryCrashTypeFilterEnum];

export const injuryCrashTypeToCrashClassification = {
  [InjuryCrashTypeFilterEnum.BicycleInvolvedCrashes]: [
    CrashClassificationEnum.BicycleOnly,
    CrashClassificationEnum.BicycleParkedCar,
    CrashClassificationEnum.BicyclePedestrian,
    CrashClassificationEnum.VehicleBicyclePedestrian,
    CrashClassificationEnum.BicycleUnknown,
    CrashClassificationEnum.VehicleBicycle,
  ],
  [InjuryCrashTypeFilterEnum.PedestrianInvolvedCrashes]: [
    CrashClassificationEnum.PedestrianOnly,
    CrashClassificationEnum.BicyclePedestrian,
    CrashClassificationEnum.VehicleBicyclePedestrian,
    CrashClassificationEnum.VehiclePedestrian,
  ],
  [InjuryCrashTypeFilterEnum.VehicleInvolvedCrashes]: [
    CrashClassificationEnum.VehiclesOnly,
    CrashClassificationEnum.VehicleBicycle,
    CrashClassificationEnum.VehicleBicyclePedestrian,
    CrashClassificationEnum.VehiclePedestrian,
  ],
} as const;

export const injuryCrashTypeOptions = [
  {
    label: <span>Traffic Injuries</span>,
    title: "Traffic Injuries",
    options: [
      {
        label: <span>All Injuries</span>,
        value: InjuryCrashTypeFilterEnum.AllInjuries,
      },
      {
        label: <span>Severe Injuries</span>,
        value: InjuryCrashTypeFilterEnum.SevereInjuries,
      },
    ],
  },
  {
    label: <span>Traffic Crashes</span>,
    title: "Traffic Crashes",
    options: [
      {
        label: <span>Vehicle Involved</span>,
        value: InjuryCrashTypeFilterEnum.VehicleInvolvedCrashes,
      },
      {
        label: <span>Bicycle Involved </span>,
        value: InjuryCrashTypeFilterEnum.BicycleInvolvedCrashes,
      },
      {
        label: <span>Pedestrian Involved</span>,
        value: InjuryCrashTypeFilterEnum.PedestrianInvolvedCrashes,
      },
    ],
  },
];
