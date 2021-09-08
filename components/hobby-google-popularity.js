import {parseISO} from "date-fns";
import React from "react";
import {
  Point,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import {getColorAtIndex} from "../utils/colors";
import hobbiesData from "../public/hobbies-json.json";

function CustomTooltip(props) {
  return <VictoryTooltip {...props} />;
}

const HobbyGooglePopularity = ({data = hobbiesData}) => {
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
      <h2>Interest over time (via Google)</h2>
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
