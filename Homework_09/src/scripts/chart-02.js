import * as d3 from 'd3'

import d3Tip from 'd3-tip'

import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 30, left: 110, right: 30, bottom: 30 }
const height = 300 - margin.top - margin.bottom
const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Create your scales

const xPositionScale = d3
  .scaleLinear()
  .domain([0, 30])
  .range([0, width])

const yPositionScale = d3
  .scaleBand()
  .padding(0.2)
  .range([height, 0])

const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .offset([25, 375])
  .html(function(d) {
    console.log('hey u', d)
    return `<span style='font-weight:700'>${d.no} statements</span>`
  })

svg.call(tip)

// Create a d3.line function that uses your scales

d3.csv(require('../data/obama.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  // Draw your dots
  const scores = datapoints.map(d => d.cat)
  yPositionScale.domain(scores)

  // const countMax = d3.max(datapoints, d => +d.percent)
  // xPositionScale.domain([0, countMax])

  svg
    .selectAll('rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('y', function(d) {
      // console.log(d.kind)
      return yPositionScale(d.cat)
    })
    .attr('x', 0)
    .attr('width', function(d) {
      return xPositionScale(d.percent)
    })
    // .attr('width', d => xPositionScale(d.count))
    .attr('height', yPositionScale.bandwidth())
    .attr('fill', function(d) {
      if (d.cat === 'Mostly True') {
        return '#FA7D5F'
      } else {
        return 'lightgrey'
      }
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  svg
    .selectAll('text')
    .data(datapoints)
    .enter()
    .append('text')
    .text(function(d) {
      return d.percent + '%'
    })
    .attr('x', function(d) {
      return xPositionScale(d.percent)
    })
    .attr('y', function(d) {
      return yPositionScale(d.cat)
    })
    .attr('font-size', 16)
    // .attr('alignment-baseline', 'middle')
    // .attr('dx', 8)
    .attr('fill', function(d) {
      if (d.cat === 'Mostly True') {
        return '#FA7D5F'
      } else {
        return 'black'
      }
    })
    .attr('dx', 7)
    .attr('dy', 20)
    .attr('font-weight', 700)

  // Add your annotations
  // const annotations = [
  //   {
  //     note: {
  //       label: 'Longer text to show text wrapping',
  //       title: 'Here is an annotation'
  //     },
  //     // Copying what our data looks like
  //     // this is the point I want to annotate
  //     data: { Percent: '2015-12-14', Count: 106 },
  //     dx: -50,
  //     dy: 20,
  //     color: 'red'
  //   }
  // ]

  // const makeAnnotations = d3Annotation
  //   .annotation()
  //   .accessors({
  //     x: d => xPositionScale(parseTime(d.Date)),
  //     y: d => yPositionScale(d.Close)
  //   })
  //   .annotations(annotations)

  // svg.call(makeAnnotations)

  // Add your axes

  // const xAxis = d3.axisBottom(xPositionScale)
  // svg
  //   .append('g')
  //   .attr('class', 'axis x-axis')
  //   .attr('transform', 'translate(0,' + height + ')')
  //   .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale).tickSize(0)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .call(g => g.select('.domain').remove())
    .call(
      g => g.selectAll('.tick text').attr('x', -15)
      // .attr('dy', -4)
    )
    .attr('text-fill', '#FA7D5F')
    .selectAll('.tick')
    .each(function(d, i) {
      if (d === 'Mostly True') {
        d3.select(this)
          .select('text')
          .attr('fill', '#FA7D5F')
          .attr('font-weight', 700)
      }
    })
}
