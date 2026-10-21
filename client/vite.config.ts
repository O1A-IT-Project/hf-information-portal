import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  base: process.env.NODE_ENV === 'production'
    ? '/hf-information-portal/'
    : '/',

  server: {
    proxy: {
      '/umbraco': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})