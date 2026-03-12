/**
 * Cloudflare Pages ビルド時に profile-pro.ts を環境変数から生成するスクリプト
 * 環境変数 PROFILE_PRO_CONTENT に profile-pro.ts の内容をそのまま設定する
 */
import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../src/data/profile-pro.ts')

if (existsSync(outPath)) {
  console.log('profile-pro.ts already exists, skipping generation.')
  process.exit(0)
}

const content = process.env.PROFILE_PRO_CONTENT
if (!content) {
  console.error('Error: PROFILE_PRO_CONTENT environment variable is not set.')
  process.exit(1)
}

writeFileSync(outPath, content, 'utf8')
console.log('profile-pro.ts generated successfully.')
