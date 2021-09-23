import * as d3 from "d3";
import React from "react";
import styled from "styled-components";

const Main = styled.main``;

const Intro = styled.section`
  padding: 3rem;
  margin: 0 2rem;
`;

const Title = styled.h1``;

const Text = styled.text`
  font-family: Urbanist, sans-serif;
`;

const defaultWidth = 800;
const defaultHeight = 600;
const defaultMargin = {
  left: 70,
  right: 20,
  top: 20,
  bottom: 70,
};

const usePreviousData = (data, defaultValue = {}) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = data;
  });
  return ref.current || defaultValue;
};

const Lines = ({width, height, margin}) => {
  const canvasRef = React.useRef();
  const workerRef = React.useRef();

  function handleMessage(event) {
    console.log("from worker", event.data);
  }

  React.useEffect(() => {
    workerRef.current = new Worker(new URL("../../worker.js", import.meta.url));
    workerRef.current.onmessage = (evt) => handleMessage(evt);

    const offscreen = canvasRef.current.transferControlToOffscreen();
    workerRef.current.postMessage({linesCanvas: offscreen}, [offscreen]);

    return () => workerRef.current.terminate();
  }, []);

  return (
    <canvas
      className="chart"
      height={height}
      width={width}
      style={{
        marginLeft: margin.left,
        marginRight: margin.right,
        marginTop: margin.top,
        marginBottom: margin.bottom,
      }}
      ref={canvasRef}
    />
  );
};

const Points = ({width, height, margin}) => {
  const workerRef = React.useRef();
  const canvasRef = React.useRef();

  function handleMouseMove(event) {
    const [x, y] = d3.pointer(event);
    workerRef.current.postMessage({mousePosition: {x, y}});
  }

  React.useEffect(() => {
    workerRef.current = new Worker(new URL("../../worker.js", import.meta.url));
    workerRef.current.onmessage = (evt) => handleMessage(evt);
    const offscreen = canvasRef.current.transferControlToOffscreen();
    workerRef.current.postMessage({pointsCanvas: offscreen}, [offscreen]);

    return () => workerRef.current.terminate();
  }, []);

  return (
    <canvas
      className="chart"
      height={height}
      width={width}
      style={{
        marginLeft: margin.left,
        marginRight: margin.right,
        marginTop: margin.top,
        marginBottom: margin.bottom,
      }}
      ref={canvasRef}
      onMouseMove={handleMouseMove}
    />
  );
};

const PopulationOffscreenCanvas = ({
  width = defaultWidth,
  height = defaultHeight,
  margin = defaultMargin,
}) => {
  const workerRef = React.useRef();

  function handleMessage(event) {
    console.log("from worker", event.data);
  }

  React.useEffect(() => {
    workerRef.current = new Worker(new URL("../../worker.js", import.meta.url));
    workerRef.current.onmessage = (evt) => handleMessage(evt);

    return () => workerRef.current.terminate();
  }, []);

  return (
    <Main>
      <Intro>
        <Title>World Population 1960-2019</Title>
        <p>
          This example uses canvas, d3, and SVG to render a chart of world
          population by country over the past 60 years. The axis and labels are
          SVG while data is painted with overlapping canvas containers. The
          lines and points are animated with d3.timer() and d3.interpolate().
        </p>
        <p>
          Hover over each line to see the population for each year, and click to
          isolate data for a single country.
        </p>
      </Intro>

      <svg
        className="chart"
        height={height}
        width={width}
        transform={`translate(${margin.left}, ${margin.top})`}
      >
        <Text
          x={(height / 2 - margin.top / 2) * -1}
          dy={15}
          transform="rotate(-90)"
          textAnchor="middle"
        >
          Population
        </Text>
        <Text
          x={width / 2 + margin.left / 2}
          y={height - 10}
          textAnchor="middle"
        >
          Year
        </Text>
        {/* <XAxis scale={scaleX} margin={margin} height={height} />
        <YAxis scale={scaleY} margin={margin} /> */}
      </svg>
      <Lines width={width} height={height} margin={margin} />
      <Points width={width} height={height} margin={margin} />
    </Main>
  );
};

export default PopulationOffscreenCanvas;
