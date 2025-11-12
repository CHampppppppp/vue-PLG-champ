<template>
  <div class="lesson-plan-container">
    <div class="page-header">
      <h1 class="page-title">教案管理</h1>
      <div class="header-actions">
        <el-button type="primary" icon="Plus">新建教案</el-button>
        <el-button icon="Connection">AI生成教案</el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-input placeholder="搜索教案" prefix-icon="Search" clearable class="search-input" />
      <el-select placeholder="学科" style="width: 120px; margin-left: 10px;">
        <el-option label="全部" value="all" />
        <el-option label="语文" value="chinese" />
        <el-option label="数学" value="math" />
        <el-option label="英语" value="english" />
        <el-option label="物理" value="physics" />
      </el-select>
      <el-select placeholder="年级" style="width: 120px; margin-left: 10px;">
        <el-option label="全部" value="all" />
        <el-option label="一年级" value="grade1" />
        <el-option label="二年级" value="grade2" />
        <el-option label="三年级" value="grade3" />
        <el-option label="高一" value="high1" />
      </el-select>
    </div>
    
    <div class="content-section">
      <el-tabs class="lesson-plan-tabs">
        <el-tab-pane label="我的教案">
          <div class="lesson-plans-container" v-if="lessonPlans.length > 0">
            <el-table :data="lessonPlans" style="width: 100%">
              <el-table-column prop="title" label="教案标题" min-width="200" />
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
                  <el-button size="small" type="primary" @click="viewLessonPlan(scope.row)">查看</el-button>
                  <el-button size="small" @click="editLessonPlan(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="confirmDeleteLessonPlan(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div class="empty-placeholder" v-if="lessonPlans.length === 0">
            <img src="/logo.svg" alt="暂无教案" class="empty-icon" />
            <p class="empty-text">暂无教案内容，请添加或使用AI生成教案</p>
            <el-button type="primary" icon="Plus" @click="goToAiAssistant">使用AI助教生成</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="教案模板">
          <div class="template-container">
            <div class="template-card" v-for="i in 4" :key="i">
              <div class="template-icon">
                <i class="el-icon-document"></i>
              </div>
              <div class="template-info">
                <h3 class="template-title">标准教案模板</h3>
                <p class="template-desc">适用于大多数学科的标准教案格式</p>
              </div>
              <div class="template-actions">
                <el-button type="primary" size="small">使用此模板</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="AI助手">
          <div class="ai-assistant">
            <div class="ai-prompt-container">
              <h3 class="ai-title">教案AI助手</h3>
              <p class="ai-description">
                描述您想要生成的教案内容，AI将为您自动创建教案大纲和内容。
              </p>
              <div class="ai-form">
                <el-form label-position="top">
                  <el-form-item label="学科">
                    <el-select placeholder="请选择学科" style="width: 100%;">
                      <el-option label="语文" value="chinese" />
                      <el-option label="数学" value="math" />
                      <el-option label="英语" value="english" />
                      <el-option label="物理" value="physics" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="年级">
                    <el-select placeholder="请选择年级" style="width: 100%;">
                      <el-option label="一年级" value="grade1" />
                      <el-option label="二年级" value="grade2" />
                      <el-option label="三年级" value="grade3" />
                      <el-option label="高一" value="high1" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="教学内容/主题">
                    <el-input placeholder="例如：平行四边形的性质" />
                  </el-form-item>
                  <el-form-item label="其他要求（可选）">
                    <el-input type="textarea" rows="4" placeholder="例如：侧重于探究式教学，加入小组活动环节" />
                  </el-form-item>
                  <el-button type="primary" icon="Connection" style="width: 100%">生成教案</el-button>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
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
    <el-dialog v-model="editDialogVisible" title="编辑教案" width="80%" top="5vh">
      <el-form>
        <el-form-item>
          <el-input
            v-model="editedContent"
            type="textarea"
            :rows="20"
            placeholder="请编辑教案内容..."
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLessonPlans, deleteLessonPlan, updateLessonPlan } from '@/utils/storage'
import { ElMessageBox, ElMessage } from 'element-plus'
import { marked } from 'marked'

const router = useRouter()
const lessonPlans = ref([])

