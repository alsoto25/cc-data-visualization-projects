import './styles.scss';
import * as d3 from 'd3';

// Constants
const WIDTH = 1000;
const HEIGHT = 500;
const PAD = 60;
const DATA_URL: string =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

interface CyclistData {
  Doping: string;
  Name: string;
  Nationality: string;
  Place: number;
  Seconds: number;
  Time: string;
  URL: string;
  Year: number;
}

// Handle mouse over event
function handleMouseOver(
  event: MouseEvent,
  { details, year }: { details: string; year: number },
) {
  const tooltip = d3.select('#tooltip');

  tooltip
    .html(details)
    .attr('data-year', year)
    .attr('class', 'active')
    .style('transform', 'translate(-50%, calc(-100% - 20px))')
    .style('left', `${event.pageX}px`)
    .style('top', `${event.pageY}px`);
}

// Create tooltip content
function createTooltipContent({
  Name,
  Nationality,
  Time,
  Place,
  Doping,
  Year,
}: CyclistData) {
  return `
  <div class="tooltip__content">
    <div class="tooltip__header">
      <strong class="tooltip__name">${Name} (${Nationality})</strong>
      <div class="tooltip__year">${Year}</div>
    </div>
    <div><strong>Place:</strong> ${Place} (<em>${Time.split(':')[0]}m ${
    Time.split(':')[1]
  }s</em>)</div>
    ${
      Doping && Doping !== ''
        ? `<div><strong>Case:</strong> ${Doping}</div>`
        : ''
    }
  </div>
  `;
}

// Prepare data
function formatData(dataset: CyclistData[]) {
  console.log(dataset);

  // Create X Scale
  const xMin = d3.min(dataset, (d: CyclistData) => d.Year);
  const xMax = d3.max(dataset, (d: CyclistData) => d.Year);
  const xScale = d3.scaleLinear([xMin - 1, xMax + 2], [0, WIDTH]);

  // Create Y Scale
  const yMin = d3.min(dataset, (d: CyclistData) => d.Seconds);
  const yMax = d3.max(dataset, (d: CyclistData) => d.Seconds);
  const yScale = d3.scaleLinear([yMin - 10, yMax + 10], [0, HEIGHT]);

  // Create Color Scales
  const xColorScale = d3.scaleLinear([xMin, xMax], [50, 200]);
  const yColorScale = d3.scaleLinear([yMin, yMax], [50, 200]);

  // Format Data
  const formattedData = dataset.map((d) => ({
    x: xScale(d.Year) + PAD,
    y: yScale(d.Seconds),
    time: new Date(d.Seconds * 1000), // Multiple x 1000 since it passes miliseconds
    year: d.Year,
    details: createTooltipContent(d),
    fill: `rgb(50, ${d.Doping === '' ? 200 : 50}, ${
      d.Doping === '' ? 50 : 200
    })`,
  }));

  return { data: formattedData, xScale, yScale };
}

// Load the dataset asynchronously
async function loadDataset() {
  const res = await fetch(DATA_URL);
  const data = await res.json();

  return formatData(data);
}

// Create Legend
function createLegend(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  data: { color: string; description: string }[],
) {
  const group = svg
    .append('g')
    .attr('id', 'legend')
    .selectAll('g')
    .data(data)
    .enter()
    .append('g');

  // Add the color rect
  group
    .append('rect')
    .attr('width', '15')
    .attr('height', '15')
    .attr('stroke', '#222')
    .attr('fill', ({ color }) => color)
    .attr('x', WIDTH)
    .attr('y', (_, i) => 25 * i + 100);

  // Add the text
  group
    .append('text')
    .text(({ description }) => description)
    .attr('x', WIDTH - 5)
    .attr('y', (_, i) => 25 * i + 100)
    .attr('dy', '1em')
    .attr('class', 'legend');
}

async function init() {
  const { data, xScale, yScale } = await loadDataset();

  // Main Element
  const main = d3.select('main');

  // Create main SVG
  const svg = main
    .append('svg')
    .attr('width', WIDTH + PAD)
    .attr('height', HEIGHT + PAD);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale).tickFormat((d: number) => {
    const minutes = Math.floor(d / 60);
    const seconds = (d % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
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

  // Adding all circles
  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', '5')
    .attr('cx', ({ x }) => x)
    .attr('cy', ({ y }) => y)
    .attr('transform', `translate(-10, 10)`)
    .attr('fill', ({ fill }) => fill)
    .attr('data-xvalue', ({ year }) => year)
    .attr('data-yvalue', ({ time }) => time.toISOString())
    .on('mouseover', handleMouseOver)
    .on('mouseout', () => {
      d3.select('#tooltip').attr('class', '');
    });

  createLegend(svg, [
    { color: 'rgb(50, 200, 50)', description: 'No doping allegations' },
    { color: 'rgb(50, 50, 200)', description: 'Doping allegations' },
  ]);
}

init();
