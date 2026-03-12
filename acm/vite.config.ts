import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // raproビルド時のみ noindex を挿入
    mode === 'rapro' && {
      name: 'inject-noindex',
      transformIndexHtml(html: string) {
        return html.replace(
          '<meta charset="UTF-8" />',
          '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex, nofollow" />'
        )
      },
    },
  ],

  // 独自ドメイン直下で公開するため必須
  base: '/',

  // dist の出力先（デフォルトだが明示）
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}))
