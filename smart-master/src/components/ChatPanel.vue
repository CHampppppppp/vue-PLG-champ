<template>
  <div class="chat-panel">
    <div class="header">
      <h3>AI工作台</h3>
      <span class="tag">{{ title }}</span>
    </div>
    <div class="messages">
      <div v-if="messages.length === 0" class="empty">请输入问题开始对话</div>
      <div v-else>
        <div v-for="(m, i) in messages" :key="i" class="message">{{ m }}</div>
      </div>
    </div>
    <div class="input-area">
      <el-input v-model="input" placeholder="输入您的问题..." @keyup.enter="sendMessage" />
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  toolType: { type: String, default: '' }
})

const input = ref('')
const messages = ref([])

const title = computed(() => {
  const map = {
    aiAnalysis: 'AI分析',
    learningAssistant: '学习助手',
    resourceAssistant: '资料助手',
    aiComparison: 'AI对话'
  }
  return map[props.toolType] || '智能分析'
})

function sendMessage () {
  if (!input.value.trim()) return
  messages.value.push(input.value.trim())
  input.value = ''
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.tag {
  font-size: 12px;
  color: #409EFF;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 12px;
}
.messages {
  flex: 1;
  overflow: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}
.empty {
  color: #9ca3af;
  font-size: 13px;
}
.message {
  background: #f9fafb;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.input-area {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
</style>