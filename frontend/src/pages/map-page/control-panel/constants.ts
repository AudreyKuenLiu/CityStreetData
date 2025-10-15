import { StreetEvent } from "../store/street-map-data-form";

export const StreetEventLabels = {
  [StreetEvent.TrafficCrashes]: "Traffic Crashes",
};

export const StreetEventOptions = [
  {
    value: StreetEvent.TrafficCrashes,
    label: "Traffic Crashes",
  },
] satisfies { value: StreetEvent; label: string }[];
