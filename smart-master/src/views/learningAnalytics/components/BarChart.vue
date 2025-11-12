<script setup>
defineProps({ data: Array })
</script>

<template>
  <div class="bar-chart">
    <div v-for="d in data" :key="d.range" class="bar-line">
      <span class="label">{{ d.range }}</span>
      <div class="bar-wrap">
        <div class="bar" :style="{ width: (d.count / 20) * 100 + '%' }" />
      </div>
      <span class="count">{{ d.count }}人</span>
    </div>
  </div>
</template>

<style scoped>
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.label {
  width: 60px;
  font-size: 12px;
  color: #6b7280;
}
.bar-wrap {
  flex: 1;
  height: 16px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: #409EFF;
  border-radius: 4px;
  transition: width .3s;
}
.count {
  width: 40px;
  font-size: 12px;
  color: #4b5563;
  text-align: right;
}
</style>