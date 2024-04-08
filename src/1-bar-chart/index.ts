import './styles.scss';
import * as d3 from 'd3';

// Define the rough interface for GDP data needed
interface GDPData {
  data: [string, number][];
  name: string;
}

// Constants
const WIDTH = 1000;
const HEIGHT = 500;
const PAD = 60;
const DATA_URL: string =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

// Handle mouse over event
function handleMouseOver(
  event: MouseEvent,
  { date, gdp }: { date: string; gdp: number },
) {
  const tooltip = d3.select('#tooltip');

  tooltip
    .html(
      `<p>${date}</p>
      <p>$${gdp} Billion</p>`,
    )
    .attr('data-date', date)
    .attr('class', 'active')
    .style('transform', 'translate(-50%, calc(-100% - 20px))')
    .style('left', `${event.pageX}px`)
    .style('top', `${event.pageY}px`);
}

// Prepare data
function formatData(dataset: GDPData) {
  const { data } = dataset;

  // Create X Scale
  const xMin = d3.min(data, (d) => new Date(d[0]));
  const xMax = d3.max(data, (d) => new Date(d[0]));
  const xScale = d3.scaleTime([xMin, xMax], [0, WIDTH]);

  // Create Y Scale
  const yMax = d3.max(data, (d) => d[1]);
  const yScale = d3.scaleLinear([0, yMax], [0, HEIGHT]);

  const formattedData = data.map((d) => ({
    x: xScale(new Date(d[0])),
    y: HEIGHT - yScale(d[1]) + 10,
    width: Math.ceil(WIDTH / data.length),
    height: yScale(d[1]),
    date: d[0],
    gdp: d[1],
  }));

  return { data: formattedData, xScale, yScale, name: dataset.name, yMax };
}

// Load the dataset asynchronously
async function loadDataset() {
  const res = await fetch(DATA_URL);
  const data = await res.json();

  return formatData(data);
}

// Run the chart population
const init = async () => {
  // Load the dataset
  const { data, xScale, yMax, name } = await loadDataset();

  // Main element
  const main = d3.select('main');

  // Add title
  main.append('h1').attr('id', 'title').text(name);

  // Create main SVG
  const svg = main
    .append('svg')
    .attr('width', WIDTH + PAD)
    .attr('height', HEIGHT + PAD);

  // Create Axes
  const xAxis = d3.axisBottom(xScale).tickSize(-HEIGHT);
  const yAxis = d3
    .axisLeft(d3.scaleLinear([0, yMax], [HEIGHT, 0]))
    .tickSize(-WIDTH);

  // Append X Axis
  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${PAD - 10}, ${HEIGHT + 10})`)
    .call(xAxis);

  // Append Y Axis
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${PAD - 10}, 10)`)
    .call(yAxis);

  // Fill data
  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('data-date', ({ date }) => date)
    .attr('data-gdp', ({ gdp }) => gdp)
    .attr('x', ({ x }) => x)
    .attr('y', ({ y }) => y)
    .attr('transform', `translate(${PAD - 10}, 0)`)
    .attr('width', ({ width }) => width)
    .attr('height', ({ height }) => height)
    .on('mouseover', handleMouseOver)
    .on('mouseout', () => {
      d3.select('#tooltip').attr('class', '');
    });
};

// Call the init function to start the chart
init();
