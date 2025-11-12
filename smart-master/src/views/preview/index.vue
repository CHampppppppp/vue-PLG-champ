<template>
  <div class="preview-container">
    <el-card class="preview-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2 class="title">
            <el-icon class="title-icon"><Document /></el-icon>
            <span>预习题生成</span>
          </h2>
          <div class="header-actions" v-if="previewContent">
            <el-tooltip content="编辑内容" placement="top">
              <el-button type="primary" @click="handleEdit" circle>
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="发布到学习平台" placement="top">
              <el-button type="success" @click="publishPreview" circle>
                <el-icon><Upload /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="导出PDF" placement="top">
              <el-button type="warning" @click="exportPDF" circle>
                <el-icon><Download /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>
      
      <!-- 生成表单 -->
      <div v-if="!previewContent" class="generation-section">
        <el-form :model="form" label-width="120px" class="generation-form">
          <el-form-item label="课程主题" prop="topic" required>
            <el-input 
              v-model="form.topic" 
              placeholder="请输入课程主题"
              clearable
            >
              <template #prefix>
                <el-icon><Reading /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="难度等级" prop="difficulty" required>
            <el-select 
              v-model="form.difficulty" 
              placeholder="请选择难度等级" 
              class="w-100"
              clearable
            >
              <el-option label="初级" value="初级">
                <span class="difficulty-option">
                  <el-tag size="small" type="success">初级</el-tag>
                  <span class="option-desc">适合基础薄弱学生</span>
                </span>
              </el-option>
              <el-option label="中级" value="中级">
                <span class="difficulty-option">
                  <el-tag size="small" type="warning">中级</el-tag>
                  <span class="option-desc">适合大多数学生</span>
                </span>
              </el-option>
              <el-option label="高级" value="高级">
                <span class="difficulty-option">
                  <el-tag size="small" type="danger">高级</el-tag>
                  <span class="option-desc">适合能力较强学生</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleGenerate" 
              :loading="loading" 
              class="generation-button"
              size="large"
            >
              <template #icon>
                <el-icon><MagicStick /></el-icon>
              </template>
              智能生成预习题
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <div class="progress-container">
          <el-progress 
            :percentage="progress" 
            :status="progress === 100 ? 'success' : ''"
            :stroke-width="12"
            striped
            striped-flow
            :format="formatProgress"
          />
          <p class="progress-text">
            <el-icon class="loading-icon"><Loading /></el-icon>
            {{ progressText }}
          </p>
        </div>
        
        <div class="loading-tips">
          <el-alert title="生成提示" type="info" :closable="false">
            <p>1. 生成过程可能需要1-2分钟，请耐心等待</p>
            <p>2. 生成质量与输入的主题描述详细程度相关</p>
            <p>3. 生成后可进行二次编辑调整</p>
          </el-alert>
        </div>
      </div>

      <!-- 预览内容 -->
      <div v-if="previewContent" class="preview-section">
        <div class="preview-content" id="pdfContent">
          <div class="preview-header">
            <h1 class="preview-title">{{ form.topic }}</h1>
            <div class="preview-meta">
              <el-tag :type="getDifficultyTagType(form.difficulty)" effect="light" round>
                {{ form.difficulty }}难度
              </el-tag>
              <span class="generate-time">{{ currentDate }}</span>
            </div>
          </div>
          
          <el-divider border-style="dashed" />
          
          <div class="content-container">
            <div class="ai-response">
              <div class="ai-avatar">
                <el-avatar :size="40" :src="aiAvatar" />
              </div>
              <div class="message-content markdown-body" v-html="formattedPreview"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑预习内容"
        width="80%"
        top="5vh"
        :close-on-click-modal="false"
      >
        <div class="editor-container">
          <!-- <div class="editor-toolbar">
            <el-button-group>
              <el-tooltip content="撤销" placement="top">
                <el-button :icon="RefreshLeft" @click="editor.undo()" />
              </el-tooltip>
              <el-tooltip content="重做" placement="top">
                <el-button :icon="RefreshRight" @click="editor.redo()" />
              </el-tooltip>
            </el-button-group>
            <el-button-group class="ml-10">
              <el-tooltip content="加粗" placement="top">
                <el-button @click="editor.insert('**加粗文字**')" />
              </el-tooltip>
              <el-tooltip content="斜体" placement="top">
                <el-button @click="editor.insert('_斜体文字_')" />
              </el-tooltip>
              <el-tooltip content="标题" placement="top">
                <el-button @click="editor.insert('## 标题')" />
              </el-tooltip>
            </el-button-group>
            <el-button-group class="ml-10">
              <el-tooltip content="列表" placement="top">
                <el-button :icon="List" @click="editor.insert('- 列表项')" />
              </el-tooltip>
              <el-tooltip content="数字列表" placement="top">
                <el-button :icon="Finished" @click="editor.insert('1. 列表项')" />
              </el-tooltip>
              <el-tooltip content="引用" placement="top">
                <el-button @click="editor.insert('> 引用内容')" />
              </el-tooltip>
            </el-button-group>
          </div> -->
          
          <div ref="editorRef" id="editorjs"></div>
        </div>
        
        <template #footer>
          <el-button @click="handleEditCancel">取消</el-button>
          <el-button type="primary" @click="handleEditConfirm">保存修改</el-button>
        </template>
      </el-dialog>

      <!-- 发布对话框 -->
      <el-dialog
        v-model="publishDialogVisible"
        title="发布预习题"
        width="400px"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <div class="publish-dialog">
          <el-result
            v-if="publishProgress === 100"
            icon="success"
            title="发布成功"
            sub-title="预习题已成功发布到学习平台"
          >
            <template #extra>
              <el-button type="primary" @click="publishDialogVisible = false">确定</el-button>
            </template>
          </el-result>
          
          <div v-else class="publish-progress">
            <el-progress
              type="circle"
              :percentage="publishProgress"
              :width="120"
              :stroke-width="10"
              status="success"
            />
            <div class="publish-text">
              <p class="publish-status">{{ publishText }}</p>
              <p class="publish-tip">请勿关闭窗口，发布完成后会自动关闭</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { generatePreview } from '@/api/preview'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { 
  Document, Edit, Upload, Download, MagicStick, Loading,
  RefreshLeft, RefreshRight, List,
  Finished, Reading
} from '@element-plus/icons-vue'
import aiAvatar from '@/assets/ai-avatar.jpg'
import { marked } from 'marked'
import html2pdf from 'html2pdf.js'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import ListTool from '@editorjs/list'
import Quote from '@editorjs/quote'
import Code from '@editorjs/code'
import Table from '@editorjs/table'
import Delimiter from '@editorjs/delimiter'

