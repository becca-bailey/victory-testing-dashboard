import {parseISO, format} from "date-fns";
import React from "react";
import {
  VictoryChart,
  VictoryStack,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryBar,
  CanvasGroup,
  CanvasBar,
} from "victory";
import {colorPalette} from "../../utils/colors";
import {victoryTheme} from "../../utils/theme";

function CustomTooltip({text, datum, ...rest}) {
  const formattedDate = format(datum.x, "MMM d yyyy");
  const modifiedText = [`Week of ${formattedDate}`, ...text];
  return <VictoryTooltip datum={datum} text={modifiedText} {...rest} />;
}

const PopularityOverTimeBar = ({data, animate = false, canvas = false}) => {
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
        animate={animate}
        theme={victoryTheme}
        height={600}
        width={900}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({datum}) => `${datum.hobby}: ${datum.y}`}
            labelComponent={<CustomTooltip />}
          />
        }
      >
        <VictoryStack colorScale={colorPalette}>
          {victoryData.map(({coordinates}, i) => {
            return (
              <VictoryBar
                key={i}
                data={coordinates}
                groupComponent={canvas ? <CanvasGroup /> : undefined}
                dataComponent={canvas ? <CanvasBar /> : undefined}
              />
            );
          })}
        </VictoryStack>
      </VictoryChart>
    </div>
  );
};

export default PopularityOverTimeBar;
