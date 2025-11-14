<template>
  <div class="learning-analytics">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="left">
        <div class="titles">
          <h1 class="zh">学情评估</h1>
          <p class="en">Assessment of Students</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">刷新数据</el-button>
        <el-button :icon="Download" @click="exportData">导出报告</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：班级情况总览 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="label blue">班级情况总览</span>
          <div class="class-stats">
            <span class="stat-item">总人数：<strong>{{ students.length }}</strong></span>
            <span class="stat-item">平均分：<strong>{{ averageScore }}</strong></span>
          </div>
        </div>

        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <span class="section-title">学生实验表现分析</span>
          <div class="toolbar-right">
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              size="small"
              style="width: 120px; margin-right: 8px;"
            >
              <el-option label="按总分" value="score" />
              <el-option label="按学号" value="id" />
              <el-option label="按姓名" value="name" />
            </el-select>
            <el-input
              v-model="keyword"
              placeholder="搜索学生姓名/学号"
              clearable
              class="search-input"
              size="small"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <!-- 学生卡片 -->
        <div class="student-cards" v-loading="loading">
          <transition-group name="fade-list" tag="div" class="cards-wrapper">
            <StudentCard
              v-for="s in sortedAndFilteredStudents"
              :key="s.id"
              :student="s"
              :selected="currentStudent.id === s.id"
              @click="selectStudent(s)"
            />
          </transition-group>
          <el-empty v-if="!loading && sortedAndFilteredStudents.length === 0" description="未找到匹配的学生" />
        </div>

        <!-- 图表区 -->
        <div class="charts">
          <div class="chart-box">
            <h3>班级成绩分布</h3>
            <BarChart :data="barData" />
          </div>
          <div class="chart-box">
            <h3>班级维度对比</h3>
            <RadarChart :data="classRadarData" />
          </div>
        </div>
      </div>

      <!-- 右侧：学生个人画像 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="label blue">学生个人画像</span>
          <div class="student-info">
            <span class="student-name">{{ currentStudent.name }}</span>
            <span class="student-id">学号：{{ currentStudent.id }}</span>
          </div>
        </div>

        <!-- 评估表 -->
        <div class="eval-table">
          <div class="row header">
            <div class="col">评估项目</div>
            <div class="col">得分</div>
            <div class="col">操作</div>
          </div>
          <div class="row">
            <div class="col">综合实验表现</div>
            <div class="col score">{{ currentStudent.score }}</div>
            <div class="col">
              <el-button type="primary" size="small" @click="showDetail">详情分析</el-button>
            </div>
          </div>
        </div>

        <!-- 评估结果与建议 -->
        <div class="eval-result">
          <h4>
            <el-icon><Document /></el-icon>
            评估结果：
          </h4>
          <ul>
            <li>
              <span class="label-text">分析维度覆盖度</span>
              <div class="progress-wrapper">
                <el-progress 
                  :percentage="currentStudent.coverage" 
                  :color="getProgressColor(currentStudent.coverage)"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
              <span class="score-text">{{ currentStudent.coverage }}分</span>
            </li>
            <li>
              <span class="label-text">分析维度多样性</span>
              <div class="progress-wrapper">
                <el-progress 
                  :percentage="currentStudent.diversity" 
                  :color="getProgressColor(currentStudent.diversity)"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
              <span class="score-text">{{ currentStudent.diversity }}分</span>
            </li>
            <li>
              <span class="label-text">反思能力</span>
              <div class="progress-wrapper">
                <el-progress 
                  :percentage="currentStudent.reflection" 
                  :color="getProgressColor(currentStudent.reflection)"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
              <span class="score-text">{{ currentStudent.reflection }}分</span>
            </li>
          </ul>
        </div>

        <div class="suggestions">
          <h4>
            <el-icon><Promotion /></el-icon>
            主要建议：
          </h4>
          <ul>
            <li v-for="(suggestion, index) in currentSuggestions" :key="index">
              <el-icon class="suggestion-icon"><Check /></el-icon>
              {{ suggestion }}
            </li>
          </ul>
        </div>

        <!-- 指标卡片 -->
        <div class="metrics">
          <MetricCard
            v-for="m in metrics"
            :key="m.label"
            :label="m.label"
            :value="m.value"
            :unit="m.unit"
            :trend="m.trend"
            :icon="m.icon"
          />
        </div>

        <!-- 个人雷达图 -->
        <div class="chart-box">
          <h3>个人能力雷达</h3>
          <RadarChart :data="studentRadarData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Refresh, Download, Document, Promotion, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StudentCard from './components/StudentCard.vue'
import MetricCard from './components/MetricCard.vue'
import BarChart from './components/BarChart.vue'
import RadarChart from './components/RadarChart.vue'

/* ---------- 状态管理 ---------- */
const loading = ref(false)
const keyword = ref('')
const sortBy = ref('score')

