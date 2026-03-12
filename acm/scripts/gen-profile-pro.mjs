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
  console.error('Error: PROFILE_PRO_JSON environment variable is not set.')
  process.exit(1)
}

const p = JSON.parse(json)
const skills = p.skills.map(s => `'${s}'`).join(', ')

const content = `import type { Profile } from '../types'

export const profilePro: Profile = {
  name: '${p.name}',
  handle: '${p.handle}',
  avatarUrl: '${p.avatarUrl}',
  bio: '${p.bio}',
  skills: [${skills}],
  social: {
    twitter: '',
    booth: '',
  },
}
`

writeFileSync(outPath, content, 'utf8')
console.log('profile-pro.ts generated successfully.')
