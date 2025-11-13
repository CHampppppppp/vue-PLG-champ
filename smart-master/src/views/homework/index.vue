<template>
  <div class="homework-container">
    <div class="page-header">
      <h1 class="page-title">作业管理</h1>
      <div class="header-actions">
        <el-button type="primary" icon="Plus">创建作业</el-button>
        <el-button icon="Upload">导入试题</el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-input placeholder="搜索作业" prefix-icon="Search" clearable class="search-input" />
      <el-select placeholder="学科" style="width: 120px; margin-left: 10px;">
        <el-option label="全部" value="all" />
        <el-option label="语文" value="chinese" />
        <el-option label="数学" value="math" />
        <el-option label="英语" value="english" />
        <el-option label="物理" value="physics" />
      </el-select>
      <el-select placeholder="状态" style="width: 120px; margin-left: 10px;">
        <el-option label="全部" value="all" />
        <el-option label="未发布" value="draft" />
        <el-option label="已发布" value="published" />
        <el-option label="已截止" value="closed" />
      </el-select>
    </div>
    
    <AppCard class="content-section" elevated>
      <el-tabs class="homework-tabs">
        <el-tab-pane label="作业列表">
          <div class="homework-table-wrapper">
            <el-skeleton v-if="homeworksLoading" animated :rows="5" />
            <template v-else>
              <el-table v-if="homeworks.length > 0" :data="homeworks" style="width: 100%">
                <el-table-column prop="title" label="作业标题" min-width="200" />
                <el-table-column prop="createTime" label="创建时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="lastModified" label="最后修改时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.lastModified) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                  <template #default="scope">
                    <el-button size="small" type="primary" @click="viewHomework(scope.row)">查看</el-button>
                    <el-button size="small" @click="editHomework(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="confirmDeleteHomework(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="empty-placeholder" v-if="homeworks.length === 0">
                <img src="/logo.svg" alt="暂无作业" class="empty-icon" />
                <p class="empty-text">暂无作业，请创建或通过AI助教生成作业</p>
                <el-button type="primary" icon="Plus" @click="goToAiAssistant">使用AI助教生成</el-button>
              </div>
            </template>
          </div>
        </el-tab-pane>
        <el-tab-pane label="AI作业助手">
          <div class="ai-homework-container">
            <div class="ai-sidebar">
              <h3 class="ai-sidebar-title">AI作业类型</h3>
              <div class="ai-type-list">
                <div class="ai-type-item active">
                  <div class="ai-type-icon">
                    <i class="el-icon-tickets"></i>
                  </div>
                  <div class="ai-type-info">
                    <div class="ai-type-name">自动出题</div>
                    <div class="ai-type-desc">根据知识点自动生成题目</div>
                  </div>
                </div>
                <div class="ai-type-item">
                  <div class="ai-type-icon">
                    <i class="el-icon-s-management"></i>
                  </div>
                  <div class="ai-type-info">
                    <div class="ai-type-name">能力测评</div>
                    <div class="ai-type-desc">针对特定能力维度评测</div>
                  </div>
                </div>
                <div class="ai-type-item">
                  <div class="ai-type-icon">
                    <i class="el-icon-reading"></i>
                  </div>
                  <div class="ai-type-info">
                    <div class="ai-type-name">同步练习</div>
                    <div class="ai-type-desc">与教材内容同步的练习</div>
                  </div>
                </div>
                <div class="ai-type-item">
                  <div class="ai-type-icon">
                    <i class="el-icon-medal"></i>
                  </div>
                  <div class="ai-type-info">
                    <div class="ai-type-name">综合测试</div>
                    <div class="ai-type-desc">多知识点综合测试</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="ai-content">
              <div class="ai-form" v-loading="aiGenerating" element-loading-text="AI 正在为您生成作业...">
                <h3 class="ai-form-title">自动出题</h3>
                <el-form label-position="top" :model="aiForm" class="ai-config-form">
                  <el-form-item label="学科" required>
                    <el-select
                      v-model="aiForm.subject"
                      placeholder="请选择学科"
                      style="width: 100%;"
                      :disabled="aiGenerating"
                    >
                      <el-option
                        v-for="option in subjectOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="年级" required>
                    <el-select
                      v-model="aiForm.grade"
                      placeholder="请选择年级"
                      style="width: 100%;"
                      :disabled="aiGenerating"
                    >
                      <el-option
                        v-for="option in gradeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="知识点">
                    <el-select
                      v-model="aiForm.knowledgePoints"
                      multiple
                      placeholder="请选择知识点"
                      style="width: 100%;"
                      collapse-tags
                      collapse-tags-tooltip
                      :disabled="aiGenerating"
                    >
                      <el-option
                        v-for="point in availableKnowledgePoints"
                        :key="point"
                        :label="point"
                        :value="point"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="题目类型" required>
                    <el-checkbox-group v-model="aiForm.questionTypes" :disabled="aiGenerating">
                      <el-checkbox
                        v-for="type in questionTypeOptions"
                        :label="type.value"
                        :key="type.value"
                      >
                        {{ type.label }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item label="题目难度">
                    <el-slider
                      v-model="aiForm.difficulty"
                      :marks="difficultyMarks"
                      :step="1"
                      :min="1"
                      :max="5"
                      show-stops
                      :disabled="aiGenerating"
                    />
                  </el-form-item>
                  <el-form-item label="题目数量">
                    <el-input-number
                      v-model="aiForm.quantity"
                      :min="5"
                      :max="50"
                      :step="5"
                      :disabled="aiGenerating"
                    />
                  </el-form-item>
                  <el-form-item label="附加要求">
                    <el-input
                      v-model="aiForm.extraRequirement"
                      type="textarea"
                      :rows="3"
                      placeholder="示例：包含思维拓展题；突出函数与几何的综合应用；输出包含参考答案"
                      :disabled="aiGenerating"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      icon="Connection"
                      style="width: 100%"
                      :loading="aiGenerating"
                      :disabled="!canGenerateHomework"
                      @click="generateHomeworkByAI"
                    >
                      {{ aiGenerating ? '生成中...' : '开始生成作业' }}
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              <div class="ai-result-panel">
                <div class="ai-result-header">
                  <h3>AI生成结果</h3>
                  <div class="ai-result-actions" v-if="aiGeneratedHomework">
                    <el-button size="small" type="primary" plain @click="saveGeneratedHomework">
                      保存到作业库
                    </el-button>
                    <el-button size="small" @click="copyGeneratedHomework">
                      复制内容
                    </el-button>
                  </div>
                </div>
                <div
                  class="ai-result-content"
                  v-if="aiGeneratedHomework"
                  v-html="renderedAiHomework"
                ></div>
                <el-skeleton v-else-if="aiGenerating" animated :rows="6" />
                <el-empty v-else description="生成的作业内容将展示在这里" />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="作业审批">
          <div class="grading-container">
            <div class="grading-form-panel">
              <h3 class="section-title">智能审批设置</h3>
              <p class="section-desc">选择作业并输入学生作答，AI将提供逐题点评与得分建议。</p>
              <el-form label-position="top" class="grading-form">
                <el-form-item label="选择作业">
                  <el-select
                    v-model="gradingForm.homeworkId"
                    placeholder="请选择待审批的作业"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="item in homeworks"
                      :key="item.id"
                      :label="item.title"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="学生姓名">
                  <el-input
                    v-model="gradingForm.studentName"
                    placeholder="请输入学生姓名（可选）"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="学生作答">
                  <el-input
                    v-model="gradingForm.studentAnswers"
                    type="textarea"
                    :rows="8"
                    placeholder="请粘贴学生的作答内容，可保留题号格式"
                  />
                </el-form-item>
                <el-form-item class="grading-actions">
                  <el-button
                    type="primary"
                    :loading="gradingLoading"
                    :disabled="!canSubmitGrading"
                    @click="submitForReview"
                  >
                    {{ gradingLoading ? '正在审批...' : '开始审批' }}
                  </el-button>
                  <el-button link @click="resetGradingForm">清空</el-button>
                </el-form-item>
                <el-alert
                  v-if="gradingError"
                  type="error"
                  :title="gradingError"
                  show-icon
                  class="grading-error"
                />
              </el-form>

              <div
                v-if="selectedHomeworkForReview"
                class="selected-homework-preview"
              >
                <div class="preview-header">
                  <h4>作业内容概览</h4>
                  <el-tag size="small" type="info">{{ selectedHomeworkForReview.title }}</el-tag>
                </div>
                <div
                  class="preview-body"
                  v-html="renderedSelectedHomework"
                ></div>
              </div>
              <div v-else class="selected-homework-placeholder">
                <p>请选择作业以查看题目内容。</p>
              </div>
            </div>

            <div class="grading-result-panel">
              <template v-if="gradingResult">
                <div class="grading-summary">
                  <div class="summary-score">
                    <div class="score-value">
                      {{ gradingResult.score?.obtained ?? 0 }}
                      <span class="score-total">/{{ gradingResult.score?.total ?? 100 }}</span>
                    </div>
                    <div class="score-label">AI评估得分</div>
                  </div>
                  <p class="summary-text">{{ gradingResult.summary }}</p>
                </div>

                <div v-if="gradingResult.questions?.length" class="question-list">
                  <div
                    v-for="question in gradingResult.questions"
                    :key="question.index"
                    class="question-card"
                    :class="{ incorrect: question.isCorrect === false }"
                  >
                    <div class="question-header">
                      <div class="question-index">第 {{ question.index }} 题</div>
                      <el-tag
                        :type="question.isCorrect ? 'success' : 'danger'"
                        size="small"
                      >
                        {{ question.isCorrect ? '正确' : '错误' }}
                      </el-tag>
                    </div>
                    <div class="question-content">
                      <p class="question-label">题目</p>
                      <p class="question-text">{{ question.question }}</p>
                      <p class="answer-label">学生答案</p>
                      <p
                        class="answer-text"
                        :class="{ 'answer-incorrect': question.isCorrect === false }"
                      >
                        {{ question.studentAnswer || '未作答' }}
                      </p>
                      <p class="answer-label">参考答案</p>
                      <p class="correct-answer">{{ question.correctAnswer || '未提供' }}</p>
                      <p class="feedback-label">点评</p>
                      <p class="feedback-text">{{ question.feedback || '暂无点评' }}</p>
                    </div>
                  </div>
                </div>
                <div v-else class="no-question-result">
                  <el-empty description="暂无逐题数据，请确认AI返回格式是否完整" />
                </div>
              </template>
              <template v-else>
                <div class="grading-placeholder">
                  <img src="/logo.svg" alt="等待审批" class="empty-icon" />
                  <p class="placeholder-title">等待审批</p>
                  <p class="placeholder-desc">提交审批后，这里将展示AI的得分、逐题分析与改进建议。</p>
                </div>
              </template>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </AppCard>
    
    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewTitle" width="80%" top="20px" :append-to-body="true">
      <div class="preview-content" v-html="renderedPreviewContent"></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportPDF">导出PDF</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑作业" width="80%" top="5vh">
      <el-form>
        <el-form-item>
          <el-input
            v-model="editedContent"
            type="textarea"
            :rows="20"
            placeholder="请编辑作业内容..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '@/components/common/AppCard.vue'
import { getHomeworks, deleteHomework, updateHomework, saveHomework } from '@/utils/storage'
import { ElMessageBox, ElMessage } from 'element-plus'
import { marked } from 'marked'
import { reviewHomework, generateContent } from '@/api/deepseek'

// 配置marked渲染器
const renderer = new marked.Renderer()
// 自定义代码块渲染
renderer.code = (code, language) => {
  return `<pre class="language-${language || 'text'}"><code>${code}</code></pre>`
}

// 配置marked选项
marked.setOptions({
  renderer: renderer,
  gfm: true, // 启用GitHub风格Markdown
  breaks: true, // 允许回车换行
  pedantic: false, // 尽可能地兼容markdown.pl的晦涩部分
  sanitize: false, // 对输出进行过滤（清理），将忽略任何已经输入的html代码
  smartLists: true, // 使用比原生markdown更时髦的列表
  smartypants: false, // 使用更为时髦的标点
  xhtml: false, // 生成符合xhtml规范的标签
  highlight: function(code, lang) {
    return code // 如果需要语法高亮，可以在这里添加highlight.js等库的支持
  }
})

const router = useRouter()
const homeworks = ref([])
const homeworksLoading = ref(true)
const gradingForm = reactive({
  homeworkId: '',
  studentName: '',
  studentAnswers: ''
})
const gradingLoading = ref(false)
const gradingResult = ref(null)
const gradingError = ref('')

// 编辑对话框相关
const editDialogVisible = ref(false)
const currentHomework = ref(null)
const editedContent = ref('')

// 预览对话框相关
const previewDialogVisible = ref(false)
const previewTitle = ref('')

// AI生成相关
const subjectOptions = [
  { label: '语文', value: 'chinese' },
  { label: '数学', value: 'math' },
  { label: '英语', value: 'english' },
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '生物', value: 'biology' },
  { label: '历史', value: 'history' },
  { label: '地理', value: 'geography' },
  { label: '政治', value: 'politics' }
]
const gradeOptions = [
  { label: '一年级', value: 'grade1' },
  { label: '二年级', value: 'grade2' },
  { label: '三年级', value: 'grade3' },
  { label: '四年级', value: 'grade4' },
  { label: '五年级', value: 'grade5' },
  { label: '六年级', value: 'grade6' },
  { label: '七年级', value: 'grade7' },
  { label: '八年级', value: 'grade8' },
  { label: '九年级', value: 'grade9' },
  { label: '高一', value: 'high1' },
  { label: '高二', value: 'high2' },
  { label: '高三', value: 'high3' }
]
const questionTypeOptions = [
  { label: '选择题', value: 'choice' },
  { label: '填空题', value: 'fill_in_the_blank' },
  { label: '解答题', value: 'essay' },
  { label: '判断题', value: 'true_false' },
  { label: '应用题', value: 'application' }
]
const difficultyMarks = {
  1: '简单',
  3: '中等',
  5: '困难'
}

const subjectLabelMap = Object.fromEntries(subjectOptions.map(item => [item.value, item.label]))
const gradeLabelMap = Object.fromEntries(gradeOptions.map(item => [item.value, item.label]))
const questionTypeLabelMap = Object.fromEntries(questionTypeOptions.map(item => [item.value, item.label]))

const knowledgePointMap = {
  default: ['基础概念理解', '例题讲解', '易错点纠正', '课堂巩固'],
  chinese: ['文言文实词', '现代文阅读', '写作立意', '古诗鉴赏'],
  math: ['函数与图像', '平面几何', '数列与递推', '概率统计'],
  english: ['语法填空', '阅读理解', '完形填空', '写作表达'],
  physics: ['力学分析', '电路计算', '能量守恒', '实验设计'],
  chemistry: ['化学方程式', '氧化还原', '实验操作', '有机化学基础'],
  biology: ['细胞结构', '遗传规律', '生态系统', '生物实验'],
  history: ['朝代更替', '重大改革', '世界格局', '史料解析'],
  geography: ['地形气候', '自然资源', '人口分布', '区域认知'],
  politics: ['公民权利', '经济制度', '国际关系', '法律常识']
}

const aiForm = reactive({
  subject: '',
  grade: '',
  knowledgePoints: [],
  questionTypes: [],
  difficulty: 3,
  quantity: 10,
  extraRequirement: ''
})
const aiGenerating = ref(false)
const aiGeneratedHomework = ref('')
const aiGeneratedTitle = ref('')

const availableKnowledgePoints = computed(() => {
  if (!aiForm.subject) {
    return knowledgePointMap.default
  }
  return knowledgePointMap[aiForm.subject] || knowledgePointMap.default
})
const canGenerateHomework = computed(() => {
  return Boolean(
    aiForm.subject &&
    aiForm.grade &&
    aiForm.questionTypes.length > 0 &&
    aiForm.quantity > 0 &&
    !aiGenerating.value
  )
})

const renderedAiHomework = computed(() => {
  if (!aiGeneratedHomework.value) return ''
  try {
    return marked(aiGeneratedHomework.value)
  } catch (error) {
    console.error('渲染AI生成作业失败:', error)
    return aiGeneratedHomework.value
  }
})

watch(
  () => aiForm.subject,
  () => {
    const available = availableKnowledgePoints.value
    if (!available || available.length === 0) {
      aiForm.knowledgePoints = []
      return
    }
    aiForm.knowledgePoints = aiForm.knowledgePoints.filter(item => available.includes(item))
  }
)

const buildAiHomeworkPrompt = () => {
  const subjectLabel = subjectLabelMap[aiForm.subject] || '所选学科'
  const gradeLabel = gradeLabelMap[aiForm.grade] || '对应年级'
  const knowledgeText = aiForm.knowledgePoints.length
    ? aiForm.knowledgePoints.join('、')
    : '紧贴教材重难点进行巩固'
  const questionTypeText = aiForm.questionTypes.length
    ? aiForm.questionTypes.map(type => questionTypeLabelMap[type] || type).join('、')
    : '结合知识点灵活设计题型'
  const difficultyDescriptor = aiForm.difficulty <= 2
    ? '以基础巩固为主'
    : aiForm.difficulty >= 4
      ? '适当拔高，兼顾思维拓展'
      : '难度层次合理，兼顾不同层级学生'
  const extra = aiForm.extraRequirement ? `- 额外要求：${aiForm.extraRequirement}` : ''

  return `你是一名资深${subjectLabel}教师，需要为${gradeLabel}学生设计课堂作业。

# 生成目标
- 题目数量：${aiForm.quantity}
- 题型组合：${questionTypeText}
- 核心知识点：${knowledgeText}
- 难度控制：${difficultyDescriptor}（难度系数 ${aiForm.difficulty}/5）
${extra}

# 输出格式
1. 请使用 Markdown 格式分块输出。
2. 先列出“作业概览”，总结本套题目的目标与建议用时。
3. 按题型或知识点分组，每道题提供清晰的题干。
4. 每道题后需给出【参考答案】和【解析提示】，解析要突出解题思路。
5. 若有应用题或综合题，请强调与知识点的联系以及常见易错点。
6. 最后给出“课后巩固建议”，帮助教师安排延伸任务。

请严格遵循以上要求，输出高质量的教学作业。`
}

const generateHomeworkByAI = async () => {
  if (!canGenerateHomework.value) {
    ElMessage.warning('请完善生成条件后再试')
    return
  }

  aiGenerating.value = true
  aiGeneratedHomework.value = ''

  try {
    const prompt = buildAiHomeworkPrompt()
    const content = await generateContent(prompt, 'homework')
    if (!content || !content.trim()) {
      throw new Error('AI 未返回有效内容')
    }
    aiGeneratedHomework.value = content.trim()

    const subjectLabel = subjectLabelMap[aiForm.subject] || ''
    const gradeLabel = gradeLabelMap[aiForm.grade] || ''
    const knowledgeSuffix = aiForm.knowledgePoints.length
      ? `${aiForm.knowledgePoints[0]}等`
      : '综合练习'
    aiGeneratedTitle.value = `${gradeLabel}${subjectLabel}${knowledgeSuffix}AI作业`

    ElMessage.success('作业生成完成，已根据配置生成详细内容')
  } catch (error) {
    console.error('生成AI作业失败:', error)
    ElMessage.error(error.message || '生成作业失败，请稍后再试')
  } finally {
    aiGenerating.value = false
  }
}

const saveGeneratedHomework = () => {
  if (!aiGeneratedHomework.value || !aiGeneratedHomework.value.trim()) {
    ElMessage.warning('暂无生成内容可以保存')
    return
  }

  try {
    const title = aiGeneratedTitle.value || `AI生成作业-${new Date().toLocaleString()}`
    saveHomework(title, aiGeneratedHomework.value)
    ElMessage.success('已保存到作业库')
    fetchHomeworks()
  } catch (error) {
    console.error('保存AI作业失败:', error)
    ElMessage.error(error.message || '保存失败，请稍后再试')
  }
}

const copyGeneratedHomework = async () => {
  if (!aiGeneratedHomework.value || !aiGeneratedHomework.value.trim()) {
    ElMessage.warning('暂无生成内容可以复制')
    return
  }

  try {
    await navigator.clipboard.writeText(aiGeneratedHomework.value)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    console.warn('Clipboard API 不可用，尝试回退方案', error)
    try {
      const textarea = document.createElement('textarea')
      textarea.value = aiGeneratedHomework.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      ElMessage.success('内容已复制到剪贴板')
    } catch (fallbackError) {
      console.error('复制失败:', fallbackError)
      ElMessage.error('复制失败，请手动复制内容')
    }
  }
}

// 跳转到AI助教页面
const goToAiAssistant = () => {
  router.push('/home/ai-comparison')
}

// 初始化
onMounted(() => {
  // 确保localStorage已初始化
  if (!localStorage.getItem('homeworks')) {
    localStorage.setItem('homeworks', JSON.stringify([]));
  }
  
  // 获取作业列表
  fetchHomeworks()
})

const fetchHomeworks = () => {
  homeworksLoading.value = true
  try {
    // 从localStorage获取最新的作业列表
    const rawData = localStorage.getItem('homeworks')
    const parsedData = rawData ? JSON.parse(rawData) : []

    if (parsedData && parsedData.length > 0) {
      parsedData.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
    }

    homeworks.value = parsedData
    console.log('获取到作业数据:', parsedData.length, '条')
  } catch (error) {
    console.error('获取作业数据失败:', error)
    ElMessage.error('获取作业列表失败')
    homeworks.value = []
  } finally {
    setTimeout(() => {
      homeworksLoading.value = false
    }, 180)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const viewHomework = (homework) => {
  currentHomework.value = homework
  previewTitle.value = homework.title
  previewDialogVisible.value = true
}

const editHomework = (homework) => {
  currentHomework.value = homework
  editedContent.value = homework.content
  editDialogVisible.value = true
}

const saveEdit = () => {
  if (!currentHomework.value || !editedContent.value.trim()) {
    return
  }

  try {
    updateHomework(currentHomework.value.id, {
      content: editedContent.value,
      lastModified: new Date().toISOString()
    })

    ElMessage.success('作业更新成功')
    fetchHomeworks()
    editDialogVisible.value = false
  } catch (error) {
    ElMessage.error(`更新失败: ${error.message}`)
  }
}

const confirmDeleteHomework = (homework) => {
  ElMessageBox.confirm(`确定要删除作业 "${homework.title}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteHomework(homework.id)
    ElMessage.success('作业已删除')
    fetchHomeworks()
  }).catch(() => {})
}

const exportPDF = () => {
  if (!currentHomework.value) return

  const element = document.querySelector('.preview-content')
  if (!element) return

  ElMessage.info('正在生成PDF，请稍候...')

  try {
    const opt = {
      margin: 10,
      filename: `${currentHomework.value.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        putOnlyUsedFonts: true
      }
    }

    import('html2pdf.js').then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default || html2pdfModule

      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          ElMessage.success('PDF导出成功！')
        })
        .catch(error => {
          console.error('PDF生成错误:', error)
          ElMessage.error(`PDF导出失败: ${error.message}`)
        })
    }).catch(error => {
      console.error('加载html2pdf错误:', error)
      ElMessage.error('PDF库加载失败，请稍后再试')
    })
  } catch (error) {
    console.error('PDF导出初始化错误:', error)
    ElMessage.error(`PDF导出失败: ${error.message}`)
  }
}

