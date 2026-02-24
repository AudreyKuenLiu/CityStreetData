import type { GroupId } from "../store/street-map-data-form";

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
