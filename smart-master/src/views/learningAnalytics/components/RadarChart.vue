<script setup>
defineProps({ data: Array })
</script>

<template>
  <div class="radar-chart">
    <div class="axis-group" v-for="(d, i) in data" :key="d.subject">
      <div
        class="axis"
        :style="{ transform: `rotate(${i * 360 / data.length}deg)` }"
      >
        <span class="label">{{ d.subject }}</span>
      </div>
      <div
        class="value"
        :style="{
          transform: `rotate(${i * 360 / data.length}deg) translateY(-${d.A / d.fullMark * 80}px)`
        }"
      >
        <div class="dot" />
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
          transform: `rotate(${i * 360 / data.length}deg) translateY(-${d.A / d.fullMark * 80}px)`
        }"
      >
        <div class="dot" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.radar-chart {
  position: relative;
  width: 240px;
  height: 240px;
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
</style>