import './styles.scss';
import * as d3 from 'd3';

// Constants
const WIDTH = 1000;
const HEIGHT = 500;
const PAD = 60;
const DATA_URL: string =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const MONTH_MAP = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface MonthlyVariance {
  year: number;
  month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  variance: number;
}

interface TemperatureData {
  baseTemperature: number;
  monthlyVariance: MonthlyVariance[];
}

// Prepare data
function formatData(dataset: TemperatureData) {
  console.log(dataset);
  const { monthlyVariance } = dataset;

  // Create X Scale
  const xMin = d3.min(monthlyVariance, ({ year }) => year);
  const xMax = d3.max(monthlyVariance, ({ year }) => year);
  const xScale = d3.scaleLinear([xMin, xMax + 1], [0, WIDTH]);

  // Create Y Scale
  const yScale = d3.scaleBand(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    [0, HEIGHT],
  );

  // Create Temperature Scale
  const tMin = d3.min(monthlyVariance, ({ variance }) => variance);
  const tMax = d3.max(monthlyVariance, ({ variance }) => variance);
  const tScale = d3.scaleDiverging(
    [tMin, 0, tMax],
    d3.interpolateRgbBasis(['blue', 'white', 'red']),
  );

  const formattedData = monthlyVariance.map(({ year, month, variance }) => {
    return {
      x: xScale(year),
      y: yScale(month),
      fill: tScale(variance),
      height: HEIGHT / 12,
      width: WIDTH / (xMax - xMin),
      year,
      month,
      temp: variance,
    };
  });

  return {
    data: formattedData,
    baseTemperature: dataset.baseTemperature,
    xScale,
    yScale,
  };
}

// Load the dataset asynchronously
async function loadDataset() {
  const res = await fetch(DATA_URL);
  const data = await res.json();

  return formatData(data);
}

async function init() {
  const { baseTemperature, data, xScale, yScale } = await loadDataset();

  // Main Element
  const main = d3.select('main');

  // SVG
  const svg = main
    .append('svg')
    .attr('width', WIDTH + PAD)
    .attr('height', HEIGHT + PAD);

  // Create Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale).tickFormat((month: number) => {
    return MONTH_MAP[month - 1];
  });

  // Append Y Axis
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${PAD - 10}, 10)`)
    .call(yAxis);

  // Append X Axis
  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${PAD - 10}, ${HEIGHT + 10})`)
    .call(xAxis);

  // Add data
  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', ({ x }) => x)
    .attr('y', ({ y }) => y)
    .attr('width', ({ width }) => width)
    .attr('height', ({ height }) => height)
    .attr('fill', ({ fill }) => fill)
    .attr('transform', `translate(${PAD - 9}, 10)`)
    .attr('data-month', ({ month }) => month)
    .attr('data-year', ({ year }) => year)
    .attr('data-temp', ({ temp }) => temp);
}

init();
