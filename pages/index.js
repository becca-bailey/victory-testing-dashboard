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

const Section = styled.section`
  margin-top: 4rem;
`;

const Grid = styled.div`
  display: grid;
  grid-gap: 2rem;
  align-items: center;
`;

const LeftSection = styled(Grid)`
  grid-template-columns: auto 15rem;
`;

const RightSection = styled(Grid)`
  grid-template-columns: 15rem auto;
`;

const SplitSection = styled(Grid)`
  grid-template-columns: repeat(2, 1fr);
`;

export default function Home() {
  return (
    <Main>
      <h1>
        What can Google tell us about hobbies during the pandemic and around the
        world?
      </h1>
      <LeftSection>
        <PopularityOverTime data={hobbiesData} />
        <p>
          Hobbies like knitting, sewing, baking, and gardening were popular
          during the pandemic. According to Google search data, some are more
          popular search terms than others, and most fluctuate seasonally.
        </p>
      </LeftSection>
      <RightSection>
        <p>
          If we zoom in on 2020 and stack each hobby, we can see the impact of
          the pandemic on Google searches in March of 2020.
        </p>
        <PopularityOverTimeBar data={craftingData2020} />
      </RightSection>
      <Section>
        <h2>Where in the world are each of these hobbies the most popular?</h2>
        <SplitSection>
          <PopularityByRegion
            data={knittingData.knitting}
            color={getColorAtIndex(0)}
            hobby="knitting"
          />
          <p>
            Knitting is really popular in Iceland and New Zealand. It makes
            sense, as Iceland is known for its elaborate fair isle sweaters and
            New Zealand is known for its wool.
          </p>
        </SplitSection>
        <SplitSection>
          <PopularityByRegion
            data={crochetData.crochet}
            color={getColorAtIndex(1)}
            hobby="crochet"
          />
          <p>
            Crochet is popular in South American countries like Bolivia, Chile,
            Paraguay, and Uruguay.
          </p>
        </SplitSection>
        <SplitSection>
          <PopularityByRegion
            data={sewingData.sewing}
            color={getColorAtIndex(2)}
            hobby="sewing"
          />
          <p>
            Sewing is popular in many countries around the world, including the
            United Kindgom, Nigeria, Ghana, Australia, and New Zealand. It's
            interesting that these countries are all members of the British
            Commonwealth!
          </p>
        </SplitSection>
        <SplitSection>
          <PopularityByRegion
            data={bakingData.baking}
            color={getColorAtIndex(3)}
            hobby="baking"
          />
          <p>
            The top five countries that are searching for baking on Google are
            all islands! Trinidad and Tobago, Singapore, Jamaica, the
            Philipines, and New Zealand all top this list.
          </p>
        </SplitSection>
        <SplitSection>
          <PopularityByRegion
            data={gardeningData.gardening}
            color={getColorAtIndex(4)}
            hobby="gardening"
          />
          <p>
            Many of the countries on the list have good climates for gardening,
            including the United Kingdom, New Zealand, and Ireland.
          </p>
        </SplitSection>
      </Section>
      <Section>
        <h2>Hobbies in the United States</h2>
        <SplitSection>
          <p>
            In the United States, knitting is most popular in the northeast and
            western states, while crochet is most popular in the south.
          </p>
          <PopularityByRegion
            data={knittingByStateData.knitting}
            color={getColorAtIndex(1)}
            hobby="knitting"
            region="state"
          />
        </SplitSection>
        <p>
          This made me wonder—is there any corellation between Google searches
          for these hobbies and median income? In some cases there is! Interest
          in knitting and baking seems to increase with median income in each
          state.
        </p>
        <SplitSection>
          <PopularityVsMedianIncome
            color={getColorAtIndex(0)}
            data={knittingByStateData.knitting}
            hobby="knitting"
          />
          <PopularityVsMedianIncome
            color={getColorAtIndex(4)}
            data={bakingByStateData.baking}
            hobby="baking"
          />
        </SplitSection>
        <SplitSection>
          <PopularityVsMedianIncome
            color={getColorAtIndex(1)}
            data={crochetByStateData.crochet}
            hobby="crochet"
          />
          <p>Interestingly—crochet seems to go in the opposite direction.</p>
        </SplitSection>
        <p>Gardening and sewing didn't show any noticeable trends.</p>
        <SplitSection>
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
        </SplitSection>
      </Section>
      <Section>
        <h2>Other questions</h2>
      </Section>
      <SplitSection>
        <div>
          <PopularityVsSheep />
          <p>Is interest in knitting corellated to the number of sheep?</p>
        </div>
        <div>
          <h3>Interest in baking vs. the Great British Bake Off in the UK</h3>
          <PopularityOverTime data={britishBakingData} />
          <p>
            Did interest in baking in the UK increase with the popularity of the
            Great British Bake Off?
          </p>
        </div>
      </SplitSection>
    </Main>
  );
}
