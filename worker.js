import {get} from "lodash";
import * as d3 from "d3";

const width = 800;
const height = 600;
const margin = {
  left: 70,
  right: 20,
  top: 20,
  bottom: 70,
};
const lineWidth = 2;
const pointSize = 3;
const duration = 100;
const lineColor = "#D1DCE5";

function drawLine(ctx, data) {
  const [first, ...rest] = data;
  ctx.strokeStyle = first.color;
  ctx.lineWidth = lineWidth;
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
  ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
  ctx.fill();
}

const drawBrushLine = (ctx, x) => {
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, margin.top);
  ctx.lineTo(x, height - margin.bottom);
  ctx.closePath();
  ctx.stroke();
};

function drawLines(ctx, data) {
  ctx.clearRect(0, 0, width, height);
  Object.values(data).forEach((d) => {
    drawLine(ctx, d);
  });
}

function drawPoints(ctx, data) {
  ctx.clearRect(0, 0, width, height);
  const x = get(Object.values(data), "[0][0].x");
  if (x) {
    drawBrushLine(ctx, x);
  }
  Object.values(data).forEach((values) => {
    values.forEach((v) => {
      drawPoint(ctx, v);
    });
  });
}

let linesCtx;
let pointsCtx;

addEventListener("message", (event) => {
  const {
    linesCanvas,
    pointsCanvas,
    nextLinesData,
    nextPointsData,
    previousLinesData,
    previousPointsData,
  } = event.data;
  if (!!linesCanvas) {
    linesCtx = linesCanvas.getContext("2d");
  }

  if (!!pointsCanvas) {
    pointsCtx = pointsCanvas.getContext("2d");
  }

  if (!!nextLinesData && !!linesCtx) {
    const interpolator = d3.interpolate(previousLinesData, nextLinesData);
    const timer = d3.timer((elapsed) => {
      const step = duration ? elapsed / duration : 1;
      if (elapsed > duration) {
        timer.stop();
      }
      drawLines(linesCtx, interpolator(step));
    });
  }

  if (!!nextPointsData && !!pointsCtx) {
    const interpolator = d3.interpolate(previousPointsData, nextPointsData);
    const timer = d3.timer((elapsed) => {
      const step = duration ? elapsed / duration : 1;
      if (elapsed > duration) {
        timer.stop();
      }
      drawPoints(pointsCtx, interpolator(step));
    });
  }
});
