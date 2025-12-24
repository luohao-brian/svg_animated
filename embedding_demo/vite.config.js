import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    // Use 0 to allow random free port if 5173 is taken, but for consistency we try 5173 first
    // or let Vite handle it. 
    // mnist_demo uses default.
  }
})
