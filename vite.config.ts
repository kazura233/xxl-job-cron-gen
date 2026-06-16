import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'dev',
  // 构建产物输出到项目根目录下的 dist-pages，避免与 dist（库产物）混淆
  build: {
    outDir: '../dist-pages',
    emptyOutDir: true,
  },
  server: {
    port: 3031,
  },
})