const renderedPreviewContent = computed(() => {
  if (!currentHomework.value) return ''
  return marked(currentHomework.value.content)
})

const selectedHomeworkForReview = computed(() => {
  if (!gradingForm.homeworkId) return null
  return homeworks.value.find((item) => item.id === gradingForm.homeworkId) || null
})

const renderedSelectedHomework = computed(() => {
  if (!selectedHomeworkForReview.value) return ''
  return marked(selectedHomeworkForReview.value.content || '')
})

const canSubmitGrading = computed(() => {
  return Boolean(gradingForm.homeworkId && gradingForm.studentAnswers.trim() && !gradingLoading.value)
})

const resetGradingState = () => {
  gradingResult.value = null
  gradingError.value = ''
}

const resetGradingForm = () => {
  gradingForm.studentAnswers = ''
  gradingForm.studentName = ''
  resetGradingState()
}

const submitForReview = async () => {
  if (!gradingForm.homeworkId) {
    ElMessage.warning('请选择需要审批的作业')
    return
  }

  if (!gradingForm.studentAnswers.trim()) {
    ElMessage.warning('请填写学生作答内容')
    return
  }

  const selectedHomework = selectedHomeworkForReview.value
  if (!selectedHomework) {
    ElMessage.error('作业不存在，请重新选择')
    return
  }

  gradingLoading.value = true
  gradingError.value = ''

  try {
    const result = await reviewHomework({
      homeworkTitle: selectedHomework.title,
      homeworkContent: selectedHomework.content,
      studentName: gradingForm.studentName,
      studentAnswers: gradingForm.studentAnswers
    })

    gradingResult.value = normalizeGradingResult(result)
    ElMessage.success('审批完成')
  } catch (error) {
    gradingError.value = error.message || '审批失败，请稍后再试'
    gradingResult.value = null
  } finally {
    gradingLoading.value = false
  }
}

