import * as d3 from "d3";
import React from "react";
import styled, {css} from "styled-components";
import {Tooltip} from "../../components/svg/Tooltip";
import {XAxis} from "../../components/svg/XAxis";
import {YAxis} from "../../components/svg/YAxis";
import jsonData from "../../public/data/population.json";

const populationData = jsonData.populationData;

const defaultWidth = 1000;
const defaultHeight = 600;
const defaultMargin = {
  left: 70,
  right: 70,
  top: 20,
  bottom: 70,
};

const Main = styled.main``;

const Intro = styled.section`
  padding: 3rem;
  margin: 0 2rem;
`;

const Title = styled.h1``;

const Text = styled.text`
  font-family: Castledown, sans-serif;
`;

const Container = styled.div`
  max-width: ${css`
    ${defaultWidth + defaultMargin.left + defaultMargin.right}px
  `};
  height: ${css`
    ${defaultHeight + defaultMargin.top + defaultMargin.bottom}px
  `};
  margin: 0 auto;
  position: relative;
`;

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
    workerRef.current = new Worker(
      new URL("../../lines.worker.js", import.meta.url)
    );
    workerRef.current.onmessage = (evt) => console.log(evt.data);

    const offscreen = canvasRef.current.transferControlToOffscreen();
    workerRef.current.postMessage({canvas: offscreen, nextData}, [offscreen]);

    return () => workerRef.current.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    workerRef.current.postMessage({
      nextData,
      previousData,
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
    workerRef.current = new Worker(
      new URL("../../points.worker.js", import.meta.url)
    );
    workerRef.current.onmessage = (evt) => console.log(evt.data);

    const offscreen = canvasRef.current.transferControlToOffscreen();
    workerRef.current.postMessage({canvas: offscreen, nextData}, [offscreen]);

    return () => workerRef.current.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    workerRef.current.postMessage({
      nextData,
      previousData,
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

  const flattenedData = React.useMemo(() => {
    return filteredData.reduce((all, {country, values}) => {
      return [...all, ...values.map((v) => ({...v, country}))];
    }, []);
  }, [filteredData]);

  const colorScale = React.useMemo(
    () =>
      d3
        .scaleSequential()
        .domain(d3.extent(flattenedData, (d) => d.value))
        .interpolator(d3.interpolateRainbow),
    [flattenedData]
  );

  const getColor = React.useCallback(
    (values) => {
      const mean = d3.mean(values.map(({value}) => value));
      return colorScale(mean);
    },
    [colorScale]
  );

  const scaleX = React.useMemo(
    () =>
      d3
        .scaleLinear()
        .domain(d3.extent(flattenedData, (d) => d.year))
        .range([margin.left, width - margin.right])
        .nice(),
    [flattenedData, margin, width]
  );

  const scaleY = React.useMemo(
    () =>
      d3
        .scaleLinear()
        .domain(d3.extent(flattenedData, (d) => d.value))
        .range([height - margin.bottom, margin.top])
        .nice(),
    [flattenedData, height, margin]
  );

  const scale = React.useCallback(
    (data, additionalData = {}) => {
      return data.map(({year, value}) => ({
        x: scaleX(year),
        y: scaleY(value),
        year,
        value,
        ...additionalData,
      }));
    },
    [scaleX, scaleY]
  );

  const delaunay = React.useMemo(() => {
    return d3.Delaunay.from(
      flattenedData,
      (d) => scaleX(d.year),
      (d) => scaleY(d.value)
    );
  }, [scaleX, scaleY, flattenedData]);

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
    return filteredData.reduce((d, {country, values}) => {
      d[country] = scale(values, {color: getColor(values)});
      return d;
    }, {});
  }, [filteredData, getColor, scale]);

  const nextPointsData = React.useMemo(() => {
    if (!activePoint) {
      return {};
    }

    return filteredData.reduce((d, {country, values}) => {
      const activeValues = values.filter(({year}) => year === activePoint.year);
      d[country] = scale(activeValues, {color: getColor(values)});
      return d;
    }, {});
  }, [filteredData, activePoint, getColor, scale]);

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
      <Container>
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
              x={scaleX(activePoint.year)}
              y={scaleY(activePoint.value)}
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
      </Container>
    </Main>
  );
};

export default PopulationCanvas;
