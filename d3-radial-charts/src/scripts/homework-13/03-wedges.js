import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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

const radius = 200

// If I sell 0 houses, I have a radius of 0
// If I sell 70 houses, I have a radius of... radius? 150
const radiusScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, radius])

// base the outerRadius on the high temp using the radiusScale
const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(d => radiusScale(+d.high_temp))
  .startAngle(d => angleScale(d.month_name))
  .endAngle(d => angleScale(d.month_name) + angleScale.bandwidth())

// We don't have columns, so it's just d, not d.month
const labelArc = d3
  .arc()
  .innerRadius(radius)
  .outerRadius(radius)
  .startAngle(d => angleScale(d))
  .endAngle(d => angleScale(d) + angleScale.bandwidth())

const colorScale = d3
  .scaleLinear()
  .domain([38, 83])
  .range(['#B6D5E3', '#FDC0CC'])

d3.csv(require('/data/ny-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  // Throw January onto the end so it connects
  // datapoints.push(datapoints[0])

  const holder = svg
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  // Add a path for
  // EVERY!
  //  SINGLE!
  //    DATAPOINT!
  holder
    .selectAll('.temp-bar')
    .data(datapoints)
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
    .selectAll('.radius-line')
    .data(datapoints)
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', function(d) {
      return -radiusScale(+d.high_temp)
    })
    .attr('stroke', 'lightgrey')
    .attr('transform', function(d) {
      return `rotate(${(angleScale(d.month_name) * 180) / Math.PI})`
    })

  // Add one text element for every category
  // that our angleScale knows about
  // we aren't using .data(months) because
  // we want to be able to cut and paste
  // holder
  //   .selectAll('.outside-label')
  //   .data(datapoints)
  //   .enter()
  //   .append('text')
  //   .text(d => d.month_name)
  //   // .attr('y', -radius) // set it up at the top of the chart
  //   // .attr('dy', -10) // give a little offset to push it higher
  //   .attr('text-anchor', 'middle')
  //   .attr('alignment-baseline', 'middle')
  //   .attr('transform', function(d) {
  //     return `translate(${labelArc.centroid(d.month_name)})`
  //   })

  // holder
  //   .append('text')
  //   .text('NYC average temperature highs')
  //   // .attr('x', width / 2)
  //   .attr('y', -radius)
  //   .attr('font-size', 15)
  //   .attr('fill', 'black')
  //   .attr('text-anchor', 'middle')
}