// 表单数据
const form = ref({
  topic: '',
  difficulty: ''
})

// 状态管理
const loading = ref(false)
const progress = ref(0)
const progressText = ref('')
const previewContent = ref('')
const editDialogVisible = ref(false)
const publishDialogVisible = ref(false)
const publishProgress = ref(0)
const publishText = ref('')
const editorRef = ref(null)
let editor = null

// 配置marked渲染器
const renderer = new marked.Renderer()
renderer.code = (code, language) => {
  return `<pre class="language-${language || 'text'}"><code>${code}</code></pre>`
}

// 配置marked选项
marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
  highlight: function(code, lang) {
    return code
  }
})

// 当前日期格式化
const currentDate = computed(() => {
  const now = new Date()
  return `生成时间: ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

// Markdown格式化
const formattedPreview = computed(() => {
  return marked(previewContent.value)
})

// 难度标签类型
const getDifficultyTagType = (difficulty) => {
  const types = { '初级': 'success', '中级': 'warning', '高级': 'danger' }
  return types[difficulty] || ''
}

// 进度条格式化
const formatProgress = (percentage) => {
  return `已完成 ${percentage}%`
}

// 更新进度
const updateProgress = (percentage, text) => {
  progress.value = percentage
  progressText.value = text
}

// 初始化编辑器
const initEditor = () => {
  if (editor) {
    editor.destroy()
  }
  
  nextTick(() => {
    if (editorRef.value) {
      editor = new EditorJS({
        holder: editorRef.value,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2
            }
          },
          list: {
            class: ListTool,
            inlineToolbar: true
          },
          quote: {
            class: Quote,
            inlineToolbar: true
          },
          code: {
            class: Code
          },
          table: {
            class: Table
          },
          delimiter: {
            class: Delimiter
          }
        },
        placeholder: '请在这里编辑内容...',
        data: markdownToBlocks(previewContent.value),
        minHeight: 300
      })
    }
  })
}

// 将markdown转换为编辑器块结构
const markdownToBlocks = (markdown) => {
  if (!markdown) return { blocks: [] };
  
  const markdownStr = typeof markdown === 'object' ? JSON.stringify(markdown, null, 2) : markdown.toString();
  const lines = markdownStr.split('\n');
  const blocks = [];
  
  let currentBlock = null;
  let inQuestionBlock = false;
  let questionBuffer = [];
  let questionTitle = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 处理选择题、填空题、简答题的标题
    if (line.match(/^(#+\s+)?(选择题|填空题|简答题)$/i)) {
      blocks.push({
        type: 'header',
        data: {
          text: line.replace(/^#+\s+/, ''),
          level: 2
        }
      });
      inQuestionBlock = true;
      continue;
    }
    
    // 检测选择题模式
    if (inQuestionBlock && line.match(/^[A-D]\.\s+.+$/)) {
      if (questionBuffer.length > 0) {
        blocks.push({
          type: 'paragraph',
          data: {
            text: questionBuffer.join(' ')
          }
        });
        questionBuffer = [];
      }
      
      if (!currentBlock || currentBlock.type !== 'list' || currentBlock.data.style !== 'unordered') {
        currentBlock = {
          type: 'list',
          data: {
            style: 'unordered',
            items: []
          }
        };
        blocks.push(currentBlock);
      }
      
      currentBlock.data.items.push(line);
      continue;
    }
    
    // 处理标题
    if (line.startsWith('# ')) {
      inQuestionBlock = false;
      blocks.push({
        type: 'header',
        data: {
          text: line.substring(2),
          level: 1
        }
      });
    } else if (line.startsWith('## ')) {
      inQuestionBlock = false;
      blocks.push({
        type: 'header',
        data: {
          text: line.substring(3),
          level: 2
        }
      });
    } else if (line.startsWith('### ')) {
      inQuestionBlock = false;
      blocks.push({
        type: 'header',
        data: {
          text: line.substring(4),
          level: 3
        }
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      inQuestionBlock = false;
      if (!currentBlock || currentBlock.type !== 'list' || currentBlock.data.style !== 'unordered') {
        currentBlock = {
          type: 'list',
          data: {
            style: 'unordered',
            items: []
          }
        };
        blocks.push(currentBlock);
      }
      
      currentBlock.data.items.push(line.substring(2));
    } else if (line.match(/^\d+\.\s+/)) {
      const titleMatch = line.match(/^(\d+\.\s+)(.*)$/);
      if (titleMatch && inQuestionBlock) {
        if (questionBuffer.length > 0) {
          blocks.push({
            type: 'paragraph',
            data: {
              text: questionBuffer.join(' ')
            }
          });
          questionBuffer = [];
        }
        
        questionTitle = titleMatch[1];
        questionBuffer.push(titleMatch[2]);
        continue;
      }
      
      inQuestionBlock = false;
      if (!currentBlock || currentBlock.type !== 'list' || currentBlock.data.style !== 'ordered') {
        currentBlock = {
          type: 'list',
          data: {
            style: 'ordered',
            items: []
          }
        };
        blocks.push(currentBlock);
      }
      
      currentBlock.data.items.push(line.substring(line.indexOf('.') + 2));
    } else if (line.startsWith('> ')) {
      inQuestionBlock = false;
      blocks.push({
        type: 'quote',
        data: {
          text: line.substring(2),
          caption: ''
        }
      });
    } else if (line.startsWith('```')) {
      inQuestionBlock = false;
      const lang = line.substring(3);
      let code = '';
      let j = i + 1;
      
      while (j < lines.length && !lines[j].startsWith('```')) {
        code += lines[j] + '\n';
        j++;
      }
      
      i = j;
      
      blocks.push({
        type: 'code',
        data: {
          code,
          language: lang || 'javascript'
        }
      });
    } else if (line === '---') {
      inQuestionBlock = false;
      blocks.push({
        type: 'delimiter',
        data: {}
      });
    } else if (line !== '') {
      if (inQuestionBlock) {
        questionBuffer.push(line);
      } else {
        blocks.push({
          type: 'paragraph',
          data: {
            text: line
          }
        });
      }
    } else if (line === '' && questionBuffer.length > 0) {
      blocks.push({
        type: 'paragraph',
        data: {
          text: questionBuffer.join(' ')
        }
      });
      questionBuffer = [];
    }
  }
  
  if (questionBuffer.length > 0) {
    blocks.push({
      type: 'paragraph',
      data: {
        text: questionBuffer.join(' ')
      }
    });
  }
  
  return { blocks };
}

// 生成预习题
const handleGenerate = async () => {
  if (!form.value.topic || !form.value.difficulty) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    loading.value = true
    previewContent.value = ''
    
    const steps = [
      { progress: 10, text: '正在分析教学主题...' },
      { progress: 30, text: '正在匹配课程标准...' },
      { progress: 50, text: '正在设计预习问题...' },
      { progress: 70, text: '正在优化题目难度...' },
      { progress: 90, text: '正在生成最终内容...' },
      { progress: 99, text: '预习题生成即将完成！' }
    ]
    
    for (const step of steps) {
      updateProgress(step.progress, step.text)
      await new Promise(resolve => setTimeout(resolve, 800))//假加载进度条
    }
    const content = await generatePreview(form.value.topic, form.value.difficulty)//调用API生成内容
    
    previewContent.value = content
    
    await new Promise(resolve => setTimeout(resolve, 500))
    loading.value = false
  } catch (error) {
    console.error('生成预习题失败:', error)
    loading.value = false
    ElMessage.error('生成预习题失败，请重试')
  } finally {
    progress.value = 0
    progressText.value = ''
  }
}

// 发布预习题
const publishPreview = async () => {
  publishDialogVisible.value = true
  publishProgress.value = 0
  publishText.value = '正在准备发布...'
  
  const steps = [
    { progress: 20, text: '正在验证内容...' },
    { progress: 40, text: '正在上传到服务器...' },
    { progress: 60, text: '正在同步到学习平台...' },
    { progress: 80, text: '正在建立学生关联...' },
    { progress: 100, text: '发布成功！' }
  ]
  
  for (const step of steps) {
    publishProgress.value = step.progress
    publishText.value = step.text
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  setTimeout(() => {
    publishDialogVisible.value = false
    ElMessage.success('预习题已成功发布')
  }, 1500)
}

// 编辑相关方法
const handleEdit = async () => {
  editDialogVisible.value = true
  await nextTick()
  initEditor()
}

const handleEditCancel = () => {
  ElMessageBox.confirm('您有未保存的修改，确定要取消吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    editDialogVisible.value = false
  }).catch(() => {})
}

const handleEditConfirm = async () => {
  try {
    const savedData = await editor.save()
    const content = convertEditorDataToMarkdown(savedData)
    previewContent.value = content
    editDialogVisible.value = false
    ElMessage.success('修改已保存')
  } catch (error) {
    console.error('保存编辑器内容失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 将编辑器数据转换为Markdown
const convertEditorDataToMarkdown = (data) => {
  if (!data || !data.blocks) return '';
  
  let markdown = '';
  
  data.blocks.forEach(block => {
    switch (block.type) {
      case 'header':
        markdown += `${'#'.repeat(block.data.level)} ${block.data.text}\n\n`;
        break;
      case 'paragraph':
        markdown += `${block.data.text}\n\n`;
        break;
      case 'list':
        if (block.data.style === 'ordered') {
          block.data.items.forEach((item, index) => {
            markdown += `${index + 1}. ${item}\n`;
          });
        } else {
          block.data.items.forEach(item => {
            markdown += `- ${item}\n`;
          });
        }
        markdown += '\n';
        break;
      case 'quote':
        markdown += `> ${block.data.text}\n\n`;
        break;
      case 'code':
        markdown += `\`\`\`${block.data.language || ''}\n${block.data.code}\n\`\`\`\n\n`;
        break;
      case 'delimiter':
        markdown += '---\n\n';
        break;
      default:
        break;
    }
  });
  
  return markdown.trim();
}

// 导出PDF
const exportPDF = async () => {
  let loadingInstance = null;
    try {
      loadingInstance = ElLoading.service({
      target: '#pdfContent',
      text: '正在生成PDF，请稍候哦...',
      background: 'rgba(255, 255, 255, 0.8)'
    })
    
    await nextTick()
    
    const element = document.getElementById('pdfContent')
    if (!element) {
      throw new Error('未找到要导出的内容')
    }
    
    // 创建临时容器
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = element.innerHTML
    tempContainer.style.width = '210mm'
    tempContainer.style.padding = '20px'
    tempContainer.style.backgroundColor = '#fff'
    document.body.appendChild(tempContainer)
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${form.value.topic}-预习题.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#FFFFFF'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        hotfixes: ['px_scaling']
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
      }
    }
    
    await html2pdf()
      .set(opt)
      .from(tempContainer)
      .save()
      .then(() => {
        document.body.removeChild(tempContainer)
        ElMessage.success('PDF导出成功')
        loadingInstance.close()
      })
      .catch(error => {
        console.error('PDF导出失败:', error)
        document.body.removeChild(tempContainer)
        ElMessage.error(`PDF导出失败: ${error.message}`)
      })
  } 
  catch (error) {
    console.error('PDF导出失败:', error)
    ElMessage.error(`PDF导出失败: ${error.message}`)
  } 
}

// 编辑器方法
const editorMethods = {

}

// 暴露编辑器方法
editor = editorMethods

// 销毁编辑器
// onBeforeUnmount(() => {
//   if (editor) {
//     editor.destroy()
//     editor = null
//   }
// })
</script>

<!-- <style scoped>
.preview-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.preview-card {
  min-height: 80vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: flex;
  align-items: center;
  margin: 0;
}

.title-icon {
  margin-right: 10px;
  font-size: 24px;
}

.generation-section {
  padding: 20px;
}

.generation-form {
  max-width: 800px;
  margin: 0 auto;
}

.generation-button {
  width: 100%;
  margin-top: 20px;
}

.loading-section {
  padding: 40px 20px;
  text-align: center;
}

.progress-container {
  max-width: 600px;
  margin: 0 auto;
}

.progress-text {
  margin-top: 15px;
  font-size: 16px;
  color: #666;
}

.loading-icon {
  margin-right: 8px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-tips {
  max-width: 600px;
  margin: 30px auto 0;
}

.preview-section {
  padding: 20px;
}

.preview-header {
  text-align: center;
  margin-bottom: 20px;
}

.preview-title {
  margin: 0 0 10px;
}

.preview-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.generate-time {
  color: #999;
  font-size: 14px;
}

.content-container {
  max-width: 800px;
  margin: 0 auto;
}

.ai-response {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.ai-avatar {
  flex-shrink: 0;
}

.message-content {
  flex-grow: 1;
}

.editor-container {
  padding: 10px;
}

.editor-toolbar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.publish-dialog {
  text-align: center;
  padding: 20px;
}

.publish-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.publish-text {
  text-align: left;
}

.publish-status {
  font-size: 16px;
  margin: 0 0 5px;
}

.publish-tip {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.difficulty-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-desc {
  font-size: 12px;
  color: #999;
}

.w-100 {
  width: 100%;
}

.ml-10 {
  margin-left: 10px;
}
</style> -->

<style scoped lang="scss">
.preview-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
}

.preview-card {
  width: 100%;
  max-width: 1200px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid #ebeef5;
  
  .title {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    
    .title-icon {
      margin-right: 8px;
      color: #409EFF;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
    
    .el-button {
      width: 36px;
      height: 36px;
      padding: 0;
    }
  }
}

.generation-section {
  padding: 20px;
}

.generation-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
  
  .el-input, .el-select {
    :deep(.el-input__inner) {
      padding-left: 35px;
    }
    
    :deep(.el-input__prefix) {
      display: flex;
      align-items: center;
      left: 10px;
    }
  }
}

.generation-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  
  .el-icon {
    margin-right: 8px;
    font-size: 18px;
  }
}

.difficulty-option {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .option-desc {
    color: #909399;
    font-size: 12px;
  }
}

.loading-section {
  padding: 40px 20px;
  text-align: center;
  
  .progress-container {
    max-width: 600px;
    margin: 0 auto 30px;
    
    .progress-text {
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #409EFF;
      font-size: 16px;
      font-weight: 500;
      
      .loading-icon {
        animation: rotating 2s linear infinite;
      }
    }
  }
  
  .loading-tips {
    max-width: 600px;
    margin: 0 auto;
    text-align: left;
    
    p {
      margin: 5px 0;
      line-height: 1.6;
    }
  }
}

.preview-section {
  padding: 0 20px 20px;
}

.preview-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  
  .preview-header {
    padding: 24px;
    text-align: center;
    
    .preview-title {
      margin: 0 0 12px;
      font-size: 24px;
      color: #303133;
      font-weight: 600;
    }
    
    .preview-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      
      .generate-time {
        color: #909399;
        font-size: 14px;
      }
    }
  }
  
  .content-container {
    padding: 0 24px 24px;
    
    .ai-response {
      display: flex;
      gap: 16px;
      
      .ai-avatar {
        flex-shrink: 0;
      }
      
      .message-content {
        flex: 1;
        padding: 16px;
        background-color: #f9fafc;
        border-radius: 8px;
        border: 1px solid #ebeef5;
      }
    }
  }
}

