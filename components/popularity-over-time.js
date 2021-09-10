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

const PopularityOverTime = ({data}) => {
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
      // theme={{
      //   axis: {
      //     style: {
      //       axisLabel: {
      //         font: "Urbanist, sans-serif",
      //       },
      //     },
      //   },
      // }}
      containerComponent={
        <VictoryVoronoiContainer
          voronoiDimension="x"
          labels={({datum}) => `${datum.hobby}: ${datum.y}`}
          labelComponent={<CustomTooltip />}
        />
      }
    >
      {victoryData.map(({color, coordinates, id}) => {
        return (
          <VictoryLine
            key={id}
            data={coordinates}
            style={{data: {stroke: color}}}
          />
        );
      })}
    </VictoryChart>
  );
};

export default PopularityOverTime;
