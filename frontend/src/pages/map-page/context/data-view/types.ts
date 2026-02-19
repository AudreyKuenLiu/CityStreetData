import { z } from "zod";

const DataViewSchema = z.object({
  NoView: "NoView",
  AreaChartView: "AreaChartView",
  HeatmapView: "HeatmapView",
  TrendView: "TrendView",
} as const);
export const DataViewKeys = DataViewSchema.keyof();
export const DataViewEnum = DataViewSchema.shape;
export type DataView = (typeof DataViewEnum)[keyof typeof DataViewEnum];
