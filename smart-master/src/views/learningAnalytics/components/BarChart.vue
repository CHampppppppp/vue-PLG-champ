<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({ data: Array })

const maxCount = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(d => d.count), 1)
})

const animated = ref(false)

function getBarColor(range) {
  if (range.includes('90') || range.includes('100')) return '#67c23a'
  if (range.includes('80')) return '#409eff'
  if (range.includes('70')) return '#e6a23c'
  if (range.includes('60')) return '#f56c6c'
  return '#909399'
}

onMounted(() => {
  setTimeout(() => {
    animated.value = true
  }, 100)
})
</script>

<template>
  <div class="bar-chart">
    <div v-for="(d, index) in data" :key="d.range" class="bar-line" :style="{ animationDelay: index * 0.1 + 's' }">
      <span class="label">{{ d.range }}</span>
      <div class="bar-wrap">
        <div 
          class="bar" 
          :class="{ animated }"
          :style="{ 
            width: animated ? (d.count / (maxCount * 1.2)) * 100 + '%' : '0%',
            '--bar-color': getBarColor(d.range)
          }" 
        />
      </div>
      <span class="count">{{ d.count }}人</span>
    </div>
  </div>
</template>

<style scoped>
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.bar-line {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeInUp 0.5s ease-out backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.label {
  width: 70px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  flex-shrink: 0;
}

.bar-wrap {
  flex: 1;
  height: 24px;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.bar {
  height: 100%;
  background: var(--bar-color, #409EFF);
  border-radius: 12px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.count {
  width: 50px;
  font-size: 13px;
  color: #111827;
  text-align: right;
  font-weight: 600;
  flex-shrink: 0;
}
</style>