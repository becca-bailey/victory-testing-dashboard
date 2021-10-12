import {VictoryTheme} from "victory";

export const victoryTheme = {
  ...VictoryTheme.grayscale,
  tooltip: {
    style: {
      ...VictoryTheme.grayscale.tooltip.style,
      fontFamily: "Castledown, sans-serif",
      padding: 10,
    },
  },
  axis: {
    style: {
      ...VictoryTheme.grayscale.axis.style,
      tickLabels: {
        padding: 8,
        font: "Castledown, sans-serif",
        fontWeight: 100,
      },
    },
  },
};
