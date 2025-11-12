<template>
  <div class="courseware-container">
    <div class="page-header">
      <h1 class="page-title">课件管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="createNewFolder">
          <el-icon><Folder /></el-icon> 新建文件夹
        </el-button>
        <el-button type="success" @click="showUploadDialog">
          <el-icon><Upload /></el-icon> 上传课件
        </el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-input placeholder="搜索课件" prefix-icon="Search" v-model="searchQuery" clearable class="search-input" />
      <el-select v-model="selectedSubject" placeholder="学科" style="width: 120px; margin-left: 10px;">
        <el-option label="全部" value="all" />
        <el-option label="语文" value="chinese" />
        <el-option label="数学" value="math" />
        <el-option label="英语" value="english" />
        <el-option label="物理" value="physics" />
      </el-select>
      <el-select v-model="selectedType" placeholder="类型" style="width: 120px; margin-left: 10px;">
        <el-option label="全部" value="all" />
        <el-option label="PPT" value="ppt" />
        <el-option label="DOC" value="doc" />
        <el-option label="PDF" value="pdf" />
        <el-option label="视频" value="video" />
      </el-select>
    </div>
    
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item @click="navigateToFolder('')">
          <el-icon><HomeFilled /></el-icon> 根目录
        </el-breadcrumb-item>
        <el-breadcrumb-item 
          v-for="(folder, index) in currentPathSegments" 
          :key="index"
          @click="navigateToPath(index)"
        >
          {{ folder }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="content-section">
      <!-- 文件夹和文件列表 -->
      <div v-if="filteredItems.length > 0" class="courseware-list">
        <!-- 文件夹 -->
        <div 
          v-for="folder in filteredFolders" 
          :key="folder.id" 
          class="courseware-card folder-card"
          @click="openFolder(folder.name)"
        >
          <div class="card-thumbnail folder">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="card-info">
            <h3 class="card-title">{{ folder.name }}</h3>
            <p class="card-date">创建时间：{{ formatDate(folder.createTime) }}</p>
            <p class="card-count">{{ folder.itemCount || 0 }}个项目</p>
          </div>
        </div>
        
        <!-- 课件文件 -->
        <div 
          v-for="file in filteredFiles" 
          :key="file.id" 
          class="courseware-card file-card"
        >
          <div class="card-thumbnail" :class="getFileIconClass(file.type)">
            <el-icon v-if="file.type === 'ppt'"><PictureRounded /></el-icon>
            <el-icon v-else-if="file.type === 'doc'"><Document /></el-icon>
            <el-icon v-else-if="file.type === 'pdf'"><Tickets /></el-icon>
            <el-icon v-else-if="file.type === 'video'"><VideoPlay /></el-icon>
          </div>
          <div class="card-info">
            <h3 class="card-title">{{ file.name }}</h3>
            <p class="card-subject">学科：{{ file.subject }}</p>
            <p class="card-date">上传时间：{{ formatDate(file.uploadTime) }}</p>
          </div>
          <div class="card-actions">
            <el-button icon="View" circle title="预览" @click="previewFile(file)"></el-button>
            <el-button icon="Download" circle title="下载" @click="downloadFile(file)"></el-button>
            <el-button icon="Delete" circle title="删除" @click="confirmDeleteFile(file)"></el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredItems.length === 0" class="empty-placeholder">
        <img src="/logo.svg" alt="暂无课件" class="empty-icon" />
        <p class="empty-text">{{ isSearching ? '未找到匹配的课件' : '当前文件夹为空' }}</p>
        <div class="empty-actions">
          <el-button type="primary" @click="createNewFolder" v-if="!isSearching">
            <el-icon><Folder /></el-icon> 新建文件夹
          </el-button>
          <el-button type="success" @click="showUploadDialog" v-if="!isSearching">
            <el-icon><Upload /></el-icon> 上传课件
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 上传课件对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传课件" width="500px">
      <el-form :model="uploadForm" label-position="top">
        <el-form-item label="文件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PPT、PDF、Word 和视频文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="文件名称">
          <el-input v-model="uploadForm.name" placeholder="请输入文件名称"></el-input>
        </el-form-item>
        
        <el-form-item label="学科">
          <el-select v-model="uploadForm.subject" placeholder="请选择学科" style="width: 100%">
            <el-option label="计算机科学" value="计算机科学" />
            <el-option label="数学" value="math" />
            <el-option label="英语" value="english" />
            <el-option label="物理" value="physics" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadFile" :loading="uploading">
            {{ uploading ? '上传中...' : '上传' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 新建文件夹对话框 -->
    <el-dialog v-model="folderDialogVisible" title="新建文件夹" width="400px">
      <el-form :model="folderForm">
        <el-form-item label="文件夹名称">
          <el-input v-model="folderForm.name" placeholder="请输入文件夹名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="folderDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createFolder">创建</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="currentPreviewFile?.name" width="80%" fullscreen destroy-on-close>
      <div class="preview-container" v-if="currentPreviewFile">
        <div v-if="currentPreviewFile.type === 'ppt'" class="ppt-preview">
          <!-- 模拟PPT预览 -->
          <div class="ppt-slide-nav">
            <div 
              v-for="slide in 5" 
              :key="slide" 
              :class="['slide-thumbnail', currentSlide === slide ? 'active' : '']"
              @click="currentSlide = slide"
            >
              幻灯片 {{ slide }}
            </div>
          </div>
          <div class="ppt-slide-view">
            <div class="slide-content">
              <h2>{{ currentPreviewFile.name }} - 幻灯片 {{ currentSlide }}</h2>
              <div class="slide-placeholder">
                <el-icon><PictureRounded /></el-icon>
                <p>幻灯片预览内容</p>
              </div>
            </div>
            <div class="slide-controls">
              <el-button icon="ArrowLeft" @click="prevSlide" :disabled="currentSlide <= 1">上一页</el-button>
              <span>{{ currentSlide }} / 5</span>
              <el-button icon="ArrowRight" @click="nextSlide" :disabled="currentSlide >= 5">下一页</el-button>
            </div>
          </div>
        </div>
        
        <div v-else class="generic-preview">
          <div class="preview-placeholder">
            <el-icon v-if="currentPreviewFile.type === 'doc'"><Document /></el-icon>
            <el-icon v-else-if="currentPreviewFile.type === 'pdf'"><Tickets /></el-icon>
            <el-icon v-else-if="currentPreviewFile.type === 'video'"><VideoPlay /></el-icon>
            <p>{{ getPreviewMessage(currentPreviewFile.type) }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadFile(currentPreviewFile)">下载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { 
  Folder, Upload, Search, HomeFilled, PictureRounded, 
  Document, Tickets, VideoPlay, View, Download, Delete,
  UploadFilled, ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 当前路径
const currentPath = ref('')
const currentPathSegments = computed(() => {
  return currentPath.value ? currentPath.value.split('/').filter(Boolean) : []
})

// 搜索和筛选
const searchQuery = ref('')
const selectedSubject = ref('all')
const selectedType = ref('all')
const isSearching = computed(() => searchQuery.value || selectedSubject.value !== 'all' || selectedType.value !== 'all')

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadForm = ref({
  name: '',
  subject: '',
  file: null
})
const uploading = ref(false)

// 文件夹对话框
const folderDialogVisible = ref(false)
const folderForm = ref({
  name: ''
})

// 预览对话框
const previewDialogVisible = ref(false)
const currentPreviewFile = ref(null)
const currentSlide = ref(1)

// 模拟数据 - 实际项目中应从API获取
const folders = ref([])
const files = ref([])

// 根据当前路径和筛选条件获取要显示的文件夹
const filteredFolders = computed(() => {
  return folders.value.filter(folder => 
    folder.path === currentPath.value && 
    (!searchQuery.value || folder.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// 根据当前路径和筛选条件获取要显示的文件
const filteredFiles = computed(() => {
  return files.value.filter(file => {
    // 路径匹配
    if (file.path !== currentPath.value) return false
    
    // 搜索匹配
    const matchesSearch = !searchQuery.value || 
      file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 学科筛选
    const matchesSubject = selectedSubject.value === 'all' || 
      file.subject === selectedSubject.value
    
    // 类型筛选
    const matchesType = selectedType.value === 'all' || 
      file.type === selectedType.value
    
    return matchesSearch && matchesSubject && matchesType
  })
})

// 合并所有项目用于空状态判断
const filteredItems = computed(() => {
  return [...filteredFolders.value, ...filteredFiles.value]
})

// 获取文件图标样式
const getFileIconClass = (fileType) => {
  const typeClassMap = {
    'ppt': 'ppt-icon',
    'doc': 'doc-icon',
    'pdf': 'pdf-icon',
    'video': 'video-icon'
  }
  return typeClassMap[fileType] || ''
}

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 导航到指定路径
const navigateToPath = (index) => {
  if (index === -1) {
    currentPath.value = ''
  } else {
    currentPath.value = currentPathSegments.value.slice(0, index + 1).join('/')
  }
}

// 导航到根目录
const navigateToFolder = (folderPath) => {
  currentPath.value = folderPath
}

// 打开文件夹
const openFolder = (folderName) => {
  if (currentPath.value) {
    currentPath.value += `/${folderName}`
  } else {
    currentPath.value = folderName
  }
}

// 显示上传对话框
const showUploadDialog = () => {
  uploadForm.value = {
    name: '',
    subject: '',
    file: null
  }
  uploadDialogVisible.value = true
}

// 处理文件选择
const handleFileChange = (file) => {
  if (file) {
    uploadForm.value.file = file.raw
    
    // 如果还没有设置名称，使用文件名作为默认名称
    if (!uploadForm.value.name) {
      const fileName = file.name.split('.')
      fileName.pop() // 移除扩展名
      uploadForm.value.name = fileName.join('.')
    }
  }
}

// 上传文件
const uploadFile = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  
  if (!uploadForm.value.name) {
    ElMessage.warning('请输入文件名称')
    return
  }
  
  if (!uploadForm.value.subject) {
    ElMessage.warning('请选择学科')
    return
  }
  
  uploading.value = true
  
  try {
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟文件扩展名和类型判断
    const fileName = uploadForm.value.file.name
    const extension = fileName.split('.').pop().toLowerCase()
    
    let fileType = 'other'
    if (['ppt', 'pptx'].includes(extension)) fileType = 'ppt'
    else if (['doc', 'docx'].includes(extension)) fileType = 'doc'
    else if (extension === 'pdf') fileType = 'pdf'
    else if (['mp4', 'avi', 'mov'].includes(extension)) fileType = 'video'
    
    // 添加到文件列表
    const newFile = {
      id: Date.now().toString(),
      name: uploadForm.value.name,
      path: currentPath.value,
      subject: uploadForm.value.subject,
      type: fileType,
      size: uploadForm.value.file.size,
      uploadTime: Date.now()
    }
    
    files.value.push(newFile)
    
    ElMessage.success('文件上传成功')
    uploadDialogVisible.value = false
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('文件上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

// 创建新文件夹对话框
const createNewFolder = () => {
  folderForm.value = {
    name: ''
  }
  folderDialogVisible.value = true
}

// 创建文件夹
const createFolder = () => {
  if (!folderForm.value.name) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  
  // 检查同名文件夹
  const folderExists = folders.value.some(f => 
    f.path === currentPath.value && f.name === folderForm.value.name
  )
  
  if (folderExists) {
    ElMessage.warning('当前路径下已存在同名文件夹')
    return
  }
  
  // 创建新文件夹
  const newFolder = {
    id: Date.now().toString(),
    name: folderForm.value.name,
    path: currentPath.value,
    createTime: Date.now(),
    itemCount: 0
  }
  
  folders.value.push(newFolder)
  
  ElMessage.success('文件夹创建成功')
  folderDialogVisible.value = false
}

// 预览文件
const previewFile = (file) => {
  currentPreviewFile.value = file
  currentSlide.value = 1
  previewDialogVisible.value = true
}

// 下载文件
const downloadFile = (file) => {
  ElMessage.success(`已开始下载: ${file.name}`)
}

// 确认删除文件
const confirmDeleteFile = (file) => {
  ElMessageBox.confirm(`确定要删除"${file.name}"吗？此操作不可撤销。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    files.value = files.value.filter(f => f.id !== file.id)
    ElMessage.success('文件已成功删除')
  }).catch(() => {})
}

// 幻灯片控制
const nextSlide = () => {
  if (currentSlide.value < 5) {
    currentSlide.value++
  }
}

const prevSlide = () => {
  if (currentSlide.value > 1) {
    currentSlide.value--
  }
}

// 获取预览信息
const getPreviewMessage = (type) => {
  const messages = {
    'doc': '暂不支持Word文档在线预览，请下载后查看',
    'pdf': '暂不支持PDF在线预览，请下载后查看',
    'video': '暂不支持视频在线播放，请下载后查看'
  }
  return messages[type] || '无法预览此类型文件'
}

// 获取视频文件路径
const getVideoSrc = (file) => {
  // 使用本地文件路径
  return `/api/videos/${encodeURIComponent(file.path)}/${encodeURIComponent(file.filename)}`
}

// 从服务器获取文件和文件夹
const fetchFolders = async () => {
  try {
    const response = await axios.get('/api/folders', {
      params: { 
        path: 'E:\\Code\\Project\\Vue\\vue_project\\vue-PLG\\src\\views\\courseware\\data' + 
              (currentPath.value ? '\\' + currentPath.value : '')
      }
    })
    
    if (response.data && Array.isArray(response.data)) {
      folders.value = response.data
    }
  } catch (error) {
    console.error('获取文件夹失败:', error)
    ElMessage.error('获取文件夹列表失败')
  }
}

const fetchFiles = async () => {
  try {
    const response = await axios.get('/api/files', {
      params: { 
        path: 'E:\\Code\\Project\\Vue\\vue_project\\vue-PLG\\src\\views\\courseware\\data' + 
              (currentPath.value ? '\\' + currentPath.value : '')
      }
    })
    
    if (response.data && Array.isArray(response.data)) {
      files.value = response.data
    }
  } catch (error) {
    console.error('获取文件失败:', error)
    ElMessage.error('获取文件列表失败')
  }
}

// 初始化 - 加载示例数据
onMounted(() => {
  // 示例文件夹
  folders.value = [
    { id: '1', name: '无监督聚类课件', path: '', createTime: Date.now() , itemCount: 2 },
    { id: '2', name: '数学课件', path: '', createTime: Date.now() - 3 * 24 * 60 * 60 * 1000, itemCount: 3 },
    { id: '3', name: '期中复习', path: '语文课件', createTime: Date.now() - 2 * 24 * 60 * 60 * 1000, itemCount: 0 }
  ]
  
  // 示例文件
  files.value = [
    { 
      id: '1', 
      name: '古诗词鉴赏', 
      path: '语文课件', 
      subject: 'chinese', 
      type: 'ppt',
      size: 1024 * 1024 * 2, 
      uploadTime: Date.now() - 5 * 24 * 60 * 60 * 1000 
    },
    { 
      id: '2', 
      name: '平面几何基础', 
      path: '数学课件', 
      subject: 'math', 
      type: 'ppt',
      size: 1024 * 1024 * 1.5, 
      uploadTime: Date.now() - 2 * 24 * 60 * 60 * 1000 
    },
    { 
      id: '3', 
      name: '三角函数公式总结', 
      path: '数学课件', 
      subject: 'math', 
      type: 'pdf',
      size: 1024 * 512, 
      uploadTime: Date.now() - 1 * 24 * 60 * 60 * 1000 
    },
    { 
      id: '4', 
      name: '实验报告要求', 
      path: '数学课件', 
      subject: 'math', 
      type: 'doc',
      size: 1024 * 256, 
      uploadTime: Date.now() - 12 * 60 * 60 * 1000 
    }
  ]
})
</script>

<style scoped>
.courseware-container {
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

.breadcrumb-nav {
  background-color: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.el-breadcrumb-item {
  cursor: pointer;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 500px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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

.empty-actions {
  display: flex;
  gap: 10px;
}

.courseware-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.courseware-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.courseware-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.folder-card {
  cursor: pointer;
  background-color: #f9fbff;
}

.folder-card:hover {
  background-color: #ecf5ff;
}

.card-thumbnail {
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.folder .el-icon {
  font-size: 60px;
  color: #409eff;
}

.ppt-icon, .card-thumbnail.ppt-icon {
  background-color: #f5f5dc;
}

.ppt-icon .el-icon {
  font-size: 60px;
  color: #ff7043;
}

.doc-icon {
  background-color: #e3f2fd;
}

.doc-icon .el-icon {
  font-size: 60px;
  color: #2196f3;
}

.pdf-icon {
  background-color: #fbe9e7;
}

.pdf-icon .el-icon {
  font-size: 60px;
  color: #f44336;
}

.video-icon {
  background-color: #f0f4c3;
}

.video-icon .el-icon {
  font-size: 60px;
  color: #4caf50;
}

.card-info {
  padding: 15px;
}

.card-title {
  font-size: 16px;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subject, .card-date, .card-count {
  font-size: 14px;
  color: #606266;
  margin: 5px 0;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 15px 15px 15px;
  gap: 8px;
}

/* 预览相关样式 */
.preview-container {
  height: 75vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.ppt-preview {
  display: flex;
  height: 100%;
}

.ppt-slide-nav {
  width: 200px;
  padding: 16px;
  background-color: #f0f2f5;
  border-right: 1px solid #dcdfe6;
  overflow-y: auto;
}

.slide-thumbnail {
  padding: 12px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.slide-thumbnail:hover {
  background-color: #f5f7fa;
}

.slide-thumbnail.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.ppt-slide-view {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.slide-content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.slide-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.slide-placeholder .el-icon {
  font-size: 80px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.slide-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.generic-preview {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.preview-placeholder {
  text-align: center;
  padding: 40px;
}

.preview-placeholder .el-icon {
  font-size: 80px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.preview-placeholder p {
  color: #909399;
  font-size: 16px;
}

@media (max-width: 1200px) {
  .courseware-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .ppt-preview {
    flex-direction: column;
  }
  
  .ppt-slide-nav {
    width: 100%;
    height: 150px;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    border-right: none;
    border-bottom: 1px solid #dcdfe6;
  }
  
  .slide-thumbnail {
    min-width: 150px;
    margin-right: 10px;
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .courseware-list {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .header-actions {
    flex-direction: column;
  }
}
</style> 