/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add ESLint plugin with custom config
    {
      name: 'eslint',
      configFile: './.eslintrc.js'
    }
  ]
})
