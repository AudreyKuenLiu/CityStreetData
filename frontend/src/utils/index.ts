let colorIndex = 1;
export const getRandomColor = (): string => {
  const hue = colorIndex * 137.508; // use golden angle approximation
  colorIndex++;
  return `hsl(${hue},70%,40%)`;
};
