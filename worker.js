import {filter} from "lodash";
import * as d3 from "d3";
import jsonData from "./public/data/population.json";

const populationData = jsonData.populationData;

const width = 800;
const height = 600;
const margin = {
  left: 70,
  right: 20,
  top: 20,
  bottom: 70,
};

function getFilteredData(params) {
  if (typeof params === "object") {
    return filter(populationData, params);
  }
  return populationData;
}

const allValues = populationData.reduce((all, {values}) => {
  return [...all, ...values.map(({value}) => value)];
}, []);

const scaleX = d3
  .scaleLinear()
  .domain([1960, 2019])
  .range([margin.left, width - margin.right])
  .nice();

const scaleY = d3
  .scaleLinear()
  .domain(d3.extent(allValues))
  .range([height - margin.bottom, margin.top])
  .nice();

function getColor(values) {
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(allValues)])
    .interpolator(d3.interpolateRainbow);

  const mean = d3.mean(values.map(({value}) => value));
  return colorScale(mean);
}

function scale(data) {
  return data.map(({year, value}) => ({
    x: scaleX(year),
    y: scaleY(value),
    year,
    value,
    color: getColor(data),
  }));
}

addEventListener("message", (event) => {
  switch (event.data.type) {
    case "getNextLineData": {
      const filterParams = event.data.isolatedCountry
        ? {country: event.data.isolatedCountry}
        : undefined;
      const filteredData = getFilteredData(filterParams);
      const nextData = filteredData.reduce((d, {country, values}) => {
        return {
          ...d,
          [country]: scale(values),
        };
      }, {});
      postMessage(nextData);
    }
  }
});
