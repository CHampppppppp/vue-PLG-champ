import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false,
      threshold: 1024
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
      threshold: 1024
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api/xunfei': {
        target: 'https://zwapi.xfyun.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/xunfei/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 保留原始请求头
            proxyReq.setHeader('Host', 'zwapi.xfyun.cn');
            if (req.headers['appid']) {
              proxyReq.setHeader('appId', req.headers['appid']);
            }
            if (req.headers['timestamp']) {
              proxyReq.setHeader('timestamp', req.headers['timestamp']);
            }
            if (req.headers['signature']) {
              proxyReq.setHeader('signature', req.headers['signature']);
            }
          });
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          element: ['element-plus', '@element-plus/icons-vue'],
          editor: ['@editorjs/editorjs', '@editorjs/list', '@editorjs/code', '@editorjs/header', '@editorjs/quote', '@editorjs/table', '@editorjs/delimiter'],
          markdown: ['marked', 'highlight.js']
        }
      }
    }
  }
})
