<template>
  <div 
    class="student-card" 
    :class="{ selected }"
    @click="$emit('click')"
  >
    <div class="header">
      <div class="name-section">
        <span class="name">{{ student.name }}</span>
        <span class="id">{{ student.id }}</span>
      </div>
      <div class="score-badge" :class="getScoreClass(student.score)">
        {{ student.score }}
      </div>
    </div>
    <div class="metrics">
      <div class="item">
        <span class="label">总分</span>
        <span class="val">{{ student.score }}</span>
        <el-progress 
          :percentage="student.score" 
          :color="getProgressColor(student.score)" 
          :show-text="false"
          :stroke-width="6"
        />
      </div>
      <div class="item">
        <span class="label">实验成绩</span>
        <span class="val">{{ student.score - 5 }}</span>
        <el-progress 
          :percentage="student.score - 5" 
          color="#3b82f6" 
          :show-text="false"
          :stroke-width="6"
        />
      </div>
      <div class="item">
        <span class="label">预习情况</span>
        <span class="val">{{ student.prep }}</span>
        <el-progress 
          :percentage="student.prep" 
          color="#10b981" 
          :show-text="false"
          :stroke-width="6"
        />
      </div>
    </div>
    <div class="tags">
      <span class="tag strong">强项：{{ student.strong }}</span>
      <span class="tag weak">弱项：{{ student.weak }}</span>
    </div>
    <div class="footer">
      <el-button size="small" type="primary" plain>查看详情</el-button>
      <el-button size="small" plain>历史数据</el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})
defineEmits(['click'])

function getScoreClass(score) {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'average'
  return 'poor'
}

function getProgressColor(score) {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#409eff'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.student-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 280px;
  position: relative;
  overflow: hidden;
}

.student-card::before {
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

.student-card:hover {
  box-shadow: 0 8px 24px rgba(64,158,255,.15);
  transform: translateY(-2px);
  border-color: #409EFF;
}

.student-card:hover::before {
  transform: scaleX(1);
}

.student-card.selected {
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64,158,255,.1);
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.student-card.selected::before {
  transform: scaleX(1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.name-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.id {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.score-badge {
  font-size: 24px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 8px;
  min-width: 60px;
  text-align: center;
}

.score-badge.excellent {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: #fff;
}

.score-badge.good {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
}

.score-badge.average {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
  color: #fff;
}

.score-badge.poor {
  background: linear-gradient(135deg, #f56c6c, #f78989);
  color: #fff;
}

.metrics {
  margin-bottom: 12px;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  color: #6b7280;
  width: 70px;
  flex-shrink: 0;
}

.val {
  font-weight: 600;
  color: #409EFF;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.tag.strong {
  background: #ecf5ff;
  color: #409eff;
}

.tag.weak {
  background: #fef0f0;
  color: #f56c6c;
}

.footer {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>