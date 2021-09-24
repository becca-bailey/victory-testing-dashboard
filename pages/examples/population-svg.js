import * as d3 from "d3";
import get from "lodash/get";
import React from "react";
import styled from "styled-components";
import {Tooltip} from "../../components/svg/Tooltip";
import {XAxis} from "../../components/svg/XAxis";
import {YAxis} from "../../components/svg/YAxis";
import jsonData from "../../public/data/population.json";

const populationData = jsonData.populationData.map(({country, values}) => ({
  country,
  values: values.filter(({value}) => !!value),
}));

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
const defaultLineWidth = 2;
const defaultPointSize = 3.5;
const animationDuration = 200;
const lineColor = "#D1DCE5";

const usePreviousData = (data, defaultValue = {}) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = data;
  });
  return ref.current || defaultValue;
};

const Lines = ({
  nextData,
  lineWidth = defaultLineWidth,
  previousData,
  width,
  height,
  duration = animationDuration,
}) => {
  const canvasRef = React.useRef();
  const [data, setData] = React.useState(nextData);

  const interpolator = React.useMemo(() => {
    return d3.interpolate(previousData, nextData);
  }, [previousData, nextData]);

  const getPath = React.useCallback((data) => {
    const d3Path = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);

    return d3Path(data);
  }, []);

  React.useEffect(() => {
    const timer = d3.timer((elapsed) => {
      const step = duration ? elapsed / duration : 1;
      if (elapsed > duration) {
        timer.stop();
        setData(interpolator(1));
      }
      setData(interpolator(step));
    });

    return () => timer.stop();
  }, [
    setData,
    canvasRef,
    data,
    duration,
    interpolator,
    previousData,
    nextData,
    height,
    width,
  ]);

  return (
    <g>
      {Object.entries(data).map(([country, values]) => (
        <path
          strokeWidth={lineWidth}
          key={country}
          stroke={get(values, "[0].color")}
          d={getPath(values)}
          fill="none"
        />
      ))}
    </g>
  );
};

const Points = ({
  nextData,
  pointSize = defaultPointSize,
  previousData,
  width,
  height,
  margin,
  duration = animationDuration,
  activePoint,
}) => {
  const canvasRef = React.useRef();
  const [data, setData] = React.useState(nextData);

  const x = get(Object.values(data), "[0][0].x");

  const interpolator = React.useMemo(() => {
    return d3.interpolate(previousData, nextData);
  }, [previousData, nextData]);

  React.useEffect(() => {
    const timer = d3.timer((elapsed) => {
      const step = duration ? elapsed / duration : 1;
      if (elapsed > duration) {
        timer.stop();
        setData(interpolator(1));
      }
      setData(interpolator(step));
    });

    return () => timer.stop();
  }, [
    setData,
    canvasRef,
    data,
    duration,
    interpolator,
    previousData,
    nextData,
    height,
    width,
  ]);

  return (
    <g>
      {x && (
        <line
          stroke={lineColor}
          strokeWidth={2}
          x1={x}
          x2={x}
          y1={margin.top}
          y2={height - margin.bottom}
        />
      )}
      {Object.entries(data).map(([country, values]) => {
        return values.map(({x, y, color}) => {
          return (
            <circle key={country} r={pointSize} fill={color} cx={x} cy={y} />
          );
        });
      })}
      {activePoint && (
        <Tooltip
          x={x}
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
    </g>
  );
};

const PopulationSVG = ({
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
        .domain([1960, 2019])
        .range([margin.left, width - margin.right])
        .nice(),
    [margin, width]
  );

  const scaleY = React.useMemo(
    () =>
      d3
        .scaleLinear()
        .domain(d3.extent(flattenedData, (d) => d.value))
        .range([height - margin.bottom, margin.top])
        .nice(),
    [margin, height, flattenedData]
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
  }, [flattenedData, scaleX, scaleY]);

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
          This example uses d3 and SVG render a chart of world population by
          country over the past 60 years. The lines and points are animated with
          d3.timer() and d3.interpolate().
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
          activePoint={
            activePoint && {
              ...activePoint,
              x: scaleX(activePoint.year),
              y: scaleY(activePoint.value),
            }
          }
        />
      </svg>
    </Main>
  );
};

export default PopulationSVG;
