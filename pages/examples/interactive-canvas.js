import * as d3 from "d3";
import {isEqual} from "lodash";
import React from "react";
import {Tooltip} from "../../components/svg/Tooltip";
import {XAxis} from "../../components/svg/XAxis";
import {YAxis} from "../../components/svg/YAxis";
import jsonData from "../../public/data/population.json";
import styled from "styled-components";

const populationData = jsonData.populationData;

const Main = styled.main``;

const Title = styled.h1`
  padding: 3rem;
  margin: 0 2rem;
`;

const Text = styled.text`
  font-family: Urbanist, sans-serif;
`;

const defaultWidth = 800;
const defaultHeight = 600;
const defaultMargin = {
  left: 70,
  right: 20,
  top: 20,
  bottom: 60,
};
const defaultLineWidth = 2;
const defaultPointSize = 3;
const animationDuration = 200;
const lineColor = "#D1DCE5";

export const usePreviousData = (data) => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = data;
  });
  return ref.current || {};
};

const Lines = ({
  canvasRef,
  nextData,
  lineWidth = defaultLineWidth,
  previousData,
  width,
  height,
  duration = animationDuration,
}) => {
  const [data, setData] = React.useState(nextData);

  const interpolator = React.useMemo(() => {
    return d3.interpolate(previousData, nextData);
  }, [previousData, nextData]);

  const draw = React.useCallback(
    (ctx, data) => {
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
    },
    [lineWidth]
  );

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    if (!!previousData && !isEqual(previousData, nextData)) {
      const timer = d3.timer((elapsed) => {
        ctx.clearRect(0, 0, width, height);
        Object.values(data).forEach((d) => {
          draw(ctx, d);
        });

        const step = duration ? elapsed / duration : 1;
        if (elapsed > duration) {
          timer.stop();
          setData(interpolator(1));
        }
        setData(interpolator(step));
      });

      return () => timer.stop();
    }
  }, [
    setData,
    canvasRef,
    data,
    draw,
    duration,
    interpolator,
    previousData,
    nextData,
    height,
    width,
  ]);

  return null;
};

const InteractiveCanvasExample = ({
  width = defaultWidth,
  height = defaultHeight,
  data = populationData,
  margin = defaultMargin,
}) => {
  const linesCanvasRef = React.useRef();
  const pointsCanvasRef = React.useRef();
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

  const nextData = React.useMemo(() => {
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

  const previousData = usePreviousData(nextData);

  return (
    <Main>
      <Title>World Population 1960-2019</Title>
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
        {activePoint && (
          <line
            stroke={lineColor}
            strokeWidth={2}
            x1={activePoint.x}
            x2={activePoint.x}
            y1={margin.top}
            y2={height - margin.bottom}
          />
        )}
        <XAxis scale={scaleX} margin={margin} height={height} />
        <YAxis scale={scaleY} margin={margin} />
      </svg>
      <canvas
        ref={linesCanvasRef}
        width={width}
        height={height}
        style={{
          marginLeft: margin.left,
          marginRight: margin.right,
          marginTop: margin.top,
          marginBottom: margin.bottom,
        }}
      />
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
        ref={pointsCanvasRef}
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
        {activePoint && (
          <Tooltip
            x={activePoint.x}
            y={activePoint.y}
            width={200}
            height={100}
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
      <Lines
        canvasRef={linesCanvasRef}
        nextData={nextData}
        previousData={previousData}
        width={width}
        height={height}
      />
    </Main>
  );
};

export default InteractiveCanvasExample;
