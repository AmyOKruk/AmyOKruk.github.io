import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-3c')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

// Scales

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

// I give you a month
// you give me back a number of radians
const angleScale = d3
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

const radius = 70

// If I sell 0 houses, I have a radius of 0
// If I sell 70 houses, I have a radius of... radius? 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, radius])

// base the outerRadius on the high temp using the radiusScale
const arc = d3
  .arc()
  .innerRadius(d => radiusScale(+d.low_temp))
  .outerRadius(d => radiusScale(+d.high_temp))
  .startAngle(d => angleScale(d.month_name))
  .endAngle(d => angleScale(d.month_name) + angleScale.bandwidth())

// const labelArc = d3
//   .arc()
//   .innerRadius(radius)
//   .outerRadius(radius)
//   .startAngle(d => angleScale(d))
//   .endAngle(d => angleScale(d) + angleScale.bandwidth())

const colorScale = d3
  .scaleLinear()
  .domain([38, 83])
  .range(['#B6D5E3', '#FDC0CC'])

const xPositionScale = d3.scalePoint().range([0, width])

// Read in the data

d3.csv(require('/data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const nested = d3
    .nest()
    .key(d => d.city)
    .entries(datapoints)

  const cities = nested.map(d => d.key)
  xPositionScale.domain(cities).padding(0.4)

  svg
    .selectAll('.graph')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', function(d) {
      return 'translate(' + xPositionScale(d.key) + ',' + height / 2 + ')'
    })
    .each(function(d) {
      const container = d3.select(this)
      const data = d.values

      const holder = container.append('g')
      // .attr('transform', `translate(${width / 2},${height / 2})`)

      // Add a path for
      // EVERY!
      //  SINGLE!
      //    DATAPOINT!
      holder
        .selectAll('.temp-bar')
        .data(data)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.high_temp))

      holder
        .append('circle')
        .attr('r', 3)
        .attr('cx', 0)
        .attr('cy', 0)

      holder
        .append('text')
        .text(function(d) {
          return d.key
        })
        .attr('y', -radius)
        .attr('font-size', 15)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')

      holder
        .selectAll('.radius-line')
        .data(data)
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', function(d) {
          return -radiusScale(+d.high_temp)
        })
        .attr('stroke', 'white')
        .attr('transform', function(d) {
          return `rotate(${(angleScale(d.month_name) * 180) / Math.PI})`
        })
    })
}
