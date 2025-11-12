<template>
  <div class="ppt-container">
    <div class="ppt-content">
      <div class="feature-card">
        <div class="card-header">
          <el-icon><PictureFilled /></el-icon>
          <h3>PPT生成工具</h3>
        </div>
        <div class="card-content">
          <div class="input-section">
            <el-form :model="form" label-position="top">
              <el-form-item label="PPT主题">
                <el-input
                  v-model="form.theme"
                  placeholder="请输入PPT主题，例如：人工智能发展史"
                  :disabled="loading"
                  @keyup.enter="generatePPTContent"
                />
              </el-form-item>
            </el-form>
            <div class="generate-button">
              <el-button 
                type="primary" 
                :loading="loading" 
                @click="generatePPTContent"
                :icon="loading ? 'Loading' : 'VideoPlay'"
              >
                {{ loading ? '生成中...' : '生成PPT' }}
              </el-button>
            </div>
          </div>

          <div v-if="loading" class="loading-section">
            <div class="progress-info">
              <el-icon class="rotating"><Loading /></el-icon>
              <span>{{ progressText }}</span>
            </div>
            <el-progress 
              :percentage="progress" 
              :status="progress >= 100 ? 'success' : ''"
              :stroke-width="10"
            />
          </div>

          <div v-if="pptContent" class="preview-section">
            <div class="preview-header">
              <h4>生成的PPT内容预览</h4>
              <div class="preview-actions">
                <el-button type="success" size="small" @click="exportPPT">
                  <el-icon><Download /></el-icon> 导出PPT
                </el-button>
                <el-button type="primary" size="small" @click="editContent">
                  <el-icon><Edit /></el-icon> 编辑内容
                </el-button>
              </div>
            </div>
            <div class="preview-content">
              <div v-for="(slide, index) in parsedContent" :key="index" class="slide-preview">
                <div class="slide-header">第 {{ index + 1 }} 页</div>
                <div class="slide-content" v-html="formatContent(slide)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑PPT内容"
      width="80%"
      :before-close="handleEditClose"
    >
      <el-input
        v-model="editingContent"
        type="textarea"
        :rows="15"
        placeholder="编辑PPT内容"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditClose">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { generatePPT } from '@/api/xunfei';
import { marked } from 'marked';
import { 
  PictureFilled, 
  Loading, 
  Download, 
  Edit,
  VideoPlay
} from '@element-plus/icons-vue';
import pptxgen from 'pptxgenjs';

const form = ref({
  theme: ''
});

const loading = ref(false);
const progress = ref(0);
const progressText = ref('正在生成PPT内容...');
const pptContent = ref('');
const editDialogVisible = ref(false);
const editingContent = ref('');

// 解析PPT内容为幻灯片数组
const parsedContent = computed(() => {
  if (!pptContent.value) return [];
  return pptContent.value.split('---').map(slide => slide.trim());
});

// 格式化内容（支持Markdown）
const formatContent = (content) => {
  return marked(content);
};

// 生成PPT内容
const generatePPTContent = async () => {
  if (!form.value.theme) {
    ElMessage.warning('请输入PPT主题');
    return;
  }

  loading.value = true;
  progress.value = 0;
  
  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += 10;
      }
    }, 1000);

    const response = await generatePPT(form.value.theme);
    clearInterval(progressInterval);
    progress.value = 100;
    
    // 假设response.data.content包含生成的内容
    pptContent.value = response.data.content;
    ElMessage.success('PPT内容生成成功！');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
};

// 导出PPT
const exportPPT = async () => {
  try {
    const pres = new pptxgen();
    
    parsedContent.value.forEach((slide, index) => {
      const newSlide = pres.addSlide();
      
      // 如果是第一页，使用标题布局
      if (index === 0) {
        newSlide.addText(slide, {
          x: '10%',
          y: '40%',
          w: '80%',
          fontSize: 44,
          align: 'center',
          bold: true
        });
      } else {
        // 其他页面使用普通布局
        newSlide.addText(slide, {
          x: '5%',
          y: '5%',
          w: '90%',
          h: '90%',
          fontSize: 24,
          align: 'left'
        });
      }
    });

    await pres.writeFile({ fileName: `${form.value.theme}_PPT.pptx` });
    ElMessage.success('PPT导出成功！');
  } catch (error) {
    console.error('导出PPT失败:', error);
    ElMessage.error('导出PPT失败，请重试');
  }
};

// 编辑内容
const editContent = () => {
  editingContent.value = pptContent.value;
  editDialogVisible.value = true;
};

// 处理编辑对话框关闭
const handleEditClose = () => {
  editDialogVisible.value = false;
  editingContent.value = '';
};

// 保存编辑
const saveEdit = () => {
  pptContent.value = editingContent.value;
  editDialogVisible.value = false;
  ElMessage.success('内容已更新');
};
</script>

<style scoped>
.ppt-container {
  padding: 20px;
  height: 100%;
}

.ppt-content {
  height: 100%;
}

.feature-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.card-header .el-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.card-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.input-section {
  max-width: 800px;
  margin: 0 auto;
}

.generate-button {
  text-align: center;
  margin-top: 20px;
}

.loading-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #409eff;
}

.progress-info .rotating {
  animation: rotate 1s linear infinite;
  margin-right: 8px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.preview-section {
  margin-top: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.preview-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h4 {
  margin: 0;
  color: #333;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-content {
  padding: 20px;
}

.slide-preview {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.slide-header {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #409eff;
  font-weight: 500;
}

.slide-content {
  line-height: 1.6;
}

:deep(.slide-content h1) {
  font-size: 24px;
  margin-bottom: 16px;
}

:deep(.slide-content h2) {
  font-size: 20px;
  margin-bottom: 12px;
}

:deep(.slide-content ul),
:deep(.slide-content ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

:deep(.slide-content li) {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .preview-actions .el-button {
    flex: 1;
  }
}
</style> 