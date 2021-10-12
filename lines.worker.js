import * as d3Timer from "d3-timer";
import * as d3Interpolate from "d3-interpolate";

const defaultWidth = 1000;
const defaultHeight = 600;
const lineWidth = 2;
const duration = 250;

let ctx;

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

function clear(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
}

function drawLines(ctx, data) {
  Object.values(data).forEach((d) => {
    drawLine(ctx, d);
  });
}

addEventListener("message", (event) => {
  const {
    canvas,
    nextData,
    previousData,
    width = defaultWidth,
    height = defaultHeight,
  } = event.data;
  if (!!canvas) {
    ctx = canvas.getContext("2d");
  }

  if (!!nextData && !!ctx) {
    const interpolator = d3Interpolate.interpolate(previousData, nextData);
    const timer = d3Timer.timer((elapsed) => {
      if (elapsed > duration) {
        timer.stop();
      }
      const step = elapsed / duration;

      clear(ctx, width, height);
      drawLines(ctx, interpolator(step));
    });
  }
});
