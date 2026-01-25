import { z } from "zod";

const DataViewSchema = z.object({
  NoView: "NoView",
  GraphView: "GraphView",
  HeatmapView: "HeatmapView",
} as const);
export const DataViewKeys = DataViewSchema.keyof();
export const DataViewEnum = DataViewSchema.shape;
export type DataView = (typeof DataViewEnum)[keyof typeof DataViewEnum];
