import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app')
    }
  }
})
