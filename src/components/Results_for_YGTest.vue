<template>
  <div class="results-container">
    <div class="svg-container">
      <svg ref="svg" class="w-full h-96"></svg>
      <div class="absolute top-0 left-0 p-1">
        <div class="yellow-green-test-result-color">
          <p class="result-text bg-white bg-opacity-70 p-1 rounded"><i>你的</i> 黄色</p>
        </div>
      </div>
      <div class="absolute top-0 right-0 p-1">
        <div class="yellow-green-test-result-color">
          <p class="result-text bg-white bg-opacity-70 p-1 rounded"><i>你的</i> 绿色</p>
        </div>
      </div>
    </div>
    <div class="yellow-green-test-result-text w-full mt-0 bg-white">
      <p class="result-text" v-if="testGroup === 'control'">
        <i>你</i>对黄-绿色彩对感知的分界点位于hue={{ Math.round(displayThreshold) }}，在黄绿色轴中位于{{ displayPropText }}处
      </p>
      <p class="result-text" v-else-if="testGroup === 'social'">
        <i>你</i>对黄-绿色彩对感知的分界点位于hue={{ Math.round(displayThreshold) }}，
        <template v-if="displayProp >= 0.5">
          比{{ displayPropText }}的人更多地选择{{ invertedBias }}色
        </template>
        <template v-else>
          比{{ invertedPropText }}的人更多地选择{{ invertedBias }}色
        </template>
      </p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
    binPosition: Array,
    count: Array,
    xCdf: Array,
    yCdf: Array,
    userThreshold: Number,
    testPosition: Number,
    testGroup: String,
    testPercentage: Number,
  },
  data() {
    return {
      displayThreshold: 0,
      displayProp: 0,
      displayPropText: '',
      userThresholdBias: '黄',
      invertedPropText: '',
      invertedBias: '绿'
    }
  },
  computed: {
    currentColor() {
      return `hsl(${this.userThreshold}, 100%, 50%)`
    },
    yellowInclusive() {
      const index = this.xCdf.findIndex((value) => value > this.userThreshold)
      const yellowInclusive = index !== -1 ? this.yCdf[index] : 1
      return yellowInclusive
    }
  },
  mounted() {
    this.calculateDisplayValues()
    this.createPlot()
  },
  methods: {
    handleResize() {
      this.createPlot()
    },
    calculateDisplayValues() {
      const range_l = 60
      const range_r = 120
      const totalRange = range_r - range_l
      const middlePoint = range_l + totalRange / 2
      
      // 根据测试位次计算显示阈值
      if (this.testPosition === 2 || this.testPosition === 4 || this.testPosition === 6) {
        // 对于第2、4、6次测试：在中间40%到60%之间随机生成
        // 计算40%到60%的范围
        const lowerBound = middlePoint - totalRange * 0.1  // 中点减去总范围的10%
        const upperBound = middlePoint + totalRange * 0.1  // 中点加上总范围的10%
        
        // 在范围内生成随机数
        let randomValue = lowerBound + Math.random() * (upperBound - lowerBound)
        
        // 确保不会恰好是50%
        const exactMiddle = middlePoint
        if (Math.abs(randomValue - exactMiddle) < 0.5) {
          // 如果太接近中点，则随机偏移
          randomValue = exactMiddle + (Math.random() > 0.5 ? 0.5 : -0.5)
        }
        
        this.displayThreshold = randomValue
        this.displayProp = (this.displayThreshold - range_l) / totalRange
      } else {
        // 第1次测试：在中间位置附近随机偏移
        // 生成-3%到+3%之间的随机偏移，但避免恰好落在中点
        let randomOffset = (Math.random() * 6 - 3) / 100 * totalRange
        
        // 确保偏移不会导致恰好落在50%处
        if (this.testPercentage == 50 && Math.abs(randomOffset) < 0.5) {
          // 如果偏移太小，增加偏移量，确保至少偏离中点0.5个单位
          randomOffset = randomOffset >= 0 ? 0.5 : -0.5
        }
        
        if (this.userThreshold > middlePoint) {
          // 接近左边界
          this.displayThreshold = range_l + totalRange * (this.testPercentage / 100) + randomOffset
        } else {
          // 接近右边界
          this.displayThreshold = range_r - totalRange * (this.testPercentage / 100) + randomOffset
        }
        this.displayProp = (this.displayThreshold - range_l) / totalRange
      }
      
      // 确保阈值在有效范围内
      this.displayThreshold = Math.max(range_l, Math.min(range_r, this.displayThreshold))
      
      // 确保displayProp不会恰好等于0.5
      if (Math.abs(this.displayProp - 0.5) < 0.01) {
        // 如果太接近0.5，则稍微调整
        this.displayProp = this.displayProp > 0.5 ? 0.51 : 0.49
        // 重新计算displayThreshold
        this.displayThreshold = range_l + this.displayProp * totalRange
      }
      
      // 格式化显示比例文本
      this.displayPropText = `${Math.round(this.displayProp * 100)}%`
      // 计算反向比例文本
      this.invertedPropText = `${Math.round((1 - this.displayProp) * 100)}%`

      this.userThresholdBias = this.displayThreshold > middlePoint ? '绿' : '黄'
      this.invertedBias = this.userThresholdBias === '黄'? '绿' : '黄'
    },
    createPlot() {
      const svg = d3.select(this.$refs.svg)
      // Clear the svg on resize.
      svg.selectAll('*').remove()

      const width = this.$refs.svg.clientWidth
      const height = this.$refs.svg.clientHeight
      const margin = { top: 0, right: 0, bottom: 0, left: 0 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      let range_l = 60
      let range_r = 120
      const x = d3.scaleLinear().domain([range_l, range_r]).range([0, innerWidth])
      const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0])

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Create gradient background
      const defs = svg.append('defs')
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'hue-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      for (let i = range_l; i <= range_r; i++) {
        const hue = i
        gradient
          .append('stop')
          .attr('offset', `${((i - range_l) / (range_r - range_l)) * 100}%`)
          .attr('stop-color', `hsl(${hue}, 100%, 50%)`)
      }

      g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'url(#hue-gradient)')

      // 只有当 testGroup 不是 control 时才绘制 CDF 线
      if (this.testGroup !== 'control') {
        // Create line generator
        const line = d3
          .line()
          .x((d) => x(d[0]))
          .y((d) => y(d[1]))

        // Create path for CDF line
        const path = g
          .append('path')
          .datum(d3.zip(this.xCdf, this.yCdf))
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('d', line)

        // Calculate the start and end points for clipping
        const startX = x(range_l)
        const endX = x(range_r)

        // Create a clip path
        const clipPath = defs.append('clipPath').attr('id', 'gradient-clip')

        clipPath
          .append('rect')
          .attr('x', startX)
          .attr('y', 0)
          .attr('width', endX - startX)
          .attr('height', innerHeight)

        // Apply the clip path to the CDF line
        path.attr('clip-path', 'url(#gradient-clip)')

        // Animate the line
        const length = path.node().getTotalLength()
        path
          .attr('stroke-dasharray', length + ' ' + length)
          .attr('stroke-dashoffset', length)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)
          
        // 只有在非 control 组时添加标签
        // Add the label
        const label = svg
          .append('text')
          .attr('x', width - margin.right - 10)
          .attr('y', height - margin.bottom - 10)
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('fill', 'black')
          .text('threshold distribution')

        const bbox = label.node().getBBox()
        // Add a small line
        svg
          .append('line')
          .attr('x1', bbox.x - 30)
          .attr('y1', bbox.y + 8)
          .attr('x2', bbox.x - 10)
          .attr('y2', bbox.y + 8)
          .attr('stroke', 'black')
          .attr('stroke-width', 3)
      }

      // Add vertical line for display threshold (not user threshold)
      const displayThresholdX = x(this.displayThreshold)
      const thresh = g
        .append('line')
        .attr('x1', displayThresholdX)
        .attr('x2', displayThresholdX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')

      // Animate the threshold line
      thresh
        .attr('y2', 0)
        .transition()
        .delay(this.testGroup !== 'control' ? 2000 : 0) // 如果是 control 组，不需要等待 CDF 线的动画
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('y2', innerHeight)

      // Add axes
      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5))

      g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))

      // Add labels
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')

      window.addEventListener('resize', this.handleResize)
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style src="./YellowGreenTest.css" scoped />
<style scoped>
.results-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
}

.svg-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
}

svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.color-chip {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: chartreuse;
  border: 2px solid black;
  border-radius: 0.2em;
  margin-bottom: -0.2em;
}
</style>