/* ---------- 学生数据 ---------- */
const students = ref([
  { id: 5001, name: '张明', score: 92, prep: 88, strong: '实验操作', weak: '数据分析', coverage: 89, diversity: 89, reflection: 45 },
  { id: 5002, name: '李华', score: 85, prep: 90, strong: '预习能力', weak: '报告撰写', coverage: 87, diversity: 85, reflection: 60 },
  { id: 5003, name: '王芳', score: 88, prep: 85, strong: '数据分析', weak: '实验操作', coverage: 90, diversity: 88, reflection: 70 },
  { id: 5004, name: '刘强', score: 78, prep: 82, strong: '报告撰写', weak: '预习能力', coverage: 75, diversity: 80, reflection: 55 },
  { id: 5005, name: '陈静', score: 95, prep: 92, strong: '综合能力', weak: '无', coverage: 95, diversity: 93, reflection: 85 },
  { id: 5006, name: '赵磊', score: 82, prep: 80, strong: '互动交流', weak: '反思能力', coverage: 80, diversity: 82, reflection: 50 },
  { id: 5007, name: '孙丽', score: 90, prep: 88, strong: '知识掌握', weak: '实践能力', coverage: 88, diversity: 90, reflection: 75 },
  { id: 5008, name: '周杰', score: 75, prep: 78, strong: '实验操作', weak: '数据分析', coverage: 72, diversity: 75, reflection: 40 },
  { id: 5009, name: '吴敏', score: 91, prep: 89, strong: '知识掌握', weak: '互动交流', coverage: 90, diversity: 88, reflection: 80 },
  { id: 5010, name: '郑涛', score: 83, prep: 81, strong: '实践能力', weak: '反思能力', coverage: 82, diversity: 84, reflection: 58 },
  { id: 5011, name: '钱雪', score: 87, prep: 86, strong: '数据分析', weak: '实验操作', coverage: 88, diversity: 86, reflection: 68 },
  { id: 5012, name: '孙浩', score: 79, prep: 77, strong: '报告撰写', weak: '预习能力', coverage: 76, diversity: 78, reflection: 52 },
  { id: 5013, name: '周琳', score: 93, prep: 91, strong: '综合能力', weak: '无', coverage: 92, diversity: 94, reflection: 82 },
  { id: 5014, name: '吴军', score: 81, prep: 79, strong: '互动交流', weak: '数据分析', coverage: 79, diversity: 81, reflection: 48 },
  { id: 5015, name: '郑雯', score: 89, prep: 87, strong: '知识掌握', weak: '报告撰写', coverage: 87, diversity: 89, reflection: 72 },
  { id: 5016, name: '钱磊', score: 76, prep: 74, strong: '实验操作', weak: '反思能力', coverage: 73, diversity: 76, reflection: 42 },
  { id: 5017, name: '孙佳', score: 94, prep: 92, strong: '综合能力', weak: '无', coverage: 93, diversity: 95, reflection: 88 },
  { id: 5018, name: '周伟', score: 84, prep: 82, strong: '实践能力', weak: '预习能力', coverage: 83, diversity: 85, reflection: 62 }
])

const currentStudent = ref(students.value[0])

/* ---------- 计算属性 ---------- */
const filteredStudents = computed(() =>
  students.value.filter(s =>
    s.name.includes(keyword.value) || String(s.id).includes(keyword.value)
  )
)

const sortedAndFilteredStudents = computed(() => {
  const filtered = filteredStudents.value
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy.value === 'score') return b.score - a.score
    if (sortBy.value === 'id') return a.id - b.id
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return 0
  })
  return sorted
})

const averageScore = computed(() => {
  if (students.value.length === 0) return 0
  const sum = students.value.reduce((acc, s) => acc + s.score, 0)
  return Math.round(sum / students.value.length)
})

/* ---------- 方法 ---------- */
function selectStudent(s) {
  currentStudent.value = s
}

function refreshData() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据刷新成功')
  }, 1000)
}

function exportData() {
  ElMessage.info('导出功能开发中...')
}

function showDetail() {
  ElMessage.info('详情分析功能开发中...')
}

