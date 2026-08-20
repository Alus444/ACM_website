/**
 * Cloudflare Pages ビルド時に profile-pro.ts を環境変数から生成するスクリプト
 * 環境変数 PROFILE_PRO_JSON に JSON 文字列で設定する
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

const json = process.env.PROFILE_PRO_JSON
if (!json) {
  // alus ビルド用プレースホルダー（ビルドエラー回避のみ。実際には使われない）
  writeFileSync(outPath, `import type { Profile } from '../types'\nexport const profilePro: Profile = {} as Profile\n`, 'utf8')
  console.log('profile-pro.ts placeholder generated (no PROFILE_PRO_JSON set).')
  process.exit(0)
}

const p = JSON.parse(json)
const email = typeof p.email === 'string'
  ? p.email
  : (typeof p.social?.email === 'string' ? p.social.email : '')

const content = `import type { Profile } from '../types'

export const profilePro: Profile = {
  name: ${JSON.stringify(p.name)},
  handle: ${JSON.stringify(p.handle)},
  avatarUrl: ${JSON.stringify(p.avatarUrl)},
  bio: ${JSON.stringify(p.bio)},
  skills: ${JSON.stringify(p.skills)},
  social: {
    email: ${JSON.stringify(email)},
    twitter: '',
    booth: '',
  },
}
`

writeFileSync(outPath, content, 'utf8')
console.log('profile-pro.ts generated successfully.')
