<template>
  <div class="metric-card">
    <div class="label">{{ label }}</div>
    <div class="value">
      <span class="num">{{ value }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' }
})
</script>

<style scoped>
.metric-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}
.label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}
.value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}
.num {
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
}
.unit {
  font-size: 12px;
  color: #9ca3af;
}
</style>