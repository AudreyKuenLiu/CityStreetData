import { format } from "date-fns-tz";

let colorIndex = 1;
export const getRandomColor = (): string => {
  const hue = colorIndex * 137.508; // use golden angle approximation
  colorIndex++;
  return `hsl(${hue},70%,40%)`;
};

export const dateToPacificRFC3339Time = (date: Date | null): string => {
  return format(date ?? new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", {
    timeZone: "America/Los_Angeles",
  });
};
