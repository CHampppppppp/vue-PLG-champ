<template>
  <div class="video-player-container">
    <h1>视频播放器</h1>

    <div class="video-grid">
      <div class="video-item" v-for="v in videos" :key="v.src">
        <h3>{{ v.name }}</h3>
        <div class="video-wrapper">
          <video 
            class="main-video" 
            :src="v.src" 
            controls 
            preload="metadata"
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      </div>
    </div>

    <div class="video-info">
      <p class="note">
        请将视频文件放在项目的 <code>public/videos</code> 目录下并命名为上述文件名，例如：<code>public/videos/bigO.mp4</code>。
      </p>
    </div>

    <div class="actions">
      <button @click="goBack">返回</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 在 public/videos 下放置文件后即可直接播放
const videos = ref([
  { name: 'bigO.mp4', src: '/videos/bigO.mp4' },
  { name: 'sorting.mp4', src: '/videos/bigO_1.mp4' }
])

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.video-player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  text-align: center;
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.video-item h3 {
  margin: 0 0 10px;
}

.video-wrapper {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-video {
  max-width: 100%;
  max-height: 60vh;
}

.video-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.note {
  color: #606266;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: center;
}

.actions button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.actions button:hover {
  background-color: #66b1ff;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>