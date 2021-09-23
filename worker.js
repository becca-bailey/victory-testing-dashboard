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

const flattenedData = populationData.reduce((flattened, {country, values}) => {
  return [...flattened, ...values.map((v) => ({...v, country}))];
}, []);

const scaleX = d3
  .scaleLinear()
  .domain([1960, 2019])
  .range([margin.left, width - margin.right])
  .nice();

const scaleY = d3
  .scaleLinear()
  .domain(d3.extent(flattenedData, (d) => d.value))
  .range([height - margin.bottom, margin.top])
  .nice();

const scaledData = flattenedData.map(({year, value, ...rest}) => {
  return {
    x: scaleX(year),
    y: scaleY(value),
    year,
    value,
    ...rest,
  };
});

const delaunay = d3.Delaunay.from(
  scaledData,
  (d) => d.x,
  (d) => d.y
);

function getColor(values) {
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(flattenedData, (d) => d.value)])
    .interpolator(d3.interpolateRainbow);

  const mean = d3.mean(values.map(({value}) => value));
  return colorScale(mean);
}

function scale(data, additionalValues) {
  return data.map(({year, value}) => ({
    x: scaleX(year),
    y: scaleY(value),
    year,
    value,
    ...additionalValues,
  }));
}

const lineData = populationData.reduce((d, {country, values}) => {
  return {
    ...d,
    [country]: scale(values, {color: getColor(values)}),
  };
}, {});

const getPointData = (year) => {
  return populationData.reduce((d, {country, values}) => {
    const activeValues = values.filter((d) => d.year === year);
    return {
      ...d,
      [country]: scale(activeValues, {color: getColor(values)}),
    };
  }, {});
};

function drawLine(ctx, data) {
  const [first, ...rest] = data;
  ctx.strokeStyle = first.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  if (rest.length) {
    rest.forEach(({x, y}) => {
      ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

function drawPoint(ctx, {x, y, color}) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
}

let linesCtx;
let pointsCtx;

addEventListener("message", (event) => {
  const {linesCanvas, pointsCanvas, mousePosition} = event.data;
  if (!!linesCanvas) {
    linesCtx = linesCanvas.getContext("2d");

    linesCtx.clearRect(0, 0, width, height);
    Object.values(lineData).forEach((values) => {
      drawLine(linesCtx, values);
    });
  }

  if (!!pointsCanvas) {
    pointsCtx = pointsCanvas.getContext("2d");
  }

  if (!!mousePosition && pointsCtx) {
    const {x, y} = mousePosition;
    const index = delaunay.find(x, y);
    const activePoint = scaledData[index];

    const pointData = getPointData(activePoint.year);

    pointsCtx.clearRect(0, 0, width, height);
    Object.values(pointData).forEach((values) => {
      values.forEach((v) => {
        drawPoint(pointsCtx, v);
      });
    });
  }
});
