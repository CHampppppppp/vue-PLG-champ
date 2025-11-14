<template>
  <div class="metric-card">
    <div class="header">
      <div class="icon-wrapper" v-if="icon">
        <el-icon :size="20">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      <div class="label">{{ label }}</div>
    </div>
    <div class="value">
      <span class="num">{{ value }}</span>
      <span class="unit">{{ unit }}</span>
      <div class="trend" v-if="trend">
        <el-icon v-if="trend === 'up'" class="trend-up">
          <ArrowUp />
        </el-icon>
        <el-icon v-else-if="trend === 'down'" class="trend-down">
          <ArrowDown />
        </el-icon>
        <el-icon v-else class="trend-stable">
          <Minus />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  trend: { type: String, default: '' }, // 'up', 'down', 'stable'
  icon: { type: String, default: '' }
})

const iconComponent = computed(() => {
  if (!props.icon) return null
  return ElementPlusIconsVue[props.icon] || null
})
</script>

<style scoped>
.metric-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67c23a);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(64,158,255,.1);
  transform: translateY(-2px);
  border-color: #409EFF;
}

.metric-card:hover::before {
  transform: scaleX(1);
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ecf5ff, #d4e8ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  flex-shrink: 0;
}

.label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  flex: 1;
}

.value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.num {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.unit {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}

.trend {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.trend-up {
  color: #67c23a;
  animation: pulse 2s infinite;
}

.trend-down {
  color: #f56c6c;
}

.trend-stable {
  color: #909399;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>