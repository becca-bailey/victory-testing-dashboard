import * as d3 from "d3";
import React from "react";
import styled from "styled-components";
import {Tooltip} from "../../components/svg/Tooltip";
import {XAxis} from "../../components/svg/XAxis";
import {YAxis} from "../../components/svg/YAxis";
import jsonData from "../../public/data/population.json";

const populationData = jsonData.populationData;

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

const Lines = ({nextData, previousData, width, height, margin}) => {
  const canvasRef = React.useRef();
  const workerRef = React.useRef();

  React.useEffect(() => {
    workerRef.current = new Worker(new URL("../../worker.js", import.meta.url));
    workerRef.current.onmessage = (evt) => console.log(evt.data);

    const offscreen = canvasRef.current.transferControlToOffscreen();
    workerRef.current.postMessage(
      {linesCanvas: offscreen, nextLinesData: nextData},
      [offscreen]
    );

    return () => workerRef.current.terminate();
  }, []);

  React.useEffect(() => {
    workerRef.current.postMessage({
      nextLinesData: nextData,
      previousLinesData: previousData,
    });
  }, [nextData, previousData]);

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

const Points = ({nextData, previousData, width, height, margin}) => {
  const canvasRef = React.useRef();
  const workerRef = React.useRef();

  React.useEffect(() => {
    workerRef.current = new Worker(new URL("../../worker.js", import.meta.url));
    workerRef.current.onmessage = (evt) => console.log(evt.data);

    const offscreen = canvasRef.current.transferControlToOffscreen();
    workerRef.current.postMessage(
      {pointsCanvas: offscreen, nextPointsData: nextData},
      [offscreen]
    );

    return () => workerRef.current.terminate();
  }, []);

  React.useEffect(() => {
    workerRef.current.postMessage({
      nextPointsData: nextData,
      previousPointsData: previousData,
    });
  }, [nextData, previousData]);

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

const PopulationCanvas = ({
  width = defaultWidth,
  height = defaultHeight,
  data = populationData,
  margin = defaultMargin,
}) => {
  const [activePoint, setActivePoint] = React.useState();
  const [isolatedCountry, setIsolatedCountry] = React.useState();

  const filteredData = React.useMemo(() => {
    return isolatedCountry
      ? data.filter(({country}) => country === isolatedCountry)
      : data;
  }, [data, isolatedCountry]);

  const allValues = React.useMemo(() => {
    const getAllValues = (data) => {
      return data.reduce((all, {values}) => {
        return [...all, ...values.map(({value}) => value)];
      }, []);
    };
    return getAllValues(filteredData);
  }, [filteredData]);

  const getColor = React.useCallback(
    (values) => {
      const colorScale = d3
        .scaleSequential()
        .domain([0, d3.max(allValues)])
        .interpolator(d3.interpolateRainbow);

      const mean = d3.mean(values.map(({value}) => value));
      return colorScale(mean);
    },
    [allValues]
  );

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

  const scale = React.useCallback(
    (data, additionalData = {}) => {
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

      return data.map(({year, value}) => ({
        x: scaleX(year),
        y: scaleY(value),
        year,
        value,
        ...additionalData,
      }));
    },
    [allValues, width, height, margin]
  );

  const flattenedData = React.useMemo(() => {
    return filteredData.reduce((flattened, {country, values}) => {
      return [...flattened, ...scale(values, {country})];
    }, []);
  }, [filteredData, scale]);

  const delaunay = React.useMemo(() => {
    return d3.Delaunay.from(
      flattenedData,
      (d) => d.x,
      (d) => d.y
    );
  }, [flattenedData]);

  const onMouseMove = React.useCallback(
    (event) => {
      const [xPosition, yPosition] = d3.pointer(event);

      const index = delaunay.find(xPosition, yPosition);
      setActivePoint(flattenedData[index]);
    },
    [setActivePoint, flattenedData, delaunay]
  );

  const onMouseLeave = React.useCallback(() => {
    setActivePoint(undefined);
  }, [setActivePoint]);

  const handleClick = React.useCallback(() => {
    if (isolatedCountry) {
      setIsolatedCountry(undefined);
    } else {
      const {country} = activePoint;
      setIsolatedCountry(country);
    }
  }, [activePoint, setIsolatedCountry, isolatedCountry]);

  const nextLineData = React.useMemo(() => {
    const scale = (data, additionalData = {}) => {
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

      return data.map(({year, value}) => ({
        x: scaleX(year),
        y: scaleY(value),
        year,
        value,
        ...additionalData,
      }));
    };

    return filteredData.reduce((d, {country, values}) => {
      return {
        ...d,
        [country]: scale(values, {color: getColor(values)}),
      };
    }, {});
  }, [filteredData, height, width, margin, allValues, getColor]);

  const nextPointsData = React.useMemo(() => {
    if (!activePoint) {
      return {};
    }

    const scale = (data, additionalData = {}) => {
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

      return data.map(({year, value}) => ({
        x: scaleX(year),
        y: scaleY(value),
        year,
        value,
        ...additionalData,
      }));
    };

    return filteredData.reduce((d, {country, values}) => {
      const activeValues = values.filter(({year}) => year === activePoint.year);
      return {
        ...d,
        [country]: scale(activeValues, {color: getColor(values)}),
      };
    }, {});
  }, [filteredData, height, width, margin, activePoint, allValues, getColor]);

  const previousLineData = usePreviousData(nextLineData);
  const previousPointsData = usePreviousData(nextPointsData);

  return (
    <Main>
      <Intro>
        <Title>World Population 1960-2019</Title>
        <p>
          This example uses the experimental OffscreenCanvas API in order to
          render and animate the chart in a web worker. The state is still
          managed in the React compoenent, but the data is being passed to the
          web worker, which is using requestAnimationFrame to render the data in
          canvas containers.
        </p>
        <p>
          Hover over each line to see the population for each year, and click to
          isolate data for a single country.
        </p>
      </Intro>

      <Lines
        nextData={nextLineData}
        previousData={previousLineData}
        width={width}
        height={height}
        margin={margin}
      />
      <Points
        nextData={nextPointsData}
        previousData={previousPointsData}
        width={width}
        height={height}
        margin={margin}
      />
      <svg
        className="chart"
        height={height}
        width={width}
        transform={`translate(${margin.left}, ${margin.top})`}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
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
        <XAxis scale={scaleX} margin={margin} height={height} />
        <YAxis scale={scaleY} margin={margin} />
        {activePoint && (
          <Tooltip
            x={activePoint.x}
            y={activePoint.y}
            width={250}
            height={200}
            canvasWidth={width}
            margin={margin}
          >
            <p className="bold">{activePoint.country}</p>
            <p>
              {activePoint.year} - {activePoint.value}
            </p>
          </Tooltip>
        )}
      </svg>
    </Main>
  );
};

export default PopulationCanvas;