const normalizeGradingResult = (result) => {
  if (!result || typeof result !== 'object') {
    return null
  }

  const normalized = {
    score: {
      obtained: result.score?.obtained || 0,
      total: result.score?.total || 100
    },
    summary: result.summary || '',
    questions: []
  }

  if (result.questions && Array.isArray(result.questions)) {
    normalized.questions = result.questions.map((q, index) => ({
      index: index + 1,
      question: q.question || '',
      studentAnswer: q.student_answer || '',
      correctAnswer: q.correct_answer || '',
      feedback: q.feedback || '',
      isCorrect: q.is_correct === true,
      isIncorrect: q.is_correct === false
    }))
  }

  return normalized
}
</script>

<style scoped>
.homework-container {
  padding: 20px;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 500px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.homework-tabs {
  height: 100%;
}

.homework-table-wrapper {
  margin-bottom: 20px;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  opacity: 0.5;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin-bottom: 20px;
}

/* AI作业助手样式 */
.ai-homework-container {
  display: flex;
  min-height: 520px;
  height: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.ai-sidebar {
  width: 250px;
  background-color: #f5f7fa;
  border-right: 1px solid #ebeef5;
  padding: 20px 0;
  overflow-y: auto;
}

.ai-sidebar-title {
  font-size: 16px;
  color: #606266;
  padding: 0 20px;
  margin-top: 0;
  margin-bottom: 15px;
}

.ai-type-list {
  display: flex;
  flex-direction: column;
}

.ai-type-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.ai-type-item:hover {
  background-color: #ecf5ff;
}

.ai-type-item.active {
  background-color: #ecf5ff;
  border-right: 3px solid #409eff;
}

.ai-type-icon {
  font-size: 24px;
  color: #7e57c2;
  margin-right: 12px;
  opacity: 0.8;
}

.ai-type-name {
  font-size: 15px;
  color: #303133;
  margin-bottom: 3px;
}

.ai-type-desc {
  font-size: 12px;
  color: #909399;
}

.ai-content {
  flex: 1;
  padding: 20px;
  display: flex;
  gap: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

.ai-form {
  flex: 0 0 360px;
  background: linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%);
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.08);
  display: flex;
  flex-direction: column;
}

.ai-form-title {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
  font-weight: 600;
}

.ai-config-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grading-container {
  display: flex;
  gap: 20px;
  min-height: 480px;
}

.grading-form-panel {
  flex: 0 0 360px;
  background: linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%);
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.08);
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.section-desc {
  margin-top: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.grading-form {
  flex: none;
}

.grading-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.grading-error {
  margin-top: 8px;
}

.selected-homework-preview {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  max-height: 260px;
  overflow-y: auto;
}

.selected-homework-placeholder {
  margin-top: 24px;
  padding: 16px;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  background: rgba(248, 250, 252, 0.8);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.preview-header h4 {
  margin: 0;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.preview-body {
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
}

.preview-body :deep(p) {
  margin: 0 0 6px 0;
}

.grading-result-panel {
  flex: 1;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-result-panel {
  flex: 1;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 14px rgba(148, 163, 184, 0.12);
}

.ai-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.ai-result-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.ai-result-actions {
  display: flex;
  gap: 10px;
}

.ai-result-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  line-height: 1.7;
  color: #374151;
}

.ai-result-content :deep(h2),
.ai-result-content :deep(h3) {
  color: #1f2937;
  font-weight: 600;
  margin: 16px 0 8px;
}

.ai-result-content :deep(p) {
  margin: 8px 0;
}

.ai-result-content :deep(li) {
  margin-bottom: 6px;
}

.grading-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 20px;
}

.summary-score {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #2563eb;
  line-height: 1;
}

.score-total {
  font-size: 16px;
  color: #94a3b8;
  margin-left: 4px;
}

.score-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 6px;
}

.summary-text {
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}

.question-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 6px;
}

.question-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

.question-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.1);
}

.question-card.incorrect {
  border-color: #fbc4c4;
  background: #fff5f5;
  box-shadow: 0 6px 18px rgba(248, 113, 113, 0.12);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.question-index {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.question-content p {
  margin: 0 0 6px 0;
}

.question-label,
.answer-label,
.feedback-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.question-text,
.answer-text,
.correct-answer,
.feedback-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-line;
}

.answer-text {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.08);
}

.answer-incorrect {
  color: #dc2626;
  background: rgba(248, 113, 113, 0.12);
  font-weight: 600;
}

.correct-answer {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.08);
  color: #047857;
}

.feedback-text {
  background: rgba(107, 114, 128, 0.08);
  padding: 8px 12px;
  border-radius: 6px;
  color: #334155;
}

.no-question-result {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grading-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #94a3b8;
  padding: 40px 20px;
}

.placeholder-title {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 6px;
  color: #475569;
}

.placeholder-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  max-width: 320px;
}

@media (max-width: 1200px) {
  .ai-homework-container {
    flex-direction: column;
    height: auto;
  }
  
  .ai-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
    padding: 15px;
  }
  
  .ai-type-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .ai-type-item {
    width: calc(50% - 10px);
    box-sizing: border-box;
  }

  .ai-content {
    flex-direction: column;
    overflow: visible;
  }

  .ai-form,
  .ai-result-panel {
    width: 100%;
    flex: none;
  }

  .grading-container {
    flex-direction: column;
  }

  .grading-form-panel {
    width: 100%;
  }

  .grading-result-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .ai-type-item {
    width: 100%;
  }

  .ai-content {
    padding: 16px;
  }

  .ai-form {
    padding: 16px;
  }

  .ai-result-panel {
    padding: 20px;
  }

  .grading-form-panel {
    box-shadow: none;
  }

  .grading-result-panel {
    padding: 16px;
  }

  .summary-score {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
.preview-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin-top: 16px;
  margin-bottom: 8px;
}

.preview-content p {
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.preview-content ul,
.preview-content ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.preview-content li {
  margin-bottom: 4px;
}

.preview-content pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #24292e;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
}

.preview-content code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  background: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 90%;
  color: #24292e;
}

.preview-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  display: block;
  overflow-x: auto;
}

.preview-content th,
.preview-content td {
  border: 1px solid #dfe2e5;
  padding: 8px 12px;
  text-align: left;
}

.preview-content th {
  background: #f6f8fa;
  font-weight: 600;
}

.preview-content tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.preview-content tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.preview-content blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.preview-content hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}
</style> 