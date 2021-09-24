import {parseISO, format} from "date-fns";
import React from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryGroup,
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
      containerComponent={
        <VictoryVoronoiContainer
          voronoiDimension="x"
          labels={({datum}) => [`${datum.hobby}: ${datum.y}`]}
          labelComponent={<CustomTooltip />}
        />
      }
    >
      <VictoryGroup animate={animate}>
        {victoryData.map(({color, coordinates, id}) => {
          return (
            <VictoryLine
              key={id}
              data={coordinates}
              style={{data: {stroke: color}}}
            />
          );
        })}
      </VictoryGroup>
    </VictoryChart>
  );
};

export default PopularityOverTime;
