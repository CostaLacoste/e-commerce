import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/media': 'http://127.0.0.1:3001',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['server/**', 'node_modules/**', 'dist/**'],
  },
})
