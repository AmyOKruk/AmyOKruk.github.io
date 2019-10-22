import * as d3 from 'd3'
import { metaProperty } from '@babel/types'

const margin = { top: 40, left: 0, right: 0, bottom: 0 }
const height = 450 - margin.top - margin.bottom
const width = 450 - margin.left - margin.right

const svg = d3
  .select('#chart-8')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const angleScale = d3
  .scaleBand()
  // .domain(categories)
  .range([0, Math.PI * 2])

const radius = 150

const radiusScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([0, radius])

const line = d3
  .radialLine()
  .angle(d => angleScale(d.name))
  .radius(d => radiusScale(d.value))

const maxMinutes = 40
const maxPoints = 30
const maxFieldGoals = 10
const max3P = 5
const maxFreeThrows = 10
const maxRebounds = 15
const maxAssists = 10
const maxSteals = 5
const maxBlocks = 5

d3.csv(require('/data/nba.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

function ready(datapoints) {
  const player = datapoints[0]

  const container = svg
    .append('g')
    .attr('transform', `translate(${height / 2},${width / 2})`)

  // const cols = ['MP', 'PTS', 'FG', '3P', 'FT', 'TRB', 'AST', 'STL', 'BLK']

  // const customDatapoints = []

  // function getCols(data) {
  //   Object.entries(data).forEach(function(d) {
  //     if (cols.includes(d[0])) {
  //       console.log(d[0])
  //       return customDatapoints.push({ name: d[0], value: +d[1] })
  //     }
  //   })
  // }

  // getCols(player)
  // console.log(customDatapoints)

  const customDatapoints = [
    { name: 'Minutes', value: player.MP / maxMinutes },
    { name: 'Points', value: player.PTS / maxPoints },
    { name: 'Field Goals', value: player.FG / maxFieldGoals },
    { name: '3-Point Field Goals', value: player['3P'] / max3P },
    { name: 'Free Throws', value: player.FT / maxFreeThrows },
    { name: 'Rebounds', value: player.TRB / maxRebounds },
    { name: 'Assists', value: player.AST / maxAssists },
    { name: 'Steals', value: player.STL / maxSteals },
    { name: 'Blocks', value: player.BLK / maxBlocks }
  ]

  const categories = customDatapoints.map(d => d.name)
  angleScale.domain(categories)

  const bands = [0.2, 0.4, 0.6, 0.8, 1]

  container
    .append('g')
    .selectAll('.scale-band2')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('fill', function(d) {
      if (d === 0.2 || d === 0.6 || d === 1) {
        return '#e8e7e5'
      } else {
        return '#f6f6f6'
      }
    })
    .attr('stroke', 'none')
    .attr('cx', 0)
    .attr('cy', 0)
    .lower()

  container
    .append('mask')
    .attr('id', 'radar')
    .append('path')
    .datum(customDatapoints)
    .attr('d', line)
    .attr('fill', 'white')

  container
    .append('g')
    .attr('mask', 'url(#radar)')
    .selectAll('.scale-band')
    .data(bands)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(d))
    .attr('fill', function(d) {
      if (d === 0.2 || d === 0.6 || d === 1) {
        return '#c7453a'
      } else {
        return '#fdb735'
      }
    })
    .attr('stroke', 'none')
    .attr('cx', 0)
    .attr('cy', 0)
    .lower()

  container
    .selectAll('.outside-label')
    .data(angleScale.domain())
    .enter()
    .append('text')
    .text(d => d)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('x', function(d) {
      const a = angleScale(d)
      const r = radius + 30

      return r * Math.sin(a)
    })
    .attr('y', function(d) {
      const a = angleScale(d)
      const r = radius + 30

      return r * Math.cos(a) * -1
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxMinutes)

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxPoints)
    .attr('transform', d => {
      const degrees = (angleScale('Points') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxFieldGoals)
    .attr('transform', d => {
      const degrees = (angleScale('Field Goals') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * max3P)
    .attr('transform', d => {
      const degrees = (angleScale('3-Point Field Goals') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxFreeThrows)
    .attr('transform', d => {
      const degrees = (angleScale('Free Throws') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxRebounds)
    .attr('transform', d => {
      const degrees = (angleScale('Rebounds') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxAssists)
    .attr('transform', d => {
      const degrees = (angleScale('Assists') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxSteals)
    .attr('transform', d => {
      const degrees = (angleScale('Steals') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .selectAll('.text-label')
    .data(bands)
    .enter()
    .append('text')
    .attr('y', d => -radiusScale(d))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('alignment-baseline', 'middle')
    .text(d => d * maxBlocks)
    .attr('transform', d => {
      const degrees = (angleScale('Blocks') / Math.PI) * 180
      return `rotate(${degrees})`
    })

  container
    .append('text')
    .style('font-size', 20)
    .style('font-weight', 'bold')
    .text('LeBron James')
    .attr('y', -radius)
    .attr('dy', -65)
    .attr('text-anchor', 'middle')

  container
    .append('text')
    .style('font-size', 14)
    .text('Cleveland Cavaliers')
    .attr('y', -radius)
    .attr('dy', -45)
    .attr('text-anchor', 'middle')
}
