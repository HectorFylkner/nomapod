import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Add the base path for GitHub Pages deployment
  base: '/nomapod/', 
  plugins: [react()],
}) 