<template>
  <div class="ai-container">
    <div class="ai-content-wrapper">
      <!-- 左侧对话区域 -->
      <div class="ai-chat-container">
        <AppCard
          class="feature-card"
          elevated
          :padded="false"
          v-loading="loading"
          element-loading-text="AI 正在生成教学资源..."
          element-loading-background="rgba(255, 255, 255, 0.6)"
          title="AI工作台"
        >
          <template #icon>
            <el-icon><ChatDotRound /></el-icon>
          </template>
          <template #actions>
            <el-button type="primary" plain size="small" @click="clearConversation" :disabled="loading">
              <el-icon><Delete /></el-icon> 清空对话
            </el-button>
          </template>
          <div class="card-content">
            <transition name="guide-fade">
              <div v-if="showGuideBanner" class="guide-banner">
                <h4>快速开始</h4>
                <p>建议先提供以下信息，帮助AI更精准生成教学资源：</p>
                <ul>
                  <li>课程主题与知识点范围</li>
                  <li>班级学情或学生薄弱点</li>
                  <li>期望输出的资源类型（教案、作业等）</li>
                </ul>
                <el-alert
                  title="提示"
                  type="info"
                  :closable="false"
                  description="支持 Ctrl + Enter 快速发送"
                  show-icon
                />
              </div>
            </transition>
            <div class="message-box" ref="messageBoxRef">
              <transition-group name="message-fade">
                <div
                  v-for="(message, index) in messages" 
                  :key="index" 
                  :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
                >
                  <div class="message-avatar">
                    <el-avatar :size="40" :icon="message.role === 'user' ? UserFilled : ChatDotRound" :class="message.role === 'user' ? 'user-avatar' : 'ai-avatar'"></el-avatar>
                    <div class="avatar-label">{{ message.role === 'user' ? '您' : 'AI助教' }}</div>
                  </div>
                  <div class="message-content">
                    <div v-if="message.content" v-html="formatMessage(message.content)" class="content-text"></div>
                    
                    <div v-if="message.thinking" class="thinking-indicator">
                      <el-icon><Loading /></el-icon>
                      <span>AI思考中</span>
                      <div class="dots">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                      </div>
                    </div>
                    
                    <div v-if="message.steps" class="processing-steps">
                      <div 
                        v-for="(step, stepIndex) in message.steps" 
                        :key="stepIndex"
                        :class="['step-item', { 
                          'step-completed': step.completed, 
                          'step-current': step.current,
                          'step-item-with-hover': !step.completed && !step.current
                        }]"
                      >
                        <div class="step-icon">
                          <el-icon v-if="step.completed"><Check /></el-icon>
                          <el-icon v-else-if="step.current"><Loading /></el-icon>
                          <el-icon v-else><Clock /></el-icon>
                        </div>
                        <div class="step-info">
                          <div class="step-title">{{ step.title }}</div>
                          <div v-if="step.description" class="step-description">{{ step.description }}</div>
                          <el-progress 
                            v-if="step.current && step.progress !== undefined" 
