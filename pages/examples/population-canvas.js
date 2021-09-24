import * as d3 from "d3";
import get from "lodash/get";
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
const defaultLineWidth = 2;
const defaultPointSize = 3;
const animationDuration = 100;
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
  margin,
  duration = animationDuration,
}) => {
  const canvasRef = React.useRef();
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

const Points = ({
  nextData,
  pointSize = defaultPointSize,
  previousData,
  width,
  height,
  margin,
  duration = animationDuration,
}) => {
  const canvasRef = React.useRef();
  const [data, setData] = React.useState(nextData);

  const interpolator = React.useMemo(() => {
    return d3.interpolate(previousData, nextData);
  }, [previousData, nextData]);

  const draw = React.useCallback(
    (ctx, {x, y, color = "black"}) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
      ctx.fill();
    },
    [pointSize]
  );

  const drawLine = React.useCallback(
    (ctx, x) => {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.closePath();
      ctx.stroke();
    },
    [height, margin]
  );

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const timer = d3.timer((elapsed) => {
      ctx.clearRect(0, 0, width, height);

      const x = get(Object.values(data), "[0][0].x");
      if (x) {
        drawLine(ctx, x);
      }
      Object.values(data).forEach((points) => {
        points.forEach((d) => draw(ctx, d));
      });

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
    draw,
    drawLine,
    duration,
    interpolator,
    previousData,
    nextData,
    height,
    width,
  ]);

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
    return data.reduce((all, {country, values}) => {
      return [...all, ...values.map((v) => ({...v, country}))];
    }, []);
  }, [data]);

  const getColor = React.useCallback(
    (values) => {
      const colorScale = d3
        .scaleSequential()
        .domain([0, d3.max(flattenedData, (d) => d.value)])
        .interpolator(d3.interpolateRainbow);

      const mean = d3.mean(values.map(({value}) => value));
      return colorScale(mean);
    },
    [flattenedData]
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
      return {
        ...d,
        [country]: scale(values, {color: getColor(values)}),
      };
    }, {});
  }, [filteredData, getColor, scale]);

  const nextPointsData = React.useMemo(() => {
    if (!activePoint) {
      return {};
    }

    return filteredData.reduce((d, {country, values}) => {
      const activeValues = values.filter(({year}) => year === activePoint.year);
      return {
        ...d,
        [country]: scale(activeValues, {color: getColor(values)}),
      };
    }, {});
  }, [filteredData, activePoint, getColor, scale]);

  const previousLineData = usePreviousData(nextLineData);
  const previousPointsData = usePreviousData(nextPointsData);

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
    </Main>
  );
};

export default PopulationCanvas;
