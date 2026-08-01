export type NightOverReleaseSection = {
  title: string
  items: string[]
}

export type NightOverRelease = {
  version: string
  title: string
  publishedAt?: string
  summary?: string
  sections?: NightOverReleaseSection[]
}

export const nightOverProductUrl = 'https://alushop.booth.pm/items/8656265'

// 新しいバージョンを先頭へ追加すると、リリース情報へ新しい順で表示されます。
export const nightOverReleases: NightOverRelease[] = [
  {
    version: '1.0.0',
    title: '初回リリース',
  },
]

export const nightOverCurrentVersion = nightOverReleases[0]?.version ?? ''
