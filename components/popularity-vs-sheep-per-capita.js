import React from "react";
import {
  VictoryChart,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import knittingData from "../public/data/knitting-by-country.json";
import populationData from "../public/data/2019-population-json.json";
import {getColorAtIndex} from "../utils/colors";
import {victoryTheme} from "../utils/theme";

const chartData = knittingData.knitting;

const KnittingPopularityVsSheepPerCapita = ({data = chartData}) => {
  const victoryData = React.useMemo(() => {
    return data
      .map(({country, popularity, sheepPopulation}) => {
        const population = populationData[country];
        if (sheepPopulation && population) {
          return {
            x: popularity,
            y: sheepPopulation / population,
            country,
          };
        }
      })
      .filter(Boolean);
  }, [data]);

  return (
    <div>
      <h3>Interest in knitting vs. sheep per capita in 2019</h3>
      <VictoryChart
        theme={victoryTheme}
        animate
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryScatter
          style={{data: {fill: getColorAtIndex(1)}}}
          data={victoryData}
          labels={({datum}) => {
            return datum.country;
          }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </div>
  );
};

export default KnittingPopularityVsSheepPerCapita;
