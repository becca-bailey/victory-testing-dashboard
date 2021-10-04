import {parseISO, format} from "date-fns";
import React from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryGroup,
  CanvasContainer,
  CanvasCurve,
} from "victory";
import {getColorAtIndex} from "../../utils/colors";
import {victoryTheme} from "../../utils/theme";

function CustomTooltip({text, datum, ...rest}) {
  const formattedDate = format(datum.x, "MMM d yyyy");
  const modifiedText = [`Week of ${formattedDate}`, ...text];
  return <VictoryTooltip datum={datum} text={modifiedText} {...rest} />;
}

const PopularityOverTime = ({data, animate = false}) => {
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
        color: getColorAtIndex(i),
        coordinates,
        id: `line-${i}`,
      };
    });
  }, [data]);

  return (
    <VictoryChart
      theme={victoryTheme}
      height={600}
      width={900}
      containerComponent={
        <VictoryVoronoiContainer
          voronoiDimension="x"
          labelComponent={<CustomTooltip />}
          labels={({datum}) => [`${datum.hobby}: ${datum.y}`]}
        />
      }
    >
      <VictoryGroup animate={animate}>
        {victoryData.map(({color, coordinates, id}) => {
          return (
            <VictoryLine
              key={id}
              data={coordinates}
              style={{data: {stroke: color, strokeWidth: 4}}}
              groupComponent={<CanvasContainer />}
              dataComponent={<CanvasCurve />}
            />
          );
        })}
      </VictoryGroup>
    </VictoryChart>
  );
};

export default PopularityOverTime;