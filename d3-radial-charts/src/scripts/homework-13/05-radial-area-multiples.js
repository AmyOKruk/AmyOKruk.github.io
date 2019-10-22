import * as d3 from 'd3'

const margin = { top: 30, left: 90, right: 30, bottom: 30 }

const height = 450 - margin.top - margin.bottom

const width = 1080 - margin.left - margin.right

const svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const radius = 70

const radiusScale = d3
  .scaleLinear()
  .domain([0, 84])
  .range([30, radius])

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec'
]

const cities = ['NYC', 'Tuscon', 'Lima', 'Beijing', 'Stockholm', 'Melbourne']

const angleScale = d3
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

const xPositionScale = d3.scaleBand().range([0, width])

const line = d3
  .radialArea()
  .innerRadius(d => radiusScale(d.low_temp))
  .outerRadius(d => radiusScale(d.high_temp))
  .angle(d => angleScale(d.month_name))

const bands = [20, 40, 60, 80, 100]
const labels = [20, 60, 100]

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  xPositionScale.domain(cities)

  const nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  const holder = svg.append('g')

  holder
    .selectAll('.graph')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return 'translate(' + xPositionScale(d.key) + ',' + height / 2 + ')'
    })
    .each(function(d) {
      const datapoints = d.values
      datapoints.push(datapoints[0])
      console.log(d)
      const g = d3.select(this)
      g.append('path')
        .datum(datapoints)
        .attr('d', d => line(d))
        .attr('fill', 'pink')
        .attr('opacity', 0.8)
        .attr('stroke', 'none')

      g.selectAll('.scale-band')
        .data(bands)
        .enter()
        .append('circle')
        .attr('r', d => radiusScale(d))
        .attr('fill', 'none')
        .attr('stroke', 'lightgrey')
        .attr('cx', 0)
        .attr('cy', 0)
        .lower()

      g.selectAll('.temp-label')
        .data(labels)
        .enter()
        .append('text')
        .text(d => d + '°')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', d => -radiusScale(d))
        .attr('dy', -1)
        .attr('font-size', 11)

      g.selectAll('.title')
        .data(datapoints)
        .enter()
        .append('text')
        .text(d => d.city)
        // .attr('y', d => -radiusScale(d))
        .style('font-size', 16)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
    })
}
