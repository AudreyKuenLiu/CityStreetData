import { StreetEvent } from "../store/constants";

export const StreetEventLabels = {
  [StreetEvent.TrafficCrashes]: "Traffic Crashes",
};

export const StreetEventOptions = [
  {
    value: StreetEvent.TrafficCrashes,
    label: "Traffic Crashes",
  },
] satisfies { value: StreetEvent; label: string }[];
