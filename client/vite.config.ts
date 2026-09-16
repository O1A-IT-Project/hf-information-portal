import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  base: '/',

  server: {
    proxy: {
      '/umbraco': {
        target: 'http://localhost:58609',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})