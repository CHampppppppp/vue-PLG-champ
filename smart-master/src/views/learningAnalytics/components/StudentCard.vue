<template>
  <div class="student-card" @click="$emit('click')">
    <div class="header">
      <span class="name">{{ student.name }}</span>
      <span class="id">{{ student.id }}</span>
    </div>
    <div class="metrics">
      <div class="item">
        <span class="label">总分</span>
        <span class="val">{{ student.score }}</span>
        <el-progress :percentage="student.score" color="#409EFF" :show-text="false" />
      </div>
      <div class="item">
        <span class="label">实验成绩</span>
        <span class="val">{{ student.score - 5 }}</span>
        <el-progress :percentage="student.score - 5" color="#3b82f6" :show-text="false" />
      </div>
      <div class="item">
        <span class="label">预习情况</span>
        <span class="val">{{ student.prep }}</span>
        <el-progress :percentage="student.prep" color="#10b981" :show-text="false" />
      </div>
    </div>
    <div class="footer">
      <el-button size="small">查看详情</el-button>
      <el-button size="small">历史数据</el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: { type: Object, required: true }
})
defineEmits(['click'])
</script>

<style scoped>
.student-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fff;
  cursor: pointer;
  transition: box-shadow .2s;
  flex: 1;
}
.student-card:hover {
  box-shadow: 0 4px 12px rgba(64,158,255,.12);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.name {
  font-weight: 500;
  color: #111827;
}
.id {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}
.metrics {
  margin-bottom: 8px;
}
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.label {
  font-size: 12px;
  color: #6b7280;
  width: 60px;
}
.val {
  font-weight: 600;
  color: #409EFF;
  width: 32px;
  text-align: right;
}
.footer {
  display: flex;
  gap: 8px;
}
</style>