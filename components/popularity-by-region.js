import React from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

const PopularityByRegion = ({data = [], color, hobby, region = "country"}) => {
  const victoryData = React.useMemo(() => {
    return data.map((d) => {
      return {
        x: d[region],
        y: d.popularity,
      };
    });
  }, [data]);

  return (
    <div>
      <h2>
        Popularity of {hobby} by {region} (9/9/20 - 9/9/21)
      </h2>
      <VictoryChart containerComponent={<VictoryVoronoiContainer />}>
        <VictoryBar
          style={{data: {fill: color}}}
          data={victoryData}
          labels={({datum}) => {
            return `${datum.x}: ${datum.y}`;
          }}
          labelComponent={<VictoryTooltip />}
        />
        <VictoryAxis dependentAxis />
      </VictoryChart>
    </div>
  );
};

export default PopularityByRegion;
