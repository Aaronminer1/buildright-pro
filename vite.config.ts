import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages deploys under /buildright-pro/ — use root in local dev
  base: process.env.GITHUB_PAGES ? '/buildright-pro/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/bls': {
        target: 'https://api.bls.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bls/, '/publicAPI/v2/timeseries/data'),
      },
    },
  },
})
