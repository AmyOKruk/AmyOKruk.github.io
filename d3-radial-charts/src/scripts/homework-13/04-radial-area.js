import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`)
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)

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
  // .scalePoint()
  // .padding(0.5)
  .scaleBand()
  .domain(months)
  .range([0, Math.PI * 2])

const radius = 200

// If I sell 0 houses, I have a radius of 0
// If I sell 70 houses, I have a radius of... radius? 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, radius])

// Make the outside of the shape based on
// the high temperature
// make the inside of the shape based
// on the low temperature
const line = d3
  .radialArea()
  .angle(function(d) {
    return angleScale(d.month_name)
  })
  .innerRadius(d => radiusScale(+d.low_temp))
  .outerRadius(d => radiusScale(+d.high_temp))

// const avgLine = d3
//   .radialLine()
//   .angle(d => angleScale(d.month))
//   .radius(d => radiusScale((+d.high + +d.low) / 2))

d3.csv(require('/data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  // Throw January onto the end so it connects
  datapoints.push(datapoints[0])

  svg
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'lightblue')
    .attr('opacity', 0.5)

  const bands = [20, 30, 40, 50, 60, 70, 80, 90]

  // Draw a circle for each item in bands
  svg
    .selectAll('.band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('fill', 'none')
    .attr('stroke', 'lightgrey')
    .attr('r', function(d) {
      return radiusScale(d)
    })
    .lower()

  svg
    .selectAll('.label')
    .data(bands)
    .enter()
    .append('text')
    .text(function(d) {
      if (d === 30 || d === 50 || d === 70 || d === 90) {
        return d + '°'
      } else {
        return ' '
      }
    })
    .attr('dy', -10)
    .attr('y', d => -radiusScale(d))
    .style('font-size', 10)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

  svg
    .selectAll('.title')
    .data(datapoints)
    .enter()
    .append('text')
    .text('NYC')
    .attr('y', d => -radiusScale(d))
    .style('font-size', 30)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
}
