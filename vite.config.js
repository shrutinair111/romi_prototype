import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' keeps asset paths relative so the build works on GitHub Pages
// under /romi-prototype-v2/ without extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
})
