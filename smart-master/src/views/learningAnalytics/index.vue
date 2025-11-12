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
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：班级情况总览 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="label blue">班级情况总览</span>
        </div>

        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <span class="section-title">学生实验表现分析</span>
          <el-input
            v-model="keyword"
            placeholder="搜索学生姓名/学号"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 学生卡片 -->
        <div class="student-cards">
          <StudentCard
            v-for="s in filteredStudents"
            :key="s.id"
            :student="s"
            @click="selectStudent(s)"
          />
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
              <el-button type="primary" size="small">详情分析</el-button>
            </div>
          </div>
        </div>

        <!-- 评估结果与建议 -->
        <div class="eval-result">
          <h4>评估结果：</h4>
          <ul>
            <li>分析维度覆盖度（{{ currentStudent.coverage }}）</li>
            <li>分析维度多样性（{{ currentStudent.diversity }}）</li>
            <li>反思能力（{{ currentStudent.reflection }}）</li>
          </ul>
        </div>

        <div class="suggestions">
          <h4>主要建议：</h4>
          <ul>
            <li>建议开展课堂中主题讨论与同伴互评训练</li>
            <li>分析维度的改进可参考评分标准（101分）</li>
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
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import StudentCard from './components/StudentCard.vue'
import MetricCard from './components/MetricCard.vue'
import BarChart from './components/BarChart.vue'
import RadarChart from './components/RadarChart.vue'

/* ---------- 搜索与选中 ---------- */
const keyword = ref('')
const students = ref([
  { id: 5001, name: '张明', score: 92, prep: 88, strong: '实验操作', weak: '数据分析', coverage: 89, diversity: 89, reflection: 45 },
  { id: 5002, name: '李华', score: 85, prep: 90, strong: '预习能力', weak: '报告撰写', coverage: 87, diversity: 85, reflection: 60 }
])
const currentStudent = ref(students.value[0])

const filteredStudents = computed(() =>
  students.value.filter(s =>
    s.name.includes(keyword.value) || String(s.id).includes(keyword.value)
  )
)
function selectStudent (s) {
  currentStudent.value = s
}

/* ---------- 图表数据 ---------- */
// 班级成绩分布
const barData = [
  { range: '90-100', count: 8 },
  { range: '80-89', count: 15 },
  { range: '70-79', count: 10 },
  { range: '60-69', count: 5 },
  { range: '<60', count: 2 }
]
// 班级维度雷达
const classRadarData = [
  { subject: '预习', A: 85, fullMark: 100 },
  { subject: '实验', A: 78, fullMark: 100 },
  { subject: '互动', A: 82, fullMark: 100 },
  { subject: '作业', A: 88, fullMark: 100 },
  { subject: '考试', A: 80, fullMark: 100 }
]
// 个人雷达（动态）
const studentRadarData = computed(() => [
  { subject: '知识掌握', A: currentStudent.value.score, fullMark: 100 },
  { subject: '实践能力', A: currentStudent.value.score - 5, fullMark: 100 },
  { subject: '分析能力', A: currentStudent.value.coverage, fullMark: 100 },
  { subject: '反思能力', A: currentStudent.value.reflection, fullMark: 100 },
  { subject: '交流合作', A: currentStudent.value.diversity, fullMark: 100 }
])

/* ---------- 指标卡片 ---------- */
const metrics = computed(() => [
  { label: '参与课堂', value: 50, unit: '次' },
  { label: '问题数', value: 520, unit: '' },
  { label: '笔记数', value: 342, unit: '' },
  { label: '出勤率', value: 98, unit: '%' }
])
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
.number {
  font-size: 48px;
  font-weight: 700;
  color: #409EFF;
  line-height: 1;
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
.tabs {
  display: flex;
  gap: 12px;
}
.tab {
  padding: 6px 16px;
  border-radius: 20px;
  background: #ecf5ff;
  color: #409EFF;
  font-size: 14px;
  cursor: pointer;
  transition: background .2s;
}
.tab.active,
.tab:hover {
  background: #409EFF;
  color: #fff;
}
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.panel-header {
  text-align: center;
  margin-bottom: 16px;
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
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-weight: 500;
  color: #374151;
}
.search-input {
  width: 220px;
}
.student-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart-box h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #374151;
}
.eval-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
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
  margin-bottom: 16px;
}
.eval-result h4,
.suggestions h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #374151;
}
.eval-result ul,
.suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
  line-height: 1.6;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
</style>