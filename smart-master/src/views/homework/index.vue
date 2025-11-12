<template>
  <div class="homework-container">
    <div class="page-header">
      <h1 class="page-title">作业管理</h1>
      <div class="header-actions">
        <el-button type="primary" icon="Plus">创建作业</el-button>
        <el-button icon="Upload">导入试题</el-button>
        <el-button icon="Connection">AI生成作业</el-button>
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
    
    <div class="content-section">
      <el-tabs class="homework-tabs">
        <el-tab-pane label="作业列表">
          <div class="homework-table-wrapper" v-if="homeworks.length > 0">
            <el-table :data="homeworks" style="width: 100%">
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
          </div>
          
          <div class="empty-placeholder" v-if="homeworks.length === 0">
            <img src="/logo.svg" alt="暂无作业" class="empty-icon" />
            <p class="empty-text">暂无作业，请创建或通过AI助教生成作业</p>
            <el-button type="primary" icon="Plus" @click="goToAiAssistant">使用AI助教生成</el-button>
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
              <div class="ai-form">
                <h3 class="ai-form-title">自动出题</h3>
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
                  <el-form-item label="知识点">
                    <el-select 
                      multiple 
                      placeholder="请选择知识点" 
                      style="width: 100%;"
                    >
                      <el-option label="点知识1" value="k1" />
                      <el-option label="点知识2" value="k2" />
                      <el-option label="点知识3" value="k3" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="题目类型">
                    <el-checkbox-group>
                      <el-checkbox label="选择题" />
                      <el-checkbox label="填空题" />
                      <el-checkbox label="解答题" />
                      <el-checkbox label="判断题" />
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item label="题目难度">
                    <el-slider 
                      :marks="{1:'简单', 3:'中等', 5:'困难'}" 
                      :step="1" 
                      :min="1" 
                      :max="5" 
                    />
                  </el-form-item>
                  <el-form-item label="题目数量">
                    <el-input-number :min="5" :max="50" :step="5" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="Connection" style="width: 100%">
                      开始生成作业
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="批阅统计">
          <div class="grading-stats">
            <div class="stats-placeholder">
              <img src="/logo.svg" alt="暂无数据" class="empty-icon" />
              <p class="empty-text">暂无作业批阅数据</p>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getHomeworks, deleteHomework, updateHomework } from '@/utils/storage'
import { ElMessageBox, ElMessage } from 'element-plus'
import { marked } from 'marked'

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

// 编辑对话框相关
const editDialogVisible = ref(false)
const currentHomework = ref(null)
const editedContent = ref('')

// 预览对话框相关
const previewDialogVisible = ref(false)
const previewTitle = ref('')

// 获取作业列表
const fetchHomeworks = () => {
  try {
    // 从localStorage获取最新的作业列表
    const rawData = localStorage.getItem('homeworks')
    const parsedData = rawData ? JSON.parse(rawData) : []
    
    // 按最后修改时间倒序排列，最新的在前面
    if (parsedData && parsedData.length > 0) {
      parsedData.sort((a, b) => {
        return new Date(b.lastModified) - new Date(a.lastModified)
      })
    }
    
    homeworks.value = parsedData
    console.log('获取到作业数据:', parsedData.length, '条')
  } catch (error) {
    console.error('获取作业数据失败:', error)
    ElMessage.error('获取作业列表失败')
    homeworks.value = []
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 查看作业
const viewHomework = (homework) => {
  currentHomework.value = homework
  previewTitle.value = homework.title
  previewDialogVisible.value = true
}

// 编辑作业
const editHomework = (homework) => {
  currentHomework.value = homework
  editedContent.value = homework.content
  editDialogVisible.value = true
}

// 保存编辑
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

// 确认删除作业
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

// 导出PDF
const exportPDF = () => {
  if (!currentHomework.value) return
  
  const element = document.querySelector('.preview-content')
  if (!element) return
  
  ElMessage.info('正在生成PDF，请稍候...')
  
  try {
    // 使用html2pdf直接将渲染好的HTML转换为PDF
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
  if (!currentHomework.value) return ''
  return marked(currentHomework.value.content)
})

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
  height: 500px;
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
  overflow-y: auto;
}

.ai-form {
  max-width: 600px;
  margin: 0 auto;
}

.ai-form-title {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.grading-stats {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-placeholder {
  text-align: center;
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