:percentage="step.progress" 
                            :format="format => `${format}%`"
                            :status="step.progress >= 100 ? 'success' : ''"
                            :stroke-width="12"
                          ></el-progress>
                        </div>
                      </div>
                    </div>
                    
                    <!-- <div v-if="message.processing" class="processing-indicator">
                      <div class="processing-header">
                        <el-icon><Connection /></el-icon>
                        <span>{{ message.processing }}</span>
                      </div>
                      <el-progress 
                        :percentage="message.progress || 0" 
                        :status="message.progress >= 100 ? 'success' : ''"
                        :stroke-width="10"
                        :format="format => `${format}%`"
                      ></el-progress>
                    </div> -->
                    
                    <div v-if="message.actions" class="message-actions">
                      <div class="action-buttons">
                        <el-tooltip 
                          v-for="(action, actionIndex) in message.actions" 
                          :key="actionIndex"
                          :content="getActionTooltip(action.type)"
                          placement="top"
                        >
                          <el-button 
                            :type="action.type || 'default'"
                            @click="handleAction(action, message)"
                            round
                            class="action-button"
                          >
                            <el-icon class="action-icon"><component :is="getActionIcon(action.type)" /></el-icon>
                            {{ action.text }}
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
            <div class="input-area">
              <el-input
                type="textarea"
                :rows="3"
                placeholder="请输入教学大纲或问题..."
                v-model="userInput"
                :disabled="loading"
                @keyup.enter.ctrl="sendMessage"
                class="message-input"
              />
              <div class="input-actions">
                <div class="input-tips">
                  <el-tooltip content="按Ctrl+Enter发送消息" placement="top">
                    <span class="input-tip"><el-icon><InfoFilled /></el-icon> 提示: 输入详细大纲获得更精准的教学资源</span>
                  </el-tooltip>
                </div>
                <el-button 
                  type="primary" 
                  :loading="loading" 
                  @click="sendMessage" 
                  class="send-button"
                >
                  <el-icon v-if="!loading"><Position /></el-icon>
                  <span>{{ loading ? '生成中...' : '发送' }}</span>
                </el-button>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
      
      <!-- 右侧编辑区域 -->
      <div class="ai-editor-container">
        <AppCard class="editor-card" elevated :padded="false" :title="editorTitle">
          <template #actions>
            <div class="card-tools">
              <el-button-group>
                <el-button type="primary" @click="exportEditorContent" size="small" :icon="Download" color="#4e89e0">
                  导出
                </el-button>
                <el-button type="danger" @click="clearEditor" size="small" :icon="Delete" color="#e05858">
                  清空
                </el-button>
              </el-button-group>
            </div>
          </template>
          <div class="editor-content">
            <div ref="editorRef" class="rich-text-editor"></div>
          </div>
        </AppCard>
      </div>
    </div>
    
    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewTitle" width="80%" top="20px" :append-to-body="true" destroy-on-close>
      <div class="preview-content" v-html="renderedPreviewContent"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewDialogVisible = false" plain class="dialog-button cancel-button">
            <el-icon><Close /></el-icon>
            <span>关闭</span>
          </el-button>
          <el-button type="primary" @click="exportPDF" class="dialog-button export-button">
            <el-icon><Printer /></el-icon>
            <span>导出PDF</span>
          </el-button>
          <el-button type="success" @click="editInEditor" class="dialog-button edit-button">
            <el-icon><Edit /></el-icon>
            <span>在编辑器中打开</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  UserFilled, 
  ChatDotRound, 
  Delete, 
  Loading, 
  Check, 
  Clock, 
  Connection, 
  InfoFilled,
  View,
  Document,
  FolderAdd,
  More,
  Close,
  Printer,
  Position,
  Download,
  Edit
} from '@element-plus/icons-vue'
import AppCard from '@/components/common/AppCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateContent } from '@/api/deepseek'
import { generatePPT } from '@/api/xunfei'
import { saveHomework, saveLessonPlan } from '@/utils/storage'
import { marked } from 'marked'
import { debounce } from 'lodash-es'
import html2pdf from 'html2pdf.js'
import { useRouter } from 'vue-router'

let EditorConstructor = null
let HeaderTool = null
let ListTool = null
let QuoteTool = null
let CodeTool = null
let TableTool = null
let DelimiterTool = null

const ensureEditorModules = async () => {
  if (!EditorConstructor) {
    const [
      { default: EditorJSMod },
      { default: HeaderMod },
      { default: ListMod },
      { default: QuoteMod },
      { default: CodeMod },
      { default: TableMod },
      { default: DelimiterMod }
    ] = await Promise.all([
      import('@editorjs/editorjs'),
      import('@editorjs/header'),
      import('@editorjs/list'),
      import('@editorjs/quote'),
      import('@editorjs/code'),
      import('@editorjs/table'),
      import('@editorjs/delimiter')
    ])

    EditorConstructor = EditorJSMod
    HeaderTool = HeaderMod
    ListTool = ListMod
    QuoteTool = QuoteMod
    CodeTool = CodeMod
    TableTool = TableMod
    DelimiterTool = DelimiterMod
  }
}

// 配置marked渲染器
const renderer = new marked.Renderer()
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
const userInput = ref('')
const messages = ref([
  { 
    role: 'assistant',
    content: '你好，我是AI备课助手，可以帮助您生成教学资源。请输入教学大纲，我将为您生成相应的教案、作业、教学课件和教学视频。'
  }
])
const loading = ref(false)
const showGuideBanner = computed(() => messages.value.length === 1 && messages.value[0].role === 'assistant' && !loading.value)
const messageBoxRef = ref(null)
const editorRef = ref(null)
let editor = null

// 富文本编辑器内容
const editorContent = ref('')
const editorTitle = ref('内容编辑')
const editorType = ref('') // 'homework', 'lesson_plan', 'courseware', 'video'

// 预览对话框相关
const previewDialogVisible = ref(false)
const previewContent = ref('')
const previewTitle = ref('')
const previewType = ref('') // 'homework', 'lesson_plan', 'courseware', 'video'

// 渲染预览内容
const renderedPreviewContent = computed(() => {
  if (!previewContent.value) return '';
  
  if (typeof previewContent.value === 'object') {
    return marked(JSON.stringify(previewContent.value, null, 2));
  }
  
  return marked(previewContent.value.toString());
})