// 编辑对话框相关
const editDialogVisible = ref(false)
const currentLessonPlan = ref(null)
const editedContent = ref('')

// 预览对话框相关
const previewDialogVisible = ref(false)
const previewTitle = ref('')

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

// 获取教案列表
const fetchLessonPlans = () => {
  try {
    // 从localStorage获取最新的教案列表
    const rawData = localStorage.getItem('lessonPlans')
    const parsedData = rawData ? JSON.parse(rawData) : []
    
    // 按最后修改时间倒序排列，最新的在前面
    if (parsedData && parsedData.length > 0) {
      parsedData.sort((a, b) => {
        return new Date(b.lastModified) - new Date(a.lastModified)
      })
    }
    
    lessonPlans.value = parsedData
    console.log('获取到教案数据:', parsedData.length, '条')
  } catch (error) {
    console.error('获取教案数据失败:', error)
    ElMessage.error('获取教案列表失败')
    lessonPlans.value = []
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 查看教案
const viewLessonPlan = (lessonPlan) => {
  currentLessonPlan.value = lessonPlan
  previewTitle.value = lessonPlan.title
  previewDialogVisible.value = true
}

// 编辑教案
const editLessonPlan = (lessonPlan) => {
  currentLessonPlan.value = lessonPlan
  editedContent.value = lessonPlan.content
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = () => {
  if (!currentLessonPlan.value || !editedContent.value.trim()) {
    return
  }
  
  try {
    updateLessonPlan(currentLessonPlan.value.id, {
      content: editedContent.value,
      lastModified: new Date().toISOString()
    })
    
    ElMessage.success('教案更新成功')
    fetchLessonPlans()
    editDialogVisible.value = false
  } catch (error) {
    ElMessage.error(`更新失败: ${error.message}`)
  }
}

// 确认删除教案
const confirmDeleteLessonPlan = (lessonPlan) => {
  ElMessageBox.confirm(`确定要删除教案 "${lessonPlan.title}" 吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteLessonPlan(lessonPlan.id)
    ElMessage.success('教案已删除')
    fetchLessonPlans()
  }).catch(() => {})
}

// 导出PDF
const exportPDF = () => {
  if (!currentLessonPlan.value) return
  
  const element = document.querySelector('.preview-content')
  if (!element) return
  
  ElMessage.info('正在生成PDF，请稍候...')
  
  try {
    // 使用html2pdf直接将渲染好的HTML转换为PDF
    const opt = {
      margin: 10,
      filename: `${currentLessonPlan.value.title}.pdf`,
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

    // 添加处理中文的字体
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

// 渲染Markdown内容
const renderedPreviewContent = computed(() => {
  if (!currentLessonPlan.value) return ''
  return marked(currentLessonPlan.value.content)
})

// 跳转到AI助教页面
const goToAiAssistant = () => {
  router.push('/home/ai-comparison')
}

// 使用模板创建新教案
const useTemplate = () => {
  ElMessage.info('使用模板功能暂未实现，请通过AI助教生成教案')
}

// 初始化
onMounted(() => {
  // 确保localStorage已初始化
  if (!localStorage.getItem('lessonPlans')) {
    localStorage.setItem('lessonPlans', JSON.stringify([]));
    console.log('初始化教案存储空间');
  }
  
  // 获取教案列表
  fetchLessonPlans()
})
</script>

<style scoped>
.lesson-plan-container {
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

.lesson-plan-tabs {
  height: 100%;
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

.template-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.template-card {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-icon {
  font-size: 36px;
  color: #7e57c2;
  margin-right: 20px;
}

.template-info {
  flex: 1;
}

.template-title {
  font-size: 16px;
  margin: 0 0 5px 0;
}

.template-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.ai-assistant {
  padding: 20px 0;
}

.ai-prompt-container {
  max-width: 600px;
  margin: 0 auto;
}

.ai-title {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.ai-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.ai-form {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

@media (max-width: 1200px) {
  .template-container {
    grid-template-columns: 1fr;
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
  
  .template-card {
    flex-direction: column;
    text-align: center;
  }
  
  .template-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .template-actions {
    margin-top: 15px;
  }
}
</style>

<style>
/* 添加预览内容样式 */
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