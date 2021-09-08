import {parseISO} from "date-fns";
import React from "react";
import {useQuery} from "urql";
import {
  Point,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import {getColorAtIndex} from "../utils/colors";

const query = `
  query {
    hobbyGooglePopularity {
      hobby 
      values {
        week 
        popularity  
      }
    }
  }
`;

function ConditionalPoint({active, ...rest}) {
  if (!active) {
    return null;
  }
  return <Point {...rest} />;
}

function CustomTooltip(props) {
  return <VictoryTooltip {...props} />;
}

function HobbyGooglePopularity() {
  const [{data, fetching, error}] = useQuery({query});

  const victoryData = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data.hobbyGooglePopularity.map(({hobby, values}, i) => {
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

  if (fetching) {
    return "Loading...";
  }

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
}

export default HobbyGooglePopularity;
