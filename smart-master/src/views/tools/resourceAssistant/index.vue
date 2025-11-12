<template>
  <div class="resource-container">
    <h2 class="page-title">资料助手</h2>
    <div class="resource-content">
      <div class="search-panel">
        <div class="search-header">
          <h3>资料检索</h3>
        </div>
        <div class="search-form">
          <el-input
            placeholder="输入关键词搜索教学资料..."
            v-model="searchKeyword"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <div class="filter-options">
            <el-select v-model="resourceType" placeholder="资料类型" class="filter-item">
              <el-option label="全部" value="all" />
              <el-option label="课件" value="slide" />
              <el-option label="教案" value="plan" />
              <el-option label="习题" value="exercise" />
              <el-option label="视频" value="video" />
            </el-select>
            
            <el-select v-model="sortBy" placeholder="排序方式" class="filter-item">
              <el-option label="最新上传" value="newest" />
              <el-option label="最多下载" value="downloads" />
              <el-option label="最高评分" value="rating" />
            </el-select>
            
            <el-button type="primary" @click="searchResources">搜索</el-button>
          </div>
        </div>
      </div>
      
      <div class="resource-list">
        <div class="resource-item">
          <div class="resource-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="resource-info">
            <h4>大学物理动量守恒与碰撞详解</h4>
            <div class="resource-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                2024-05-10
              </span>
              <span class="meta-item">
                <el-icon><Download /></el-icon>
                258 次下载
              </span>
              <span class="meta-item">
                <el-icon><Star /></el-icon>
                4.8 分
              </span>
            </div>
            <p class="resource-desc">本资料详细讲解了动量守恒定律在不同碰撞类型中的应用，包含多个例题和习题解析。</p>
            <div class="resource-tags">
              <el-tag size="small" type="info">动量</el-tag>
              <el-tag size="small" type="info">碰撞</el-tag>
              <el-tag size="small" type="info">物理</el-tag>
            </div>
          </div>
          <div class="resource-actions">
            <el-button type="primary" size="small" icon="Download">下载</el-button>
            <el-button size="small" icon="View">预览</el-button>
          </div>
        </div>
        
        <div class="resource-item">
          <div class="resource-icon video">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="resource-info">
            <h4>波动光学实验演示视频</h4>
            <div class="resource-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                2024-06-01
              </span>
              <span class="meta-item">
                <el-icon><Download /></el-icon>
                142 次下载
              </span>
              <span class="meta-item">
                <el-icon><Star /></el-icon>
                4.6 分
              </span>
            </div>
            <p class="resource-desc">高清实验演示视频，包含干涉、衍射等经典光学实验的详细过程和结果分析。</p>
            <div class="resource-tags">
              <el-tag size="small" type="info">波动光学</el-tag>
              <el-tag size="small" type="info">实验</el-tag>
              <el-tag size="small" type="info">视频</el-tag>
            </div>
          </div>
          <div class="resource-actions">
            <el-button type="primary" size="small" icon="Download">下载</el-button>
            <el-button size="small" icon="View">观看</el-button>
          </div>
        </div>
        
        <div class="resource-item">
          <div class="resource-icon exercise">
            <el-icon><Files /></el-icon>
          </div>
          <div class="resource-info">
            <h4>电磁学习题集（含详解）</h4>
            <div class="resource-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                2024-05-25
              </span>
              <span class="meta-item">
                <el-icon><Download /></el-icon>
                320 次下载
              </span>
              <span class="meta-item">
                <el-icon><Star /></el-icon>
                4.9 分
              </span>
            </div>
            <p class="resource-desc">覆盖电磁学各个章节的精选习题，难度从基础到提高，每道题都有详细解答和分析。</p>
            <div class="resource-tags">
              <el-tag size="small" type="info">电磁学</el-tag>
              <el-tag size="small" type="info">习题</el-tag>
              <el-tag size="small" type="info">详解</el-tag>
            </div>
          </div>
          <div class="resource-actions">
            <el-button type="primary" size="small" icon="Download">下载</el-button>
            <el-button size="small" icon="View">预览</el-button>
          </div>
        </div>
      </div>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="50"
          :page-size="10"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchKeyword = ref('')
const resourceType = ref('all')
const sortBy = ref('newest')
const currentPage = ref(1)

const searchResources = () => {
  // 模拟搜索功能
  console.log('搜索关键词:', searchKeyword.value)
  console.log('资料类型:', resourceType.value)
  console.log('排序方式:', sortBy.value)
}

const handlePageChange = (page) => {
  currentPage.value = page
  // 模拟分页
  console.log('切换到页码:', page)
}
</script>

<style scoped>
.resource-container {
  padding: 20px;
  height: 100%;
  width: 100%;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.resource-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-header {
  background: #f5f7fa;
  padding: 15px 20px;
}

.search-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.search-form {
  padding: 20px;
}

.search-input {
  margin-bottom: 15px;
}

.filter-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 150px;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  display: flex;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.resource-icon {
  width: 50px;
  height: 50px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.resource-icon .el-icon {
  font-size: 24px;
}

.resource-icon.video {
  background: #f0f9eb;
  color: #67c23a;
}

.resource-icon.exercise {
  background: #fdf6ec;
  color: #e6a23c;
}

.resource-info {
  flex: 1;
}

.resource-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.resource-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.meta-item .el-icon {
  margin-right: 5px;
  font-size: 14px;
}

.resource-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.resource-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  margin-left: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 