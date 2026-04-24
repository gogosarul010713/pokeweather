import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api/accuweather': {
        target: 'https://dataservice.accuweather.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/accuweather/, ''),
      },
    },
  },
})
