import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
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
  }
})
