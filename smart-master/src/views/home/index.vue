<template>
  <div class="home-container">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <img src="/logo.svg" alt="SMART" class="logo" />
        <h2>智能备课系统</h2>
      </div>
      
      <div class="menu-container">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
        >
          <el-menu-item index="/home/preview">
            <el-icon><Edit /></el-icon>
            <span>预习题生成</span>
          </el-menu-item>
          <el-menu-item index="/home/ai-comparison">
            <el-icon><Monitor /></el-icon>
            <span>智能备课</span>
          </el-menu-item>
          <el-menu-item index="/home/learning-analytics">
            <el-icon><Monitor /></el-icon>
            <span>学情分析</span>
          </el-menu-item>
          
          <el-menu-item index="/home/courseware">
            <el-icon><Files /></el-icon>
            <span>课件</span>
          </el-menu-item>
          
          <el-menu-item index="/home/lesson-plan">
            <el-icon><Reading /></el-icon>
            <span>教案</span>
          </el-menu-item>
          
          <el-menu-item index="/home/resources">
            <el-icon><Folder /></el-icon>
            <span>资料</span>
          </el-menu-item>
          
          <el-menu-item index="/home/homework">
            <el-icon><Edit /></el-icon>
            <span>作业</span>
          </el-menu-item>
          
          <el-menu-item index="/home/exam">
            <el-icon><Aim /></el-icon>
            <span>考试</span>
          </el-menu-item>
          
          <el-menu-item index="/home/question-bank">
            <el-icon><Collection /></el-icon>
            <span>题库</span>
          </el-menu-item>
          
        
        </el-menu>
      </div>
    </div>
    
    <!-- 内容主区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
        <!-- 顶部导航栏 -->
        <div class="header">
        <!-- <div class="tool-tabs">
          <el-tabs v-model="activeTool" @tab-click="handleToolChange" class="nav-tabs">
            <el-tab-pane label="SMART备课" name="ai-comparison"></el-tab-pane>
            <el-tab-pane label="学习助手" name="learning-assistant"></el-tab-pane>
            <el-tab-pane label="资料助手" name="resource-assistant"></el-tab-pane>
            <el-tab-pane label="课件" name="courseware"></el-tab-pane>
            <el-tab-pane label="教案" name="lesson-plan"></el-tab-pane>
            <el-tab-pane label="作业" name="homework"></el-tab-pane>
            <el-tab-pane label="资料" name="resources"></el-tab-pane>
          </el-tabs>
        </div> -->
        
        <div class="header-right">
          <el-button link type="primary" class="history-btn" @click="showHistoryDialog = true">
            <el-icon><Timer /></el-icon>
            <span>查看历史记录</span>
          </el-button>
          
          <div class="user-info">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="avatar-container">
                <el-avatar :size="36" :src="userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="user-avatar"></el-avatar>
                <span class="username">{{ userInfo.username || '用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <!-- <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>设置
                  </el-dropdown-item> -->
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- <el-tooltip content="系统设置" placement="bottom" effect="light">
            <el-button circle class="settings-btn" @click="openSettings">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip> -->
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
    
    <!-- 历史记录对话框 -->
    <el-dialog v-model="showHistoryDialog" title="历史消息" width="50%">
      <div class="history-list">
        <div v-if="historyMessages.length === 0" class="empty-history">
          暂无历史消息
        </div>
        <div v-else class="history-item" v-for="(item, index) in historyMessages" :key="index">
          <p class="history-time">{{ item.time }}</p>
          <p class="history-content">{{ item.content }}</p>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 当前激活的菜单和工具
const route = useRoute()
const activeMenu = computed(() => route.path)
const activeTool = computed(() => {
  const path = route.path
  if (path.startsWith('/home/')) {
    return path.split('/home/')[1]
  }
  return 'ai-comparison'
})

// 历史消息相关
const showHistoryDialog = ref(false)
const historyMessages = ref([])

// 处理工具切换
const handleToolChange = (tab) => {
  router.push(`/home/${tab.props.name}`)
}

// 切换到指定工具
const switchTool = (tool) => {
  activeTool.value = tool
  router.push(`/home/${tool}`)
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
  if(command === 'profile'){
    router.push('/home/profile')
  }
}


// 初始化
onMounted(() => {
  try {
    // 获取历史消息
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    historyMessages.value = history
  } catch (error) {
    console.error('Error loading history:', error)
  }
  
  // 初始化时无需手动设置，依赖 route 响应式即可
})

</script>

<style scoped lang="scss">
.home-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 左侧菜单 - 优化 */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #151f2a 0%, #1e2a3a 100%);
  color: white;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 6px 0 16px rgba(0, 0, 0, 0.2);
  }
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
  }
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: rotate(15deg);
  }
}

.logo-container h2 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
}

:deep(.sidebar-menu) {
  border-right: none;
  background-color: transparent;
  
  .el-menu-item {
    height: 48px;
    line-height: 48px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    margin: 4px 8px;
    padding: 0 12px;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:not(.is-active):hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%);
      color: #fff;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-left: 3px solid #409EFF;
    }
    
    i {
      color: rgba(255, 255, 255, 0.85);
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    &.is-active i {
      color: #409EFF;
    }
    
    span {
      margin-left: 10px;
      font-weight: 400;
      transition: all 0.3s ease;
    }
    
    &.is-active span {
      font-weight: 500;
    }
  }
}

/* 主内容区域 - 优化 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 顶部导航栏 - 优化 */
.header {
  height: 64px;
  background-color: #21252e;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 9;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.tool-tabs {
  flex: 1;
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  
  .history-btn {
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.3s ease;
    
    &:hover {
      color: rgba(95, 166, 236, 0.74);
      transform: scale(1.1);
    }
    
    .el-icon {
      margin-right: 6px;
      font-size: 16px;
    }
    
    span {
      font-size: 14px;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  :deep(.el-dropdown) {
    display: flex;
    align-items: center;
  }
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .user-avatar {
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  .username {
    font-size: 14px;
    color: #4583f5;
    font-weight: 500;
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition:all 0.3s ease;
  }
  
  .el-icon {
    color: #999;
    font-size: 12px;
    transition: all 0.3s ease;
  }
  
  &:hover .username {
    color: rgba(120, 176, 231, 0.74);
    transform: scale(1.1);
  }
  &:hover .el-icon {
    color: rgba(120, 176, 231, 0.74);
    transform: scale(1.5);
  }
}

.settings-btn {
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.1);
    color: #409EFF;
    transform: rotate(30deg);
  }
}

/* 内容区域 - 优化 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
  scroll-behavior: smooth;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
}

/* 历史消息对话框 - 优化 */
:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  .el-dialog__header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-right: 0;
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: 0;
  }
}

.history-list {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
}

.empty-history {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
  
  .el-icon {
    font-size: 24px;
    margin-bottom: 10px;
    color: #ccc;
  }
}

.history-item {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.history-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    background-color: #409EFF;
    border-radius: 50%;
    margin-right: 8px;
    opacity: 0.6;
  }
}

.history-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  padding-left: 20px;
  border-left: 2px solid rgba(64, 158, 255, 0.3);
  margin-left: 6px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .sidebar {
    width: 200px;
  }
  
  .logo-container h2 {
    font-size: 16px;
  }
  
  :deep(.sidebar-menu .el-menu-item) {
    font-size: 13px;
    padding: 0 8px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .header-right {
    gap: 8px;
    
    .history-btn span {
      display: none;
    }
  }
  
  .username {
    display: none;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.history-item {
  animation: fadeIn 0.3s ease forwards;
  opacity: 0;
  
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: $i * 0.05s;
    }
  }
}
</style>