// 转义Markdown特殊字符
const escapeMarkdown = (text) => {
  if (!text) return '';
  
  // 转义特殊字符，但保留已经正确格式化的Markdown
  return text
    // 转义星号，但不转义 Already bold or italic
    .replace(/\*(?!\*|\/)/g, '\\*')
    // 转义下划线，但不转义 Already emphasized
    .replace(/\_(?!\_)/g, '\\_')
    // 转义方括号
    .replace(/(\[)(?!\])/g, '\\$1')
    .replace(/(?<!\[)(\])/g, '\\$1')
    // 转义尖括号
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 转义反引号，但不转义代码块
    .replace(/`(?!``)/g, '\\`')
    // 转义波浪号
    .replace(/~/g, '\\~');
};

// 处理教学大纲格式
const formatLessonPlan = (content) => {
  if (!content) return '';
  
  // 确保内容是字符串
  let lessonText = typeof content === 'object' ? JSON.stringify(content, null, 2) : content.toString();
  
  // 处理教学大纲标题格式 - 使用较小的标题
  lessonText = lessonText.replace(/^(教学大纲.*?)$/gm, '### $1');
  lessonText = lessonText.replace(/^(泰勒公式教学教案)$/gm, '## $1');
  
  // 处理时间段标记，使其成为小标题
  lessonText = lessonText.replace(/\*\*([\d:]+–[\d:]+.*?)\*\*/g, '#### $1');
  
  // 转义其他Markdown符号
  lessonText = escapeMarkdown(lessonText);
  
  // 恢复我们想保留的Markdown格式
  lessonText = lessonText
    // 恢复小标题格式
    .replace(/\\#\\#\\#\\# ([\d:]+–[\d:]+.*?)$/gm, '#### $1')
    .replace(/\\#\\#\\# (教学大纲.*?)$/gm, '### $1')
    .replace(/\\#\\# (泰勒公式教学教案)$/gm, '## $1');
  
  return lessonText;
};

// 处理作业内容格式
const formatHomeworkContent = (content) => {
  if (!content) return '';
  
  // 确保内容是字符串
  let homeworkText = typeof content === 'object' ? JSON.stringify(content, null, 2) : content.toString();
  
  // 识别选择题模式
  homeworkText = homeworkText.replace(/([A-D])\.\s+([^\n]+)/g, '\n$1. $2');
  
  // 在问题和选项之间添加空行
  homeworkText = homeworkText.replace(/(\d+\..*?)(?=\n[A-D]\.)/gs, '$1\n');
  
  // 在每道题之间添加空行
  homeworkText = homeworkText.replace(/([A-D]\.\s+[^\n]+)(?=\n\d+\.)/g, '$1\n');
  
  // 确保标题有正确的格式
  homeworkText = homeworkText.replace(/^(选择题|填空题|简答题)$/gm, '## $1');
  
  return homeworkText;
};

// 格式化消息内容，支持markdown
const formatMessage = (content) => {
  if (typeof content === 'object') {
    return marked(escapeMarkdown(JSON.stringify(content, null, 2)))
  }
  return marked(escapeMarkdown(content.toString()))
}

// 初始化编辑器
const initEditor = () => {
  if (editor) {
    editor.destroy()
  }
  
  nextTick(async () => {
    if (editorRef.value) {
      await ensureEditorModules()
      // 确定数据源，确保正确处理内容类型
      let editorData = { blocks: [] };
      
      if (editorContent.value) {
        try {
          if (typeof editorContent.value === 'string') {
            editorData = markdownToBlocks(editorContent.value);
          } else if (typeof editorContent.value === 'object') {
            // 如果已经是blocks格式，则直接使用
            if (editorContent.value.blocks) {
              editorData = editorContent.value;
            } else {
              // 否则转换为JSON字符串再转为blocks
              editorData = markdownToBlocks(JSON.stringify(editorContent.value, null, 2));
            }
          }
        } catch (error) {
          console.error('初始化编辑器内容失败:', error);
          editorData = { blocks: [] };
        }
      }
      
      editor = new EditorConstructor({
        holder: editorRef.value,
        tools: {
          header: {
            class: HeaderTool,
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
            class: QuoteTool,
            inlineToolbar: true
          },
          code: {
            class: CodeTool
          },
          table: {
            class: TableTool
          },
          delimiter: {
            class: DelimiterTool
          }
        },
        placeholder: '请在这里编辑内容...',
        data: editorData,
        minHeight: 300
      })
    }
  })
}

// 辅助函数：将markdown转换为编辑器可用的块结构
const markdownToBlocks = (markdown) => {
  if (!markdown) return { blocks: [] };
  
  // 确保markdown是字符串
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
      // 先添加小标题
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
      // 这是选项行
      if (questionBuffer.length > 0) {
        // 将之前收集的题干添加为段落
        blocks.push({
          type: 'paragraph',
          data: {
            text: questionBuffer.join(' ')
          }
        });
        questionBuffer = [];
      }
      
      // 选项以列表形式添加
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
      // 处理数字编号题目
      const titleMatch = line.match(/^(\d+\.\s+)(.*)$/);
      if (titleMatch && inQuestionBlock) {
        // 如果有未处理的题目，先添加
        if (questionBuffer.length > 0) {
          blocks.push({
            type: 'paragraph',
            data: {
              text: questionBuffer.join(' ')
            }
          });
          questionBuffer = [];
        }
        
        // 创建新的题目标题
        questionTitle = titleMatch[1]; // 例如 "1. "
        questionBuffer.push(titleMatch[2]); // 题目内容
        continue;
      }
      
      // 常规的有序列表
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
      // 代码块开始
      const lang = line.substring(3);
      let code = '';
      let j = i + 1;
      
      while (j < lines.length && !lines[j].startsWith('```')) {
        code += lines[j] + '\n';
        j++;
      }
      
      i = j; // 跳过代码块内容和结束符
      
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
      // 非空行文本内容
      if (inQuestionBlock) {
        // 在题目区域内，累积题目文本
        questionBuffer.push(line);
      } else {
        // 常规段落
        blocks.push({
          type: 'paragraph',
          data: {
            text: line
          }
        });
      }
    } else if (line === '' && questionBuffer.length > 0) {
      // 空行，如果有累积的题目，则添加为段落
      blocks.push({
        type: 'paragraph',
        data: {
          text: questionBuffer.join(' ')
        }
      });
      questionBuffer = [];
    }
  }
  
  // 处理结尾可能剩余的题目文本
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

// 滚动到底部
const scrollToBottom = debounce(() => {
  if (messageBoxRef.value) {
    nextTick(() => {
      messageBoxRef.value.scrollTop = messageBoxRef.value.scrollHeight
    })
  }
}, 100)

// 清空对话历史
const clearConversation = () => {
  ElMessageBox.confirm('确定要清空当前所有对话吗？', '清空确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messages.value = [{
      role: 'assistant',
      content: '你好，我是AI助教，可以帮助您生成教学资源。请输入教学大纲，我将为您生成相应的教案、作业、教学课件和教学视频。'
    }]
    
    // 清空本地存储
    localStorage.setItem('aiComparisonMessages', JSON.stringify(messages.value));
    
    ElMessage.success('对话已清空')
  }).catch(() => {})
}

// 清空编辑器
const clearEditor = () => {
  ElMessageBox.confirm('确定要清空编辑器内容吗？', '清空确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (editor) {
      editor.clear()
    }
    editorContent.value = ''
    editorTitle.value = '内容编辑';
    ElMessage.success('编辑器已清空')
  }).catch(() => {})
}

// 获取按钮图标
const getActionIcon = (type) => {
  const iconMap = {
    'primary': 'View',
    'success': 'Document',
    'info': 'FolderAdd', 
    'warning': 'FolderAdd',
    'danger': 'More'
  };
  return iconMap[type] || 'More';
}

// 获取操作按钮提示
const getActionTooltip = (type) => {
  const tooltipMap = {
    'primary': '查看作业并直接加载到编辑器',
    'success': '查看教案并直接加载到编辑器',
    'info': '保存作业到个人作业库',
    'warning': '保存教案到个人教案库'
  };
  return tooltipMap[type] || '操作';
}

const editInEditor = async () => {
  editorContent.value = previewContent.value
  editorTitle.value = previewTitle.value
  editorType.value = previewType.value
  
  previewDialogVisible.value = false
  await nextTick()
  initEditor()
  ElMessage.success(`${previewTitle.value}已加载到编辑器`)
}

// 导出编辑器内容
const exportEditorContent = async () => {
  if (!editor) return
  
  try {
    const data = await editor.save()
    
    if (!data || !data.blocks || data.blocks.length === 0) {
      ElMessage.warning('编辑器内容为空')
      return
    }
    
    // 将编辑器数据转换为HTML
    let html = '<div class="exported-content">'
    
    data.blocks.forEach(block => {
      switch (block.type) {
        case 'header':
          html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`
          break
        case 'paragraph':
          html += `<p>${block.data.text}</p>`
          break
        case 'list':
          if (block.data.style === 'ordered') {
            html += '<ol>'
            block.data.items.forEach(item => {
              html += `<li>${item}</li>`
            })
            html += '</ol>'
          } else {
            html += '<ul>'
            block.data.items.forEach(item => {
              html += `<li>${item}</li>`
            })
            html += '</ul>'
          }
          break
        case 'quote':
          html += `<blockquote>${block.data.text}</blockquote>`
          break
        case 'code':
          html += `<pre><code>${block.data.code}</code></pre>`
          break
        case 'delimiter':
          html += '<hr>'
          break
        default:
          break
      }
    })
    
    html += '</div>'
    
    // 创建临时容器
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = html
    tempContainer.style.width = '210mm'
    tempContainer.style.padding = '20px'
    tempContainer.style.backgroundColor = '#fff'
    document.body.appendChild(tempContainer)
    
    // 导出PDF
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${editorTitle.value || '导出内容'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    }
    
    html2pdf()
      .set(opt)
      .from(tempContainer)
      .save()
      .then(() => {
        document.body.removeChild(tempContainer)
        ElMessage.success('导出成功')
      })
      .catch(error => {
        console.error('导出错误:', error)
        document.body.removeChild(tempContainer)
        ElMessage.error(`导出失败: ${error.message}`)
      })
  } catch (error) {
    console.error('获取编辑器内容失败:', error)
    ElMessage.error(`导出失败: ${error.message}`)
  }
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const runStep = async (messageIndex, stepIndex, taskFn) => {
  const step = messages.value[messageIndex]?.steps?.[stepIndex]
  if (!step) return null

  step.current = true
  step.completed = false
  step.progress = 10

  try {
    await delay(250)
    const result = taskFn ? await taskFn() : null
    step.progress = 100
    step.completed = true
    return result
  } finally {
    step.current = false
  }
}

const processGeneration = async (prompt, aiMessageIndex) => {
  const steps = messages.value[aiMessageIndex]?.steps
  if (!steps) return

  messages.value[aiMessageIndex].content = '我正在分析您提供的教学大纲，生成过程中请稍候...'

  await runStep(aiMessageIndex, 0, async () => delay(600))

  const homeworkContent = await runStep(aiMessageIndex, 1, async () => {
    return await generateContent(prompt, 'homework')
  })

  const lessonPlanContent = await runStep(aiMessageIndex, 2, async () => {
    return await generateContent(prompt, 'lesson_plan')
  })

  await runStep(aiMessageIndex, 3, async () => delay(400))
  await runStep(aiMessageIndex, 4, async () => delay(400))
  await runStep(aiMessageIndex, 5, async () => delay(400))

  const coursewareNote = `# 教学课件生成计划
- 已根据教案关键节点生成PPT草稿大纲
- 后台将在10分钟内完成排版并推送至“课件资料”栏
- 建议教师拿到草稿后结合班级情况二次优化`

  const videoNote = `# 教学视频制作排期
- 自动提炼教案的重点板书与讲解要点
- 生成口播脚本与镜头提示后将发送至“资源库/视频脚本”
- 建议先查看教案成稿再安排录制`

  messages.value[aiMessageIndex] = {
    role: 'assistant',
    content: `分析已完成！基于您提供的教学需求「${prompt}」，我已生成如下资源：

- ✅ 课堂教案：结合学生画像与教学目标，形成完整授课流程
- ✅ 课后作业：匹配教案重难点，区分基础与拓展题型
- ⏳ 教学课件：PPT正在后台排队生成，稍后可在“教学资源”中查看草稿（将包含关键板块与板书提示）
- ⏳ 教学视频脚本：口播要点与镜头脚本已排期，将同步到“资料”作为参考草案

您可以立即预览或保存教案与作业，课件与视频脚本生成完成后会自动通知。`,
    actions: [
      { text: '查看作业', type: 'primary', data: { type: 'homework', content: homeworkContent, title: `${prompt}作业` } },
      { text: '查看教案', type: 'success', data: { type: 'lesson_plan', content: lessonPlanContent, title: `${prompt}教案` } },
      { text: '保存作业', type: 'info', data: { type: 'save_homework', content: homeworkContent, title: prompt } },
      { text: '保存教案', type: 'warning', data: { type: 'save_lesson_plan', content: lessonPlanContent, title: prompt } }
    ],
    meta: {
      coursewareNote,
      videoNote
    }
  }
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return
  
  const userMessage = userInput.value.trim()
  userInput.value = ''
  loading.value = true
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage
  })
  
  // 添加AI思考消息
  messages.value.push({
    role: 'assistant',
    steps: [
      { 
        title: '分析教学大纲', 
        description: '提取课程结构、重难点与评价目标', 
        completed: false, 
        current: true,
        progress: 0
      },
      { 
        title: '生成课后作业', 
        description: '匹配知识结构与能力层级，形成梯度题目', 
        completed: false, 
        current: false,
        progress: 0
      },
      { 
        title: '构建教学教案', 
        description: '编排教学流程与互动设计，突出重难点', 
        completed: false, 
        current: false,
        progress: 0
      },
      { 
        title: '排队生成课件', 
        description: '同步教案要点，生成PPT草案并排版', 
        completed: false, 
        current: false,
        progress: 0
      },
      { 
        title: '准备视频脚本', 
        description: '提炼口播要点与镜头提示，生成脚本草案', 
        completed: false, 
        current: false,
        progress: 0
      },
      { 
        title: '汇总教学建议', 
        description: '形成可执行的课堂落地提示', 
        completed: false, 
        current: false,
        progress: 0
      }
    ]
  })
  
  scrollToBottom()
  
  try {
    const aiMessageIndex = messages.value.length - 1
    await processGeneration(userMessage, aiMessageIndex)
  } catch (error) {
    console.error('Error generating content:', error)
    
    // 显示错误信息
    const aiMessageIndex = messages.value.length - 1
    messages.value[aiMessageIndex] = {
      role: 'assistant',
      content: `很抱歉，生成内容时出现错误：${error.message}`
    }
    ElMessage.error(error.message || '生成内容失败，请稍后再试')
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 处理按钮动作
const handleAction = async (action, message) => {
  if (!action.data) return
  
  const { type, content, title } = action.data
  
  if (type === 'homework' || type === 'lesson_plan' || type === 'courseware' || type === 'video') {
    // 直接加载到编辑器，不再使用预览对话框
    let formattedContent = '';
    
    if (type === 'homework') {
      // 对作业内容进行特殊格式处理
      formattedContent = formatHomeworkContent(content);
    } else if (type === 'lesson_plan') {
      // 对教案内容进行特殊格式处理
      formattedContent = formatLessonPlan(content);
    } else {
      formattedContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : content.toString();
    }
    
    editorContent.value = formattedContent;
    editorTitle.value = title;
    editorType.value = type;
    
    // 等待DOM更新
    await nextTick();
    
    // 初始化编辑器并加载内容
    initEditor();
    
    // 显示成功提示
    let successMsg = '';
    switch (type) {
      case 'homework':
        successMsg = '作业已加载到编辑器';
        break;
      case 'lesson_plan':
        successMsg = '教案已加载到编辑器';
        break;
      case 'courseware':
        successMsg = '课件已加载到编辑器';
        break;
      case 'video':
        successMsg = '视频脚本已加载到编辑器';
        break;
    }
    ElMessage.success(successMsg);
    
  } else if (type === 'save_homework') {
    // 保存到作业库
    try {
      // 确保localStorage已初始化
      if (!localStorage.getItem('homeworks')) {
        localStorage.setItem('homeworks', JSON.stringify([]));
      }
      
      // 保存作业
      const id = saveHomework(title, content)
      console.log('作业已保存，ID:', id)
      
      // 获取当前作业列表确认是否保存成功
      const homeworks = JSON.parse(localStorage.getItem('homeworks') || '[]')
      const savedHomework = homeworks.find(h => h.id === id)
      
      if (savedHomework) {
        ElMessage.success('作业已成功保存到作业库')
        
        // 询问是否前往作业页面
        ElMessageBox.confirm('作业已保存成功，是否前往作业页面查看？', '保存成功', {
          confirmButtonText: '前往查看',
          cancelButtonText: '稍后查看',
          type: 'success'
        }).then(() => {
          router.push('/home/homework')
        }).catch(() => {})
      } else {
        ElMessage.warning('作业可能未正确保存，请检查')
      }
    } catch (error) {
      console.error('保存作业时出错:', error)
      ElMessage.error(`保存失败: ${error.message}`)
    }
  } else if (type === 'save_lesson_plan') {
    // 保存到教案库
    try {
      // 确保localStorage已初始化
      if (!localStorage.getItem('lessonPlans')) {
        localStorage.setItem('lessonPlans', JSON.stringify([]));
      }
      
      // 保存教案
      const id = saveLessonPlan(title, content)
      ElMessage.success('已保存到教案库')
      
      // 询问是否前往教案页面
      ElMessageBox.confirm('教案已保存成功，是否前往教案页面查看？', '保存成功', {
        confirmButtonText: '前往查看',
        cancelButtonText: '稍后查看',
        type: 'success'
      }).then(() => {
        router.push('/home/lesson-plan')
      }).catch(() => {})
    } catch (error) {
      ElMessage.error(`保存失败: ${error.message}`)
    }
  }
}

// 导出PDF
const exportPDF = async () => {
  const element = document.querySelector('.preview-content');
  if (!element) return;
  
  ElMessage.info('正在生成PDF，请稍候...');
  
  try {
    // 等待内容完全渲染
    await nextTick();
    
    // PDF导出配置
    const opt = {
      margin: [15, 15, 15, 15], // 上右下左边距
      filename: `${previewTitle.value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
        foreignObjectRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        putOnlyUsedFonts: true,
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after'
      }
    };

    // 创建临时容器以处理样式
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = element.innerHTML;
    tempContainer.style.width = '210mm'; // A4纸宽度
    tempContainer.style.padding = '20px';
    tempContainer.style.backgroundColor = '#fff';
    
    // 添加标题
    const titleElement = document.createElement('h1');
    titleElement.textContent = previewTitle.value;
    titleElement.style.textAlign = 'center';
    titleElement.style.marginBottom = '20px';
    tempContainer.insertBefore(titleElement, tempContainer.firstChild);
    
    document.body.appendChild(tempContainer);

    // 使用html2pdf
    await import('html2pdf.js').then(async (html2pdfModule) => {
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      try {
        const pdf = await html2pdf()
          .set(opt)
          .from(tempContainer)
          .toPdf()
          .output('blob');
          
        // 创建下载链接
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${previewTitle.value}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        ElMessage.success('PDF导出成功！');
      } catch (error) {
        console.error('PDF生成错误:', error);
        ElMessage.error(`PDF导出失败: ${error.message}`);
      } finally {
        // 移除临时容器
        document.body.removeChild(tempContainer);
      }
    }).catch(error => {
      console.error('加载html2pdf错误:', error);
      ElMessage.error('PDF库加载失败，请稍后再试');
    });
  } catch (error) {
    console.error('PDF导出初始化错误:', error);
    ElMessage.error(`PDF导出失败: ${error.message}`);
  }
};

// 预览对话框相关样式
const dialogStyle = computed(() => ({
  maxHeight: '80vh',
  overflowY: 'auto',
  padding: '20px'
}));

// 初始化
onMounted(() => {
  // 尝试从本地存储恢复对话记录
  try {
    const savedMessages = localStorage.getItem('aiComparisonMessages');
    if (savedMessages) {
      messages.value = JSON.parse(savedMessages);
    }
  } catch (error) {
    console.error('恢复对话记录失败:', error);
  }
  
  scrollToBottom()
  initEditor()
})

// 监听消息变化，保存到localStorage
watch(messages, (newMessages) => {
  // 避免保存过大的消息记录，只保存最近的20条
  const messagesToSave = [...newMessages];
  if (messagesToSave.length > 20) {
    messagesToSave.splice(0, messagesToSave.length - 20);
  }
  localStorage.setItem('aiComparisonMessages', JSON.stringify(messagesToSave));
}, { deep: true });

// 销毁编辑器
onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<style scoped>
/* ========== Base & Layout Styles ========== */
.ai-container {
  padding: 2px;
  height: 110%;
}

.ai-content-wrapper {
  display: flex;
  height: calc(100% - 20px);
  gap: 20px;
}

.ai-chat-container,
.ai-editor-container {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.ai-editor-container {
  display: flex;
  flex-direction: column;
}

/* ========== Card Styles ========== */
.feature-card,
.editor-card {
  flex: 1;
  background: #fff;
  border-radius: var(--card-radius);
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: var(--card-shadow-soft);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.feature-card :deep(.app-card__header),
.editor-card :deep(.app-card__header) {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(180deg, #f9fbff 0%, #f3f4f6 100%);
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.feature-card :deep(.app-card__icon),
.editor-card :deep(.app-card__icon) {
  background: rgba(64, 158, 255, 0.12);
  color: #409eff;
}

.feature-card :deep(.app-card__title),
.editor-card :deep(.app-card__title) {
  color: #333;
}

.feature-card:hover,
.editor-card:hover {
  box-shadow: var(--card-shadow);
}

.card-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.guide-banner {
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.08));
  border-bottom: 1px solid rgba(59, 130, 246, 0.12);
  color: #1e293b;
}

.guide-banner h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.guide-banner p {
  margin: 0 0 10px;
  font-size: 13px;
  color: #475569;
}

.guide-banner ul {
  margin: 0 0 12px 16px;
  padding: 0;
  color: #334155;
  font-size: 13px;
}

.guide-banner li {
  margin-bottom: 4px;
}

.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.3s ease;
}

.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ========== Editor Styles ========== */
.rich-text-editor {
  min-height: 300px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

/* ========== Message Styles ========== */
.message-box {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9fbff;
  border-bottom: 1px solid #ebeef5;
}

.message {
  display: flex;
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease-in-out;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
  text-align: center;
  min-width: 44px;
}

.avatar-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.user-avatar {
  background-color: #e6f7ff;
  color: #1890ff;
}

.ai-avatar {
  background-color: #f0f9eb;
  color: #67c23a;
}

.message-content {
  max-width: 75%;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.user-message .message-content {
  background-color: #ecf5ff;
  border-top-right-radius: 0;
  text-align: right;
}

.ai-message .message-content {
  background-color: #fff;
  border-top-left-radius: 0;
}

/* ========== Text Content Styles ========== */
.content-text {
  line-height: 1.7;
  font-size: 14px;
  color: #1f2937;
}

.content-text :deep(h1) {
  font-size: 1.8em;
  margin-bottom: 0.6em;
}

.content-text :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 0.5em;
}

.content-text :deep(h3) {
  font-size: 1.3em;
  margin-bottom: 0.4em;
}

.content-text :deep(h4) {
  font-size: 1.1em;
  margin-bottom: 0.3em;
  font-weight: bold;
}

.content-text :deep(p) {
  margin-bottom: 0.8em;
  font-size: 14px;
}

.content-text :deep(.time-segment) {
  font-weight: bold;
  color: #1a6aa2;
  margin-top: 1em;
  font-size: 1.1em;
  border-left: 3px solid #1a6aa2;
  padding-left: 8px;
}

/* Lesson plan specific styles */
.lesson-plan-format .content-text :deep(h2) {
  font-size: 1.4em;
  color: #2c3e50;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.lesson-plan-format .content-text :deep(h3) {
  font-size: 1.2em;
  color: #34495e;
}

.lesson-plan-format .content-text :deep(h4) {
  font-size: 1.1em;
  color: #3c6382;
  font-weight: 600;
  margin-top: 1em;
}

/* ========== Loading & Status Indicators ========== */
.thinking-indicator {
  display: flex;
  align-items: center;
  color: #909399;
  background-color: rgba(250, 250, 250, 0.8);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 10px 0;
  animation: fadeIn 0.5s ease-in-out;
}

.thinking-indicator .el-icon {
  margin-right: 6px;
  animation: spin 1.5s infinite linear;
  font-size: 18px;
  color: #409eff;
}

.dots {
  display: flex;
  margin-left: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
  margin: 0 3px;
  animation: dot-pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.processing-steps {
  margin: 16px 0;
  border: 1px solid #e8f5e9;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9fffa;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.5s ease-out;
}

.step-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #e8f5e9;
  background-color: #f9fffa;
  transition: all 0.3s;
}

.step-item:last-child {
  border-bottom: none;
}

.step-completed {
  background-color: #f0f9eb;
}

.step-current {
  background-color: #e1f5fe;
  animation: pulseBackground 2s infinite;
}

.step-item-with-hover:hover {
  background-color: #f5f5f5;
  cursor: default;
}

.step-icon {
  margin-right: 12px;
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f0f0f0;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-completed .step-icon {
  color: #fff;
  background-color: #67c23a;
  transform: scale(1.05);
}

.step-current .step-icon {
  color: #fff;
  background-color: #409eff;
  animation: pulse 1.5s infinite;
}

.step-info {
  flex: 1;
}

.step-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.step-current .step-title {
  color: #1a6aa2;
  font-weight: 600;
}

.step-description {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

/**.processing-indicator {
  margin-top: 16px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in-out;
}

.processing-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #606266;
  font-weight: 500;
}

.processing-header .el-icon {
  margin-right: 6px;
  color: #409eff;
  animation: blink 1.5s infinite ease-in-out;
  font-size: 18px;
}**/

/* ========== Progress Bar Styles ========== */
:deep(.el-progress-bar__outer) {
  border-radius: 8px;
  background-color: #ebeef5;
}

:deep(.el-progress-bar__inner) {
  border-radius: 8px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

:deep(.el-progress--success .el-progress-bar__inner) {
  background-color: #67c23a;
}

:deep(.el-progress__text) {
  font-weight: bold;
  color: #409eff;
}

/* ========== Message Actions ========== */
.message-actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ai-message .message-actions {
  justify-content: flex-start;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-button {
  border-radius: 20px;
  padding: 10px 16px;
  min-width: 100px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* Button color variants */
.action-button.el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
}

.action-button.el-button--success {
  background-color: #67C23A;
  border-color: #67C23A;
}

.action-button.el-button--warning {
  background-color: #E6A23C;
  border-color: #E6A23C;
}

.action-button.el-button--danger {
  background-color: #F56C6C;
  border-color: #F56C6C;
}

.action-button.el-button--info {
  background-color: #909399;
  border-color: #909399;
}

/* ========== Input Area Styles ========== */
.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.message-input {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 12px 15px;
  resize: none;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.send-button {
  border-radius: 20px;
  padding: 10px 24px;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409EFF, #3a8ee6);
  border: none;
  box-shadow: 0 3px 10px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4);
}

.send-button .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.send-button.is-loading {
  background: linear-gradient(135deg, #64b5ff, #4e9cf0);
}

.input-tips {
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.input-tip {
  display: flex;
  align-items: center;
  cursor: help;
  color: #909399;
  transition: color 0.3s;
}

.input-tip:hover {
  color: #409eff;
}

.input-tip .el-icon {
  margin-right: 4px;
  font-size: 14px;
  color: #409eff;
}

/* ========== Animation Keyframes ========== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dot-pulse {
  0%, 60%, 100% { transform: scale(0.8); opacity: 0.4; }
  30% { transform: scale(1.2); opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulseBackground {
  0%, 100% { background-color: #e1f5fe; }
  50% { background-color: #d3eafd; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes blink {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ========== Responsive Styles ========== */
@media (max-width: 1200px) {
  .ai-content-wrapper {
    flex-direction: column;
  }
  
  .ai-chat-container,
  .ai-editor-container {
    width: 100%;
    height: auto;
  }
  
  .ai-editor-container {
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .message-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .message-actions .el-button {
    margin-bottom: 8px;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .input-actions .el-button {
    width: 100%;
  }
}

/* ========== Performance Optimizations ========== */
.step-item,
/**.processing-indicator, 8.13改（删除processing-indicator）**/ 
.thinking-indicator,
.message {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Reduce animation intensity for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>