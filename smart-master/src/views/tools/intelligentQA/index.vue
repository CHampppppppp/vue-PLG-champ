<template>
  <div class="qa-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">智能答疑</h1>
        <p class="page-subtitle">
          系统将自动检索学生学习画像，并针对问题生成个性化解析与建议。
        </p>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          plain
          :icon="Refresh"
          @click="syncStudentProfile"
          :loading="profileLoading"
        >
          {{ profileLoading ? '同步画像中...' : '刷新画像' }}
        </el-button>
      </div>
    </div>

    <div class="qa-layout">
      <AppCard class="form-card" elevated title="学生自动画像">
        <template #actions>
          <el-tag type="info" effect="plain">系统根据历史数据实时生成</el-tag>
        </template>

        <div class="profile-wrapper" v-loading="profileLoading" element-loading-text="画像同步中...">
          <div v-if="!profileLoading && studentProfile" class="profile-content">
            <div class="profile-header">
              <div class="profile-avatar">
                <span>{{ studentProfile.initials }}</span>
              </div>
              <div>
                <p class="profile-name">{{ studentProfile.name }}</p>
                <p class="profile-meta">{{ studentProfile.className }} · {{ studentProfile.subjectTrack }}</p>
              </div>
            </div>
            <el-descriptions :column="1" size="small" class="profile-descriptions">
              <el-descriptions-item label="优势画像">
                {{ studentProfile.strengths }}
              </el-descriptions-item>
              <el-descriptions-item label="薄弱环节">
                {{ studentProfile.weaknesses }}
              </el-descriptions-item>
              <el-descriptions-item label="近期训练关注点">
                {{ studentProfile.recentFocus }}
              </el-descriptions-item>
              <el-descriptions-item label="最新作答摘要">
                {{ studentProfile.recentAnswers }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <el-empty v-else description="正在同步学生画像…" :image-size="120" />
        </div>

        <el-divider />

        <el-form label-position="top" class="qa-form">
          <el-form-item
            label="学生问题"
            required
            class="question-item"
          >
            <el-input
              v-model="question"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 8 }"
              maxlength="800"
              show-word-limit
              placeholder="请直接输入学生问题或题目内容，系统将结合画像自动分析。"
            />
          </el-form-item>

          <div class="form-actions">
            <el-button
              type="primary"
              :loading="loading"
              :disabled="!canSubmit"
              @click="handleAsk"
            >
              {{ loading ? '智能分析中...' : '开始答疑' }}
            </el-button>
            <el-button text type="default" @click="fillSampleQuestion" :disabled="loading">
              使用示例问题
            </el-button>
          </div>
        </el-form>

        <el-steps class="qa-steps" :active="qaActiveStep" finish-status="success">
          <el-step title="同步画像" description="自动识别学生画像" />
          <el-step title="输入问题" description="补充学生疑问" />
          <el-step title="AI分析" description="智能分析薄弱项" />
          <el-step title="查看建议" description="获取个性化反馈" />
        </el-steps>
      </AppCard>

      <AppCard class="result-card" elevated title="答疑记录">
        <template #actions>
          <el-tag v-if="sessions.length" type="success" effect="plain">
            当前共 {{ sessions.length }} 条
          </el-tag>
        </template>

        <div class="result-content" v-loading="loading" element-loading-text="AI 正在分析学生画像和题目...">
          <el-empty
            v-if="!sessions.length"
            description="提交问题后，这里将展示个性化答疑与建议"
          >
            <template #image>
              <img src="/logo.svg" alt="智能答疑" class="empty-icon" />
            </template>
          </el-empty>

          <el-timeline v-else>
            <el-timeline-item
              v-for="session in sessions"
              :key="session.id"
              :timestamp="session.time"
              placement="top"
              color="#409EFF"
            >
              <div class="session-card">
                <div class="session-question">
                  <h3>学生提问</h3>
                  <p>{{ session.question }}</p>
                </div>
                <div
                  class="session-answer"
                  v-html="session.renderedAnswer"
                ></div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { Refresh } from '@element-plus/icons-vue'
import AppCard from '@/components/common/AppCard.vue'
import { askIntelligentTutor } from '@/api/deepseek'

const loading = ref(false)
const sessions = ref([])
const question = ref('')

const profileLoading = ref(false)
const studentProfile = ref(null)

const qaActiveStep = computed(() => {
  if (profileLoading.value) return 1
  if (!question.value.trim() && !sessions.value.length) return 2
  if (loading.value) return 3
  return sessions.value.length ? 4 : 3
})

const mockProfiles = [
  {
    name: '李同学',
    initials: '李',
    className: '高一（5）班',
    subjectTrack: '理科实验班',
    strengths: '逻辑推理能力突出，函数基础扎实，善于归纳解题步骤。',
    weaknesses: '对参数方程与几何变换迁移不足，易忽略边界条件。',
    recentFocus: '一元二次函数的图像变化、与一次函数的联立求解、判别式应用。',
    recentAnswers: '最近两次周测在函数综合题上失分 8/20，常在求最值时漏写自变量取值范围。'
  },
  {
    name: '王同学',
    initials: '王',
    className: '高二（3）班',
    subjectTrack: '语文强化班',
    strengths: '文言文阅读理解准确，议论文立意深刻，有较强文化积累。',
    weaknesses: '英语写作语法不稳定，古诗鉴赏作答不够充分。',
    recentFocus: '实用类文本阅读，古诗词意象梳理，英语语法填空。',
    recentAnswers: '上周语文测试作文 53/60，古诗鉴赏因分析角度单薄得分 8/12。'
  },
  {
    name: '张同学',
    initials: '张',
    className: '初三（2）班',
    subjectTrack: '综合拓展班',
    strengths: '阅读理解速度快，历史知识面广，善于写作表达。',
    weaknesses: '理科题审题不够细致，几何题辅助线构造经验不足。',
    recentFocus: '圆与相切判定，函数与方程综合，历史大事年表梳理。',
    recentAnswers: '上次月考数学几何大题得分 10/20，主要由于未构造辅助高导致证明不完整。'
  }
]

const selectProfile = () => {
  const cached = localStorage.getItem('qa_student_profile')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed?.name) {
        studentProfile.value = parsed
        return
      }
    } catch (error) {
      console.warn('解析缓存学生画像失败', error)
    }
  }
  const randomProfile = mockProfiles[Math.floor(Math.random() * mockProfiles.length)]
  studentProfile.value = randomProfile
  localStorage.setItem('qa_student_profile', JSON.stringify(randomProfile))
}

const syncStudentProfile = async () => {
  profileLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    selectProfile()
    ElMessage.success('已同步学生画像并完成初步分析')
  } catch (error) {
    console.error('同步画像失败:', error)
    ElMessage.error('同步画像失败，请稍后再试')
  } finally {
    profileLoading.value = false
  }
}

syncStudentProfile()

const canSubmit = computed(() => question.value.trim().length > 3 && !loading.value && !profileLoading.value)

const fillSampleQuestion = () => {
  if (loading.value) return
  question.value = '老师，这道题求函数 y = x^2 - 4x + 3 的最大值和最小值，我尝试用判别式但总算不对，应该从图像还是代数角度入手呢？'
  ElMessage.success('已填充示例问题，可直接体验智能答疑')
}

const handleAsk = async () => {
  if (!canSubmit.value) {
    ElMessage.warning('请先填写学生的具体问题')
    return
  }

  if (!studentProfile.value) {
    ElMessage.warning('学生画像同步中，请稍后再试')
    return
  }

  loading.value = true

  try {
    const answer = await askIntelligentTutor({
      question: question.value,
      studentProfile: {
        studentName: studentProfile.value.name,
        strengths: studentProfile.value.strengths,
        weaknesses: studentProfile.value.weaknesses,
        recentFocus: studentProfile.value.recentFocus,
        recentAnswers: studentProfile.value.recentAnswers
      }
    })

    sessions.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString(),
      question: question.value,
      renderedAnswer: marked.parse(answer)
    })

    ElMessage.success('智能答疑完成，已根据学生画像生成个性化建议')

    question.value = ''
  } catch (error) {
    ElMessage.error(error.message || '智能答疑失败，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.qa-container {
  padding: 20px;
  min-height: 100%;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 40%, #ffffff 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 26px;
  color: #1f2937;
  font-weight: 600;
}

.page-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.qa-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-card,
.result-card {
  border-radius: 12px;
  overflow: hidden;
}

.profile-wrapper {
  background: rgba(244, 248, 255, 0.8);
  border: 1px solid rgba(209, 224, 255, 0.6);
  border-radius: 10px;
  padding: 16px;
  min-height: 220px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.profile-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.profile-meta {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.profile-descriptions :deep(.el-descriptions__label) {
  color: #6b7280;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
  color: #374151;
}

.qa-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.question-item :deep(.el-textarea__inner) {
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: rgba(255, 255, 255, 0.96);
  transition: all 0.3s ease;
}

.question-item :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.18);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.qa-steps {
  margin-top: 20px;
}

.qa-steps :deep(.el-step__title) {
  font-size: 13px;
}

.qa-steps :deep(.el-step__description) {
  font-size: 12px;
  color: #64748b;
}

.result-content {
  min-height: 420px;
  max-height: 640px;
  overflow-y: auto;
  padding: 4px;
}

.empty-icon {
  width: 72px;
  opacity: 0.55;
}

.session-card {
  background: rgba(248, 250, 252, 0.96);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.session-question {
  margin-bottom: 12px;
  border-bottom: 1px dashed #cbd5f5;
  padding-bottom: 10px;
}

.session-question h3 {
  margin: 0 0 6px;
  font-size: 15px;
  color: #2563eb;
}

.session-question p {
  margin: 0;
  color: #111827;
  line-height: 1.6;
}

.session-answer :deep(h2),
.session-answer :deep(h3) {
  color: #1f2937;
  font-weight: 600;
  margin: 14px 0 8px;
}

.session-answer :deep(ul),
.session-answer :deep(ol) {
  padding-left: 20px;
  margin: 8px 0 12px;
}

.session-answer :deep(li) {
  margin-bottom: 6px;
  line-height: 1.6;
}

.session-answer :deep(p) {
  margin: 6px 0;
  color: #374151;
  line-height: 1.7;
}

.session-answer :deep(strong) {
  color: #2563eb;
}

@media (max-width: 1280px) {
  .qa-layout {
    grid-template-columns: 1fr;
  }

  .result-content {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .qa-layout {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

