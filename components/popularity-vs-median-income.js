import React from "react";
import {
  VictoryChart,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import householdIncomeData from "../public/data/household-income-by-state.json";
import {victoryTheme} from "../utils/theme";

const PopularityVsMedianIncome = ({
  data = [],
  color,
  hobby,
  animate = false,
}) => {
  const victoryData = React.useMemo(() => {
    return data
      .map(({state, popularity}) => {
        const income = householdIncomeData[state];
        if (popularity && income) {
          return {
            x: popularity,
            y: income,
            state,
          };
        }
      })
      .filter(Boolean);
  }, [data]);

  return (
    <div>
      <h3>Interest in {hobby} by state vs. median household income</h3>
      <VictoryChart
        theme={victoryTheme}
        animate={animate}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryScatter
          style={{data: {fill: color}}}
          data={victoryData}
          labels={({datum}) => {
            return datum.state;
          }}
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </div>
  );
};

export default PopularityVsMedianIncome;
