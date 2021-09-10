export const colorPalette = [
  "#F8B195",
  "#F67280",
  "#C06C84",
  "#6C5B7B",
  "#355C7D",
];

export function getColorAtIndex(i) {
  return colorPalette[i % colorPalette.length];
}
