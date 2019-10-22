import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 30, bottom: 30 }
const height = 400 - margin.top - margin.bottom
const width = 780 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// At the very least you'll need scales, and
// you'll need to read in the file. And you'll need
// and svg, too, probably.

// Scales

const pie = d3.pie().value(function(d) {
  return d.minutes
})

const radius = 80

const arc = d3
  .arc()
  .innerRadius(0)
  .outerRadius(radius)

const colorScale = d3.scaleOrdinal().range(['#b3e2cd', '#cbd5e8', '#fff2ae'])

const xPositionScale = d3.scalePoint().range([0, width])

const tasks = ['Typing code', 'Rewriting code', 'Reading StackOverflow']

const angleScale = d3
  .scaleBand()
  .domain(tasks)
  .range([0, Math.PI * 2])

// Read in the data

d3.csv(require('/data/time-breakdown-all.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const projects = datapoints.map(d => d.project)
  xPositionScale.domain(projects).padding(0.4)

  const nested = d3
    .nest()
    .key(d => d.project)
    .entries(datapoints)

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
      const datapoints = d.values

      container
        .selectAll('path')
        .data(pie(datapoints))
        .enter()
        .append('path')
        .attr('d', function(d) {
          return arc(d)
        })
        .style('fill', d => colorScale(d.data.task))

      container
        .append('text')
        .text(d => d.key)
        .attr('x', xPositionScale(d.projects))
        .attr('y', height / 3)
        .attr('font-size', 15)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
    })
}
