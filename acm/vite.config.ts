import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 独自ドメイン直下で公開するため必須
  base: '/',

  // dist の出力先（デフォルトだが明示）
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})