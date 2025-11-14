<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({ data: Array })

const animated = ref(false)

// 计算连接线坐标点
const dataPoints = computed(() => {
  if (!props.data || !props.data.length) return ''
  
  const center = 100 // SVG中心点
  const radius = 80 // 数据点半径
  
  return props.data.map((d, i) => {
    const angle = (i * 360 / props.data.length - 90) * Math.PI / 180 // 转换为弧度，-90度让第一个点从顶部开始
    const distance = animated.value ? (d.A / d.fullMark) * radius : 0
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

// 计算数据点位置（用于动画）
const getDataPointStyle = (d, i) => {
  const angle = (i * 360 / props.data.length - 90) * Math.PI / 180
  const distance = animated.value ? (d.A / d.fullMark) * 80 : 0
  return {
    transform: `rotate(${i * 360 / props.data.length}deg) translateY(${distance}px)`,
    transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

onMounted(() => {
  setTimeout(() => {
    animated.value = true
  }, 200)
})
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
        :style="getDataPointStyle(d, i)"
      >
        <!-- <div class="dot" /> -->
        <div class="value-label">{{ d.A }}</div>
      </div>
      <!-- 连接线 -->
      <svg class="connection-lines" viewBox="0 0 200 200">
        <polygon 
          :points="dataPoints" 
          fill="rgba(64, 158, 255, 0.15)" 
          stroke="#409EFF" 
          stroke-width="2.5"
          :class="{ animated }"
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
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.axis {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  transform-origin: 0 0;
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
  width: 10px;
  height: 10px;
  background: #409EFF;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2), 0 2px 4px rgba(64, 158, 255, 0.3);
  position: relative;
  z-index: 2;
}

.value-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #409EFF;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.data-point:hover .value-label {
  opacity: 1;
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
  opacity: 0.4;
  animation: fadeIn 0.8s ease-out backwards;
}

.level:nth-child(1) { animation-delay: 0.1s; }
.level:nth-child(2) { animation-delay: 0.2s; }
.level:nth-child(3) { animation-delay: 0.3s; }
.level:nth-child(4) { animation-delay: 0.4s; }
.level:nth-child(5) { animation-delay: 0.5s; }

.connection-lines {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.connection-lines polygon {
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
}

.connection-lines polygon.animated {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.2));
  }
  50% {
    opacity: 0.8;
    filter: drop-shadow(0 2px 8px rgba(64, 158, 255, 0.4));
  }
}

.outer-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  animation: fadeIn 0.6s ease-out 0.3s backwards;
}

.outer-label {
  position: absolute;
  font-size: 12px;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.outer-label:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  border-color: #409EFF;
  color: #409EFF;
}
</style>