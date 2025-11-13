<script setup>
import { computed } from 'vue'

const props = defineProps({ data: Array })

// 计算连接线坐标点
const dataPoints = computed(() => {
  if (!props.data || !props.data.length) return ''
  
  const center = 100 // SVG中心点
  const radius = 80 // 数据点半径
  
  return props.data.map((d, i) => {
    const angle = (i * 360 / props.data.length - 90) * Math.PI / 180 // 转换为弧度，-90度让第一个点从顶部开始
    const distance = (d.A / d.fullMark) * radius
    const x = center + distance * Math.cos(angle)
    const y = center + distance * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
})

const chartSize = 280
const chartCenter = chartSize / 2
const labelOffset = 20
const labelRadius = chartCenter + labelOffset

// 计算外部标签位置
const getLabelPosition = (index) => {
  if (!props.data || !props.data.length) return {}
  
  const angle = (index * 360 / props.data.length - 90) * Math.PI / 180
  
  const x = chartCenter + labelRadius * Math.cos(angle)
  const y = chartCenter + labelRadius * Math.sin(angle)
  
  return {
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    scale:'1.3'
  }
}
</script>

<template>
  <div class="radar-chart">
    <!-- 轴线 -->
    <div class="axis-group" v-for="(d, i) in data" :key="d.subject">
      <div
        class="axis"
        :style="{ transform: `rotate(${i * 360 / data.length}deg)` }"
      />
    </div>
    
    <!-- 外部标签 -->
    <div class="outer-labels">
      <div 
        v-for="(d, i) in data" 
        :key="d.subject"
        class="outer-label"
        :style="getLabelPosition(i)"
      >
        {{ d.subject }}
      </div>
    </div>
    <div class="levels">
      <div class="level" v-for="l in [20, 40, 60, 80, 100]" :key="l" :style="{ width: l * 2 + 'px', height: l * 2 + 'px' }" />
    </div>
    <div class="data-area">
      <div 
        class="data-point" 
        v-for="(d, i) in data" 
        :key="d.subject"
        :style="{
          transform: `rotate(${i * 360 / data.length}deg) translateY(${d.A / d.fullMark * 80}px)`
        }"
      >
        <div class="dot" />
      </div>
      <!-- 连接线 -->
      <svg class="connection-lines" viewBox="0 0 200 200">
        <polygon 
          :points="dataPoints" 
          fill="rgba(64, 158, 255, 0.1)" 
          stroke="#409EFF" 
          stroke-width="2"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.radar-chart {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 20px auto;
}
.axis-group {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}
.axis {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 1px;
  background: #e5e7eb;
  transform-origin: 0 0;
}
.label {
  position: absolute;
  top: -25px;
  left: 0;
  font-size: 12px;
  color: #6b7280;
  transform: translateX(-50%);
  font-weight: 500;
  white-space: nowrap;
}
.value {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
.data-area {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}
.data-point {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
.dot {
  width: 8px;
  height: 8px;
  background: #409EFF;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}
.levels {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.level {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  opacity: 0.6;
}
.connection-lines {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.outer-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.outer-label {
  position: absolute;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
}
</style>