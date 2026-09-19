import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    // ให้ import แบบ '@/lib/...' ทำงานเหมือนตอนรันจริงใน Next
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
