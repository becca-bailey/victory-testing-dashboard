import React from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryVoronoiContainer,
  CanvasContainer,
  CanvasBar,
} from "victory";
import {victoryTheme} from "../../utils/theme";

const PopularityByRegion = ({
  data = [],
  color,
  hobby,
  region = "country",
  animate = false,
}) => {
  const victoryData = React.useMemo(() => {
    return data.map((d) => {
      return {
        x: d[region],
        y: d.popularity,
      };
    });
  }, [data, region]);

  return (
    <div>
      <h3>{hobby}</h3>
      <VictoryChart
        theme={victoryTheme}
        animate={animate}
        containerComponent={<VictoryVoronoiContainer />}
        height={450}
        width={675}
      >
        <VictoryBar
          style={{data: {fill: color}}}
          data={victoryData}
          labels={({datum}) => {
            return `${datum.x}: ${datum.y}`;
          }}
          labelComponent={<VictoryTooltip />}
          groupComponent={<CanvasContainer />}
          dataComponent={<CanvasBar />}
        />
        <VictoryAxis dependentAxis />
      </VictoryChart>
    </div>
  );
};

export default PopularityByRegion;
