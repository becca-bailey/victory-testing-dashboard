import {VictoryTheme} from "victory";

export const victoryTheme = {
  ...VictoryTheme.grayscale,
  tooltip: {
    style: {
      ...VictoryTheme.grayscale.tooltip.style,
      fontFamily: "Urbanist, sans-serif",
      padding: 10,
    },
  },
  axis: {
    style: {
      ...VictoryTheme.grayscale.axis.style,
      tickLabels: {
        padding: 8,
        font: "Urbanist, sans-serif",
        fontWeight: 100,
      },
    },
  },
};
