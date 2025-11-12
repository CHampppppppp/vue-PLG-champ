<template>
  <div class="resources-container">
    <div class="page-header">
      <h1 class="page-title">视频资源管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showUploadDialog">
          <el-icon><Upload /></el-icon> 上传视频
        </el-button>
      </div>
    </div>
    
    <div class="filter-section">
      <el-input v-model="searchQuery" placeholder="搜索视频" prefix-icon="Search" clearable class="search-input" />
      <el-select v-model="sortOption" placeholder="排序方式" style="width: 140px; margin-left: 10px;">
        <el-option label="最近上传" value="time" />
        <el-option label="名称" value="name" />
        <el-option label="大小" value="size" />
      </el-select>
    </div>
    
    <div class="content-section">
      <!-- 视频资源列表 -->
      <div v-if="filteredVideoList.length > 0" class="video-grid">
        <div 
          v-for="video in filteredVideoList" 
          :key="video.id" 
          class="video-card"
          @click="previewVideo(video)"
        >
          <div class="video-thumbnail">
            <video 
              :src="video.objectUrl" 
              class="thumbnail-preview" 
              preload="metadata"
            ></video>
            <div class="play-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="video-info">
            <div class="video-name">{{ video.name }}</div>
            <div class="video-meta">
              {{ formatFileSize(video.size) }} · {{ formatDate(video.uploadTime) }}
            </div>
          </div>
          <div class="video-actions">
            <el-button icon="VideoPlay" circle title="播放" @click.stop="previewVideo(video)"></el-button>
            <el-button icon="Download" circle title="下载" @click.stop="downloadVideo(video)"></el-button>
            <el-button icon="Delete" circle title="删除" @click.stop="confirmDeleteVideo(video)"></el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-placeholder">
        <el-icon class="empty-icon"><VideoCamera /></el-icon>
        <p class="empty-text">{{ isLoading ? '正在加载视频资源...' : '暂无视频资源' }}</p>
        <el-button v-if="!isLoading" type="primary" @click="showUploadDialog">
          <el-icon><Upload /></el-icon> 上传视频
        </el-button>
      </div>
    </div>
    
    <!-- 上传视频对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传视频" width="500px">
      <el-form :model="uploadForm" label-position="top">
        <el-form-item label="视频文件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept="video/*"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽视频文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 MP4、AVI、MOV、WebM 等常见视频格式
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="视频名称">
          <el-input v-model="uploadForm.name" placeholder="请输入视频名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadVideo" :loading="uploading">
            {{ uploading ? '上传中...' : '上传' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 视频预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="currentVideo?.name" width="80%" fullscreen destroy-on-close>
      <div class="preview-container" v-if="currentVideo">
        <div class="video-player-container">
          <video 
            ref="videoPlayer" 
            class="video-player" 
            :src="currentVideo.objectUrl"
            controls 
            autoplay
          >
            您的浏览器不支持视频播放
          </video>
        </div>
        <div class="video-details">
          <h3>{{ currentVideo.name }}</h3>
          <p>文件大小: {{ formatFileSize(currentVideo.size) }}</p>
          <p>上传时间: {{ formatDate(currentVideo.uploadTime) }}</p>
          <p>文件类型: {{ currentVideo.type }}</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadVideo(currentVideo)">下载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { 
  Upload, Search, Download, Delete, VideoPlay, VideoCamera, UploadFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 视频列表
const videoList = ref([])
const isLoading = ref(true)

// 搜索和排序
const searchQuery = ref('')
const sortOption = ref('time')

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadForm = ref({
  name: '',
  file: null
})
const uploading = ref(false)

// 预览对话框
const previewDialogVisible = ref(false)
const currentVideo = ref(null)
const videoPlayer = ref(null)

// 对象URL集合 - 用于清理释放
const objectUrls = ref([])

// 根据搜索和排序条件过滤视频列表
const filteredVideoList = computed(() => {
  let result = videoList.value;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(video => 
      video.name.toLowerCase().includes(query)
    );
  }
  
  // 排序
  result = [...result].sort((a, b) => {
    if (sortOption.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption.value === 'size') {
      return b.size - a.size;
    } else {
      // 默认按时间排序（最新的在前面）
      return b.uploadTime - a.uploadTime;
    }
  });
  
  return result;
});

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知日期';
  
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 从本地存储加载视频列表
const loadVideosFromLocalStorage = () => {
  isLoading.value = true;
  
  try {
    // 从localStorage获取存储的视频信息
    const savedVideos = localStorage.getItem('videoResources');
    
    if (savedVideos) {
      const parsedVideos = JSON.parse(savedVideos);
      
      // 创建临时对象URL来预览视频
      videoList.value = parsedVideos.map(video => {
        // 如果有存储的视频数据，从localStorage获取并转换为Blob
        let blob = null;
        
        if (video.dataKey) {
          const videoData = localStorage.getItem(video.dataKey);
          
          if (videoData) {
            // 将Base64字符串转换回Blob
            const byteCharacters = atob(videoData);
            const byteArrays = [];
            
            for (let i = 0; i < byteCharacters.length; i += 512) {
              const slice = byteCharacters.slice(i, i + 512);
              
              const byteNumbers = new Array(slice.length);
              for (let j = 0; j < slice.length; j++) {
                byteNumbers[j] = slice.charCodeAt(j);
              }
              
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            blob = new Blob(byteArrays, { type: video.type });
          }
        }
        
        // 创建临时URL (如果没有视频数据，则使用模拟URL)
        const objectUrl = blob ? URL.createObjectURL(blob) : null;
        
        if (objectUrl) {
          objectUrls.value.push(objectUrl);
        }
        
        return {
          ...video,
          objectUrl: objectUrl || 'data:,', // 如果没有实际数据，提供一个空URL
          id: video.id || Date.now() + Math.random().toString(36).substring(2, 10)
        };
      });
    } else {
      // 没有保存的视频，使用模拟数据
      videoList.value = [];
    }
  } catch (error) {
    console.error('加载视频失败:', error);
    ElMessage.error('加载视频列表失败');
    videoList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 从 public/videos/index.json 加载本地静态视频
const loadStaticVideos = async () => {
  try {
    const resp = await fetch('/videos/index.json');
    if (!resp.ok) return;
    const files = await resp.json();
    if (!Array.isArray(files)) return;

    const existingUrls = new Set(videoList.value.map(v => v.objectUrl));

    files.forEach((entry, idx) => {
      // 允许两种格式：字符串文件名 或 元数据对象
      if (typeof entry === 'string') {
        const f = entry;
        if (!f.toLowerCase().endsWith('.mp4')) return;
        const src = `/videos/${f}`;
        if (existingUrls.has(src)) return;
        videoList.value.push({
          id: `static-${idx}-${f}`,
          name: f.replace(/\.[^/.]+$/, ''),
          type: 'video/mp4',
          size: 0,
          uploadTime: Date.now(),
          objectUrl: src,
          dataKey: null
        });
      } else if (entry && typeof entry === 'object') {
        const f = entry.file;
        if (!f || !String(f).toLowerCase().endsWith('.mp4')) return;
        const src = `/videos/${f}`;
        if (existingUrls.has(src)) return;
        // 解析大小与时间（支持数字或ISO日期字符串）
        const sizeVal = typeof entry.size === 'number' ? entry.size : 0;
        let uploadTs = Date.now();
        if (typeof entry.uploadTime === 'number') {
          uploadTs = entry.uploadTime;
        } else if (typeof entry.uploadTime === 'string') {
          const parsed = Date.parse(entry.uploadTime);
          uploadTs = isNaN(parsed) ? Date.now() : parsed;
        }
        videoList.value.push({
          id: entry.id || `static-${idx}-${f}`,
          name: entry.name || f.replace(/\.[^/.]+$/, ''),
          type: entry.type || 'video/mp4',
          size: sizeVal,
          uploadTime: uploadTs,
          objectUrl: src,
          dataKey: null
        });
      }
    });
  } catch (e) {
    // 静默失败，不影响页面其他功能
    console.warn('加载本地静态视频失败', e);
  }
};

// 保存视频列表到本地存储
const saveVideosToLocalStorage = () => {
  try {
    // 只保存元数据，不包括URL
    const videoMetadata = videoList.value.map(({ objectUrl, ...metadata }) => metadata);
    localStorage.setItem('videoResources', JSON.stringify(videoMetadata));
  } catch (error) {
    console.error('保存视频列表失败:', error);
    ElMessage.error('保存视频列表失败');
  }
};

// 创建对象URL，并确保在组件销毁时清理
const createObjectURL = (file) => {
  const url = URL.createObjectURL(file);
  objectUrls.value.push(url);
  return url;
};

// 清理对象URL
const revokeObjectURLs = () => {
  objectUrls.value.forEach(url => {
    URL.revokeObjectURL(url);
  });
  objectUrls.value = [];
};

// 显示上传对话框
const showUploadDialog = () => {
  uploadForm.value = {
    name: '',
    file: null
  };
  uploadDialogVisible.value = true;
};

// 处理文件选择
const handleFileChange = (file) => {
  if (file) {
    uploadForm.value.file = file.raw;
    
    // 如果还没有设置名称，使用文件名作为默认名称
    if (!uploadForm.value.name) {
      const fileName = file.name.split('.');
      fileName.pop(); // 移除扩展名
      uploadForm.value.name = fileName.join('.');
    }
  }
};

// 上传视频到本地存储
const uploadVideo = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择要上传的视频文件');
    return;
  }
  
  if (!uploadForm.value.name) {
    ElMessage.warning('请输入视频名称');
    return;
  }
  
  uploading.value = true;
  
  try {
    const file = uploadForm.value.file;
    const videoId = Date.now().toString();
    const dataKey = `video_data_${videoId}`;
    
    // 创建文件的预览URL
    const objectUrl = createObjectURL(file);
    
    // 将视频文件保存到localStorage (这里可能会受到localStorage大小限制)
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        // 获取Base64编码的数据，移除开头的类型信息
        const base64Data = e.target.result.split(',')[1];
        
        // 保存视频数据
        localStorage.setItem(dataKey, base64Data);
        
        // 添加到视频列表
        const newVideo = {
          id: videoId,
          name: uploadForm.value.name,
          type: file.type,
          size: file.size,
          uploadTime: Date.now(),
          objectUrl: objectUrl,
          dataKey: dataKey
        };
        
        videoList.value.push(newVideo);
        
        // 保存视频列表
        saveVideosToLocalStorage();
        
        ElMessage.success('视频上传成功');
        uploadDialogVisible.value = false;
      } catch (err) {
        // localStorage可能会有大小限制
        console.error('保存视频数据失败:', err);
        ElMessage.error('视频文件过大，无法保存。请选择较小的视频文件。');
        URL.revokeObjectURL(objectUrl);
      } finally {
        uploading.value = false;
      }
    };
    
    reader.onerror = function() {
      console.error('读取文件失败');
      ElMessage.error('读取视频文件失败');
      uploading.value = false;
      URL.revokeObjectURL(objectUrl);
    };
    
    // 开始读取文件
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error(`视频上传失败: ${error.message || '请重试'}`);
    uploading.value = false;
  }
};

// 预览视频
const previewVideo = (video) => {
  currentVideo.value = video;
  previewDialogVisible.value = true;
  
  // 等待DOM更新后初始化视频播放器
  nextTick(() => {
    if (videoPlayer.value) {
      videoPlayer.value.load();
    }
  });
};

// 下载视频
const downloadVideo = (video) => {
  if (!video || !video.objectUrl) {
    ElMessage.warning('无法下载此视频');
    return;
  }
  
  // 创建下载链接
  const link = document.createElement('a');
  link.href = video.objectUrl;
  link.download = video.name + (video.type ? '.' + video.type.split('/')[1] : '.mp4');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  ElMessage.success(`已开始下载: ${video.name}`);
};

// 确认删除视频
const confirmDeleteVideo = (video) => {
  ElMessageBox.confirm(`确定要删除"${video.name}"吗？此操作不可撤销。`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从localStorage中删除视频数据
    if (video.dataKey) {
      localStorage.removeItem(video.dataKey);
    }
    
    // 从列表中移除
    videoList.value = videoList.value.filter(v => v.id !== video.id);
    
    // 更新本地存储
    saveVideosToLocalStorage();
    
    // 释放对象URL
    if (video.objectUrl) {
      URL.revokeObjectURL(video.objectUrl);
    }
    
    ElMessage.success('视频已成功删除');
  }).catch(() => {});
};

// 初始化 - 加载视频列表
onMounted(async () => {
  loadVideosFromLocalStorage();
  await loadStaticVideos();
});

// 组件销毁前清理资源
onBeforeUnmount(() => {
  revokeObjectURLs();
});
</script>

<style scoped>
.resources-container {
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

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.video-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  background-color: #f9fbff;
}

.video-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
  background-color: #ecf5ff;
}

.video-thumbnail {
  height: 160px;
  position: relative;
  overflow: hidden;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.thumbnail-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 48px;
  opacity: 0.8;
  transition: all 0.3s;
}

.video-card:hover .play-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.video-info {
  padding: 15px;
}

.video-name {
  font-size: 16px;
  margin-bottom: 5px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-meta {
  font-size: 12px;
  color: #909399;
}

.video-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 15px 15px 15px;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-card:hover .video-actions {
  opacity: 1;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #909399;
  margin-bottom: 20px;
}

/* 视频预览样式 */
.preview-container {
  display: flex;
  flex-direction: column;
  height: 75vh;
}

.video-player-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.video-player {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.video-details {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.video-details h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
}

.video-details p {
  margin: 8px 0;
  color: #606266;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .preview-container {
    height: auto;
  }
  
  .video-player-container {
    height: 50vh;
  }
}
</style>