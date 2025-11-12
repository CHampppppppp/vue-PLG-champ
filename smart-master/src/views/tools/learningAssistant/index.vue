<template>
  <div class="learning-container">
    <h2 class="page-title">学习助手</h2>
    <div class="learning-content">
      <div class="feature-card">
        <div class="card-header">
          <el-icon><Reading /></el-icon>
          <h3>学习任务</h3>
        </div>
        <div class="card-content">
          <div class="task-list">
            <div class="task-item">
              <div class="task-status completed"></div>
              <div class="task-info">
                <h4>高斯定理与电磁学</h4>
                <p>完成时间: 2024-06-01 10:30</p>
              </div>
              <el-button size="small" type="primary">查看详情</el-button>
            </div>
            
            <div class="task-item">
              <div class="task-status active"></div>
              <div class="task-info">
                <h4>质点运动学基础</h4>
                <p>剩余时间: 2天</p>
              </div>
              <el-button size="small" type="success">继续学习</el-button>
            </div>
            
            <div class="task-item">
              <div class="task-status"></div>
              <div class="task-info">
                <h4>牛顿力学三大定律</h4>
                <p>截止日期: 2024-06-15</p>
              </div>
              <el-button size="small">开始学习</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="card-header">
          <el-icon><Histogram /></el-icon>
          <h3>学习进度</h3>
        </div>
        <div class="card-content">
          <div class="progress-chart">
            <div class="chart-placeholder">
              <div class="chart-bar">
                <div class="bar-item" style="height: 40%;">
                  <div class="bar-label">第一章</div>
                </div>
                <div class="bar-item" style="height: 65%;">
                  <div class="bar-label">第二章</div>
                </div>
                <div class="bar-item" style="height: 30%;">
                  <div class="bar-label">第三章</div>
                </div>
                <div class="bar-item active" style="height: 45%;">
                  <div class="bar-label">第四章</div>
                </div>
                <div class="bar-item" style="height: 10%;">
                  <div class="bar-label">第五章</div>
                </div>
              </div>
            </div>
            <div class="chart-summary">
              <div class="summary-item">
                <div class="summary-label">总体进度</div>
                <div class="summary-value">38%</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">已完成章节</div>
                <div class="summary-value">2/5</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">当前章节</div>
                <div class="summary-value">第四章</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 占位脚本，无需实际功能
</script>

<style scoped>
.learning-container {
  padding: 20px;
  height: 100%;
  width: 100%;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.learning-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.feature-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  background: #f5f7fa;
  padding: 15px 20px;
  display: flex;
  align-items: center;
}

.card-header .el-icon {
  font-size: 24px;
  margin-right: 10px;
  color: #409eff;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card-content {
  padding: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 6px;
  background: #f9f9f9;
}

.task-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dcdfe6;
  margin-right: 15px;
}

.task-status.completed {
  background: #67c23a;
}

.task-status.active {
  background: #409eff;
}

.task-info {
  flex: 1;
}

.task-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.task-info p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.progress-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 6px;
}

.chart-bar {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: flex-end;
}

.bar-item {
  width: 40px;
  background: #dcdfe6;
  border-radius: 4px 4px 0 0;
  position: relative;
}

.bar-item.active {
  background: #409eff;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.chart-summary {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
</style> 