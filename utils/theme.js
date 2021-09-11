import {VictoryTheme} from "victory";

export const victoryTheme = {
  ...VictoryTheme.grayscale,
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