function getProgressColor(score) {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#409eff'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

/* ---------- 图表数据 ---------- */
// 班级成绩分布
const barData = computed(() => {
  const ranges = [
    { range: '90-100', min: 90, max: 100 },
    { range: '80-89', min: 80, max: 89 },
    { range: '70-79', min: 70, max: 79 },
    { range: '60-69', min: 60, max: 69 },
    { range: '<60', min: 0, max: 59 }
  ]
  return ranges.map(r => ({
    range: r.range,
    count: students.value.filter(s => s.score >= r.min && s.score <= r.max).length
  }))
})

// 班级维度雷达
const classRadarData = computed(() => {
  const avgPrep = Math.round(students.value.reduce((acc, s) => acc + s.prep, 0) / students.value.length)
  const avgScore = averageScore.value
  const avgCoverage = Math.round(students.value.reduce((acc, s) => acc + s.coverage, 0) / students.value.length)
  const avgDiversity = Math.round(students.value.reduce((acc, s) => acc + s.diversity, 0) / students.value.length)
  const avgReflection = Math.round(students.value.reduce((acc, s) => acc + s.reflection, 0) / students.value.length)
  
  return [
    { subject: '预习', A: avgPrep, fullMark: 100 },
    { subject: '实验', A: avgScore, fullMark: 100 },
    { subject: '覆盖度', A: avgCoverage, fullMark: 100 },
    { subject: '多样性', A: avgDiversity, fullMark: 100 },
    { subject: '反思', A: avgReflection, fullMark: 100 }
  ]
})

// 个人雷达（动态）
const studentRadarData = computed(() => [
  { subject: '知识掌握', A: currentStudent.value.score, fullMark: 100 },
  { subject: '实践能力', A: currentStudent.value.score - 5, fullMark: 100 },
  { subject: '分析能力', A: currentStudent.value.coverage, fullMark: 100 },
  { subject: '反思能力', A: currentStudent.value.reflection, fullMark: 100 },
  { subject: '交流合作', A: currentStudent.value.diversity, fullMark: 100 }
])

// 建议（动态）
const currentSuggestions = computed(() => {
  const suggestions = []
  if (currentStudent.value.reflection < 60) {
    suggestions.push('建议开展课堂中主题讨论与同伴互评训练，提升反思能力')
  }
  if (currentStudent.value.coverage < 80) {
    suggestions.push('分析维度的改进可参考评分标准，提高分析维度覆盖度')
  }
  if (currentStudent.value.diversity < 80) {
    suggestions.push('建议从多个角度分析问题，提升分析维度多样性')
  }
  if (currentStudent.value.score < 80) {
    suggestions.push('建议加强基础知识学习，提高综合实验表现')
  }
  if (suggestions.length === 0) {
    suggestions.push('表现优秀，继续保持！')
  }
  return suggestions
})

/* ---------- 指标卡片 ---------- */
const metrics = computed(() => [
  { label: '参与课堂', value: Math.floor(Math.random() * 30) + 40, unit: '次', trend: 'up', icon: 'ChatDotRound' },
  { label: '问题数', value: Math.floor(Math.random() * 200) + 400, unit: '', trend: 'up', icon: 'QuestionFilled' },
  { label: '笔记数', value: Math.floor(Math.random() * 100) + 300, unit: '', trend: 'stable', icon: 'EditPen' },
  { label: '出勤率', value: Math.floor(Math.random() * 5) + 95, unit: '%', trend: 'up', icon: 'Calendar' }
])

onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.learning-analytics {
  min-height: 100vh;
  background: #f7f8fc;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.titles .zh {
  font-size: 36px;
  font-weight: 600;
  color: #409EFF;
  margin: 0;
}

.titles .en {
  font-size: 14px;
  color: #9ca3af;
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  transition: box-shadow 0.3s;
}

.panel:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.label.blue {
  display: inline-block;
  padding: 4px 12px;
  border: 1px solid #409EFF;
  color: #409EFF;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.class-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.class-stats .stat-item strong {
  color: #409EFF;
  font-weight: 600;
}

.student-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.student-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.student-id {
  font-size: 12px;
  color: #9ca3af;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.section-title {
  font-weight: 500;
  color: #374151;
  font-size: 16px;
}

.search-input {
  width: 220px;
}

.student-cards {
  margin-bottom: 20px;
  min-height: 200px;
}

.cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .charts {
    grid-template-columns: 1fr;
  }
}

.chart-box {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.chart-box h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #374151;
  font-weight: 600;
}

.eval-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.eval-table .row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
}

.eval-table .row.header {
  background: #fafafa;
  font-weight: 500;
  color: #6b7280;
}

.eval-table .score {
  font-weight: 600;
  color: #409EFF;
  font-size: 18px;
}

.eval-result,
.suggestions {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.eval-result h4,
.suggestions h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

.eval-result ul,
.suggestions ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.eval-result li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
}

.eval-result li:last-child {
  margin-bottom: 0;
}

.eval-result .label-text {
  min-width: 120px;
  font-size: 14px;
  color: #374151;
  flex-shrink: 0;
}

.progress-wrapper {
  flex: 1;
  min-width: 0;
}

.progress-wrapper :deep(.el-progress-bar__outer) {
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-wrapper :deep(.el-progress-bar__inner) {
  border-radius: 10px;
  transition: none;
}

.progress-wrapper :deep(.el-progress-bar__inner::after) {
  display: none;
}

.eval-result .score-text {
  min-width: 50px;
  text-align: right;
  font-weight: 600;
  color: #409EFF;
  flex-shrink: 0;
}

.suggestions li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  color: #4b5563;
  line-height: 1.6;
}

.suggestions li:last-child {
  margin-bottom: 0;
}

.suggestion-icon {
  color: #67c23a;
  margin-top: 2px;
  flex-shrink: 0;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.3s ease;
}

.fade-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-list-move {
  transition: transform 0.3s ease;
}
</style>