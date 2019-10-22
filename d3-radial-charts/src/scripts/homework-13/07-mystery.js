import * as d3 from 'd3'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }
const height = 600 - margin.top - margin.bottom
const width = 600 - margin.left - margin.right

const svg = d3
  .select('#chart-7')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const parseTime = d3.timeParse('%H:%M')

const angleScale = d3
  .scaleBand()
  // Need domain
  .range([0, Math.PI * 2])

const radius = 300

const radiusScale = d3
  .scaleLinear()
  .domain([0, 90000])
  .range([0, radius])

const line = d3
  .radialArea()
  .angle(d => angleScale(d.time))
  .innerRadius(radiusScale(40000))
  .outerRadius(d => radiusScale(d.total))
  .curve(d3.curveBasis)

const colorScaleAbove = d3
  .scaleSequential(d3.interpolateYlOrBr)
  .domain([20000, 90000])
//  .range(['blue', 'red'])

const colorScaleBelow = d3
  .scaleSequential(d3.interpolateYlGnBu)
  .domain([50000, 20000])

d3.csv(require('/data/time-binned.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  // Throw January onto the end so it connects
  datapoints.push(datapoints[0])

  const dates = datapoints.map(d => d.time)
  angleScale.domain(dates)

  // line.angle(d => angleScale(dates))

  const container = svg
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  container
    .append('mask')
    .attr('id', 'births')
    .append('path')
    .datum(datapoints)
    .attr('d', line)
    .attr('fill', 'white')

  const times2 = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'
  ]

  const bands = d3.range(0, 80000, 2500)

  container
    .append('g')
    .attr('mask', 'url(#births)')
    .selectAll('.scale-band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('fill', function(d) {
      if (d <= 40000) {
        return colorScaleBelow(d)
      } else {
        return colorScaleAbove(d)
      }
    })
    .attr('stroke', 'none')
    .attr('cx', 0)
    .attr('cy', 0)
    .lower()

  container
    .selectAll('.small-circles')
    .data(times2)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('cx', 0)
    .attr('cy', -radiusScale(60000))
    .attr('transform', d => {
      return `rotate(${(angleScale(d) / Math.PI) * 180})`
    })
    .attr('fill', 'silver')
    .style('stroke', 'white')
    .style('stroke-width', 3)
    .lower()

  container
    .append('circle')
    .attr('fill', 'none')
    .attr('stroke', 'silver')
    .attr('stroke-width', 2)
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radiusScale(60000))
    .lower()

  container
    .selectAll('.time-text')
    .data(times2)
    .enter()
    .append('text')
    .text(function(d) {
      if (d === '00:00') {
        return 'Midnight'
      } else {
        return d.replace(':00', '')
      }
    })
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -radiusScale(60000))
    .attr('transform', d => {
      return `rotate(${(angleScale(d) / Math.PI) * 180})`
    })
    .attr('fill', 'silver')
    .attr('dy', 18)
    .lower()

  container
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text('Average births')
    .attr('text-anchor', 'middle')
    .attr('font-weight', 600)
    .style('font-size', 25)

  container
    .append('text')
    .attr('x', 0)
    .attr('y', 22)
    .text('per minute')
    .attr('text-anchor', 'middle')
    .attr('font-weight', 600)
    .style('font-size', 25)
}
