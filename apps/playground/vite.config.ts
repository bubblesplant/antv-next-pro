import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'antdv-next-pro': fileURLToPath(
        new URL('../../packages/antdv-next-pro/src/index.ts', import.meta.url),
      ),
    },
  },
})