.editor-container {
  .editor-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    padding: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    .ml-10 {
      margin-left: 10px;
    }
  }
  
  :deep(.el-textarea__inner) {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    line-height: 1.6;
    padding: 15px;
    background-color: #f9fafc;
    border: 1px solid #dcdfe6;
    
    &:focus {
      border-color: #409EFF;
    }
  }
}

.publish-dialog {
  text-align: center;
  padding: 20px;
  
  .publish-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    
    .publish-text {
      text-align: left;
      
      .publish-status {
        margin: 0 0 8px;
        font-size: 16px;
        color: #303133;
        font-weight: 500;
      }
      
      .publish-tip {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Markdown样式优化 */
:deep(.markdown-body) {
  font-size: 15px;
  line-height: 1.8;
  color: #303133;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-weight: 600;
    color: #1f2d3d;
  }
  
  h1 {
    font-size: 1.8em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }
  
  h2 {
    font-size: 1.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }
  
  h3 {
    font-size: 1.3em;
  }
  
  p {
    margin: 0 0 16px;
  }
  
  a {
    color: #409EFF;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  ul, ol {
    padding-left: 2em;
    margin-bottom: 16px;
    
    li {
      margin: 0.4em 0;
      
      p {
        margin: 0;
      }
    }
  }
  
  blockquote {
    margin: 0 0 16px;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    background-color: #f8f8f8;
    border-radius: 4px;
    
    p {
      margin: 0.8em 0;
    }
  }
  
  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 16px;
    border: 1px solid #e1e4e8;
    
    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }
  }
  
  code {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 85%;
  }
  
  table {
    display: block;
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;
    border-collapse: collapse;
    
    th, td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }
    
    tr {
      background-color: #fff;
      
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
    
    th {
      font-weight: 600;
      background-color: #f5f7fa;
    }
  }
  
  img {
    max-width: 100%;
    box-sizing: border-box;
    margin: 8px 0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>