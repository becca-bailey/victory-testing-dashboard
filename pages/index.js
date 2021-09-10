import React from "react";
import styled from "styled-components";
import PopularityByRegion from "../components/popularity-by-region";
import PopularityOverTime from "../components/popularity-over-time";
import PopularityVsMedianIncome from "../components/popularity-vs-median-income";
import PopularityVsSheep from "../components/popularity-vs-sheep-per-capita";
import hobbiesData from "../public/data/all-hobbies-over-time-us.json";
import bakingData from "../public/data/baking-by-country.json";
import britishBakingData from "../public/data/british-baking.json";
import crochetData from "../public/data/crochet-by-country.json";
import gardeningData from "../public/data/gardening-by-country.json";
import knittingData from "../public/data/knitting-by-country.json";
import knittingByStateData from "../public/data/knitting-by-state.json";
import sewingData from "../public/data/sewing-by-country.json";
import crochetByStateData from "../public/data/crochet-by-state.json";
import {getColorAtIndex} from "../utils/colors";
import gardeningByStateData from "../public/data/gardening-by-state.json";
import sewingByStateData from "../public/data/sewing-by-state.json";
import bakingByStateData from "../public/data/baking-by-state.json";
import PopularityOverTimeBar from "../components/popularity-over-time-bar";
import craftingData2020 from "../public/data/crafting-2020.json";

const Main = styled.main`
  padding: 2rem;
  margin: 0 auto;
  max-width: 1200px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto 15rem;
  align-items: center;
`;

export default function Home() {
  return (
    <Main>
      <h1>
        What can Google tell us about hobbies during the pandemic and around the
        world?
      </h1>
      <Grid>
        <PopularityOverTime data={hobbiesData} />
        <p>
          Hobbies like knitting, sewing, baking, and gardening were popular
          during the pandemic. According to Google search data, some are more
          popular search terms than others, and most fluctuate seasonally.
        </p>
      </Grid>
      <PopularityOverTimeBar data={craftingData2020} />
      <PopularityByRegion
        data={knittingData.knitting}
        color={getColorAtIndex(0)}
        hobby="knitting"
      />
      <PopularityByRegion
        data={crochetData.crochet}
        color={getColorAtIndex(1)}
        hobby="crochet"
      />
      <PopularityByRegion
        data={sewingData.sewing}
        color={getColorAtIndex(2)}
        hobby="sewing"
      />
      <PopularityByRegion
        data={bakingData.baking}
        color={getColorAtIndex(3)}
        hobby="baking"
      />
      <PopularityByRegion
        data={gardeningData.gardening}
        color={getColorAtIndex(4)}
        hobby="gardening"
      />
      <PopularityVsSheep />
      <PopularityOverTime data={britishBakingData} />
      <PopularityByRegion
        data={knittingByStateData.knitting}
        color={getColorAtIndex(1)}
        hobby="knitting"
        region="state"
      />
      <PopularityVsMedianIncome
        color={getColorAtIndex(0)}
        data={knittingByStateData.knitting}
        hobby="knitting"
      />
      <PopularityVsMedianIncome
        color={getColorAtIndex(1)}
        data={crochetByStateData.crochet}
        hobby="crochet"
      />
      <PopularityVsMedianIncome
        color={getColorAtIndex(2)}
        data={gardeningByStateData.gardening}
        hobby="gardening"
      />
      <PopularityVsMedianIncome
        color={getColorAtIndex(3)}
        data={sewingByStateData.sewing}
        hobby="sewing"
      />
      <PopularityVsMedianIncome
        color={getColorAtIndex(4)}
        data={bakingByStateData.baking}
        hobby="baking"
      />
    </Main>
  );
}
