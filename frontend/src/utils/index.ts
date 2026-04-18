import { format } from "date-fns-tz";

export const getColorGradient = (p: number): string => {
  const red = p > 30 ? 240 : Math.round(p * 8);
  const green = p < 30 ? 240 : Math.round(210 - (p - 30) * 8);
  return "rgb(" + red + "," + green + ",80)";
};

let colorIndex = 1;
export const getRandomColor = (initialColorIndex?: number): string => {
  const hue = (initialColorIndex ?? colorIndex) * 137.508; // use golden angle approximation
  if (initialColorIndex == null) {
    colorIndex++;
  }
  return `hsl(${hue},70%,40%)`;
};

export const dateToPacificRFC3339Time = (date: Date | null): string => {
  return format(date ?? new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", {
    timeZone: "America/Los_Angeles",
  });
};

export const dateToPacificTimeMonth = (date: Date): string => {
  return format(date ?? new Date(), "yyyy-MM-dd", {
    timeZone: "America/Los_Angeles",
  });
};
