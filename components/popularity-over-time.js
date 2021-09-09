import {parseISO} from "date-fns";
import React from "react";
import {
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import {getColorAtIndex} from "../utils/colors";

function CustomTooltip(props) {
  return <VictoryTooltip {...props} />;
}

const HobbyGooglePopularity = ({data}) => {
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
      };
    });
  }, [data]);

  return (
    <div>
      <h2>Popularity over time</h2>
      <VictoryChart
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({datum}) => `${datum.hobby}: ${datum.y}`}
            labelComponent={<CustomTooltip />}
          />
        }
      >
        {victoryData.map(({color, coordinates}) => {
          return (
            <VictoryLine data={coordinates} style={{data: {stroke: color}}} />
          );
        })}
      </VictoryChart>
    </div>
  );
};

export default HobbyGooglePopularity;
