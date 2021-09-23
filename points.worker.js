import {get} from "lodash";
import * as d3 from "d3";

const defaultWidth = 800;
const defaultHeight = 600;
const defaultMargin = {
  left: 70,
  right: 20,
  top: 20,
  bottom: 70,
};
const pointSize = 3;
const duration = 100;
const lineColor = "#D1DCE5";

let ctx;

function drawPoint(ctx, {x, y, color}) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
  ctx.fill();
}

const drawBrushLine = (ctx, {x, y1, y2}) => {
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.closePath();
  ctx.stroke();
};

function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

function drawPoints(ctx, data) {
  Object.values(data).forEach((values) => {
    values.forEach((v) => {
      drawPoint(ctx, v);
    });
  });
}

addEventListener("message", (event) => {
  const {
    canvas,
    nextData,
    previousData,
    height = defaultHeight,
    width = defaultWidth,
    margin = defaultMargin,
  } = event.data;
  if (!!canvas) {
    ctx = canvas.getContext("2d");
  }

  if (!!nextData && !!ctx) {
    const interpolator = d3.interpolate(previousData, nextData);
    const timer = d3.timer((elapsed) => {
      const step = duration ? elapsed / duration : 1;
      if (elapsed > duration) {
        timer.stop();
      }
      const data = interpolator(step);
      clear(ctx, width, height);
      const x = get(Object.values(data), "[0][0].x");
      if (x) {
        drawBrushLine(ctx, {x, y1: margin.top, y2: height - margin.bottom});
      }
      drawPoints(ctx, data);
    });
  }
});
