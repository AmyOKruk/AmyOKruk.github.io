import * as d3 from 'd3'

const margin = { top: 30, left: 30, right: 110, bottom: 30 }

const height = 400 - margin.top - margin.bottom

const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create our scales
const xPositionScale = d3
  .scaleLinear()
  .domain([2007, 2019])
  .range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([0, 30])
  .range([height, 0])

const line = d3
  .line()
  .x(d => xPositionScale(d.Year))
  .y(d => yPositionScale(d.Percent))
// Create a line generator
// This explains how to compute
// the points that make up the line

// Read in files
d3.csv(require('../data/politifacts_score_freq_Sept2019.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  // Draw the lines
  const nested = d3
    .nest()
    .key(d => d.Score)
    .entries(datapoints)

  console.log(nested)

  svg
    .selectAll('text')
    .data(nested)
    .enter()
    .append('text')
    .text(d => d.key)
    .attr('x', width)
    .attr('y', function(d) {
      const datapoints = d.values
      // var decData = datapoints[datapoints.length - 1]
      // find datapoint for month 12
      const decData = datapoints.find(d => +d.Year === 2019)
      return yPositionScale(decData.Percent)
    })
    .attr('font-size', 16)
    .attr('alignment-baseline', 'middle')
    .attr('dx', 8)
    .attr('fill', function(d) {
      if (d.key === 'True' || d.key === 'False' || d.key === 'Pants on Fire!') {
        return 'black'
      } else {
        return 'grey'
      }
    })
    .attr('dy', function(d) {
      // Only push these two cities down some
      if (d.key === 'Mostly False') {
        return -7
      }
      if (d.key === 'Mostly True') {
        return 10
      } else {
        return 0
      }
    })

  svg
    .selectAll('path')
    .data(nested)
    .enter()
    .append('path')
    .attr('fill', 'none')
    // .attr('stroke', 'black')
    .attr('stroke', function(d) {
      // Only push these two cities down some
      if (d.key === 'True') {
        return '#FFCC8D'
      } else if (d.key === 'False') {
        return '#E95654'
      } else if (d.key === 'Pants on Fire!') {
        return '#FA7D5F'
      } else {
        return 'grey'
      }
    })
    .attr('stroke-opacity', function(d) {
      if (d.key === 'True' || d.key === 'False' || d.key === 'Pants on Fire!') {
        return 1
      } else {
        return 0.3
      }
    })
    .attr('stroke-width', 3)
    .attr('d', function(d) {
      return line(d.values)
    })

  nested.forEach(function(d) {
    // iterate over all the data for line to get the last point of a line.
    const last = d.values[d.values.length - 1]
    svg
      .append('circle')
      .attr('cx', function(d) {
        return xPositionScale(last.Year)
      })
      .attr('cy', function(d) {
        return yPositionScale(last.Percent)
      })
      .attr('r', 3)
      .attr('fill', function(d) {
        console.log('hey this is ', last.Score)
        // Only push these two cities down some
        if (last.Score === 'True') {
          return '#FFCC8D'
        } else if (last.Score === 'False') {
          return '#E95654'
        } else if (last.Score === 'Pants on Fire!') {
          return '#FA7D5F'
        } else {
          return 'grey'
        }
      })
      .attr('opacity', function(d) {
        if (
          last.Score === 'True' ||
          last.Score === 'False' ||
          last.Score === 'Pants on Fire!'
        ) {
          return 1
        } else {
          return 0.3
        }
      })
  })

  const yAxis = d3
    .axisLeft(yPositionScale)
    .tickSize(-width)
    .tickValues([5, 10, 15, 20, 25, 30])

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .lower()
    .call(
      g => g.selectAll('.tick text').attr('x', -10)
      // .attr('dy', -4)
    )

  d3.select('.y-axis .domain').remove()
  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.format('d'))
    .tickValues([2008, 2010, 2012, 2014, 2016, 2018])
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .lower()
    .call(g => g.select('.domain').remove())
}

// this.xAxis
//   .select('path')
//   .style({ stroke: 'red', fill: 'none', 'stroke-width': '1px' })

// // d3.selectAll('.x.axis line').style('stroke', 'gray')
