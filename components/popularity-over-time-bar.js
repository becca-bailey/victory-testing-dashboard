import {parseISO, format} from "date-fns";
import React from "react";
import {
  VictoryChart,
  VictoryStack,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryBar,
} from "victory";
import {colorPalette} from "../utils/colors";
import {victoryTheme} from "../utils/theme";

function CustomTooltip({text, datum, ...rest}) {
  const formattedDate = format(datum.x, "MMM d yyyy");
  const modifiedText = [`Week of ${formattedDate}`, ...text];
  return <VictoryTooltip datum={datum} text={modifiedText} {...rest} />;
}

const PopularityOverTimeBar = ({data}) => {
  const victoryData = React.useMemo(() => {
    return Object.entries(data).map(([hobby, values], i) => {
      const coordinates = values.map(({week, popularity}) => {
        return {
          x: parseISO(week),
          y: popularity,
          hobby,
        };
      });
      return {
        coordinates,
      };
    });
  }, [data]);

  return (
    <div>
      <VictoryChart
        animate
        theme={victoryTheme}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({datum}) => `${datum.hobby}: ${datum.y}`}
            labelComponent={<CustomTooltip />}
          />
        }
      >
        <VictoryStack colorScale={colorPalette}>
          {victoryData.map(({coordinates}, i) => {
            return <VictoryBar key={i} data={coordinates} />;
          })}
        </VictoryStack>
      </VictoryChart>
    </div>
  );
};

export default PopularityOverTimeBar;
