export type NightOverReleaseSection = {
  title: string
  items: string[]
}

export type NightOverRelease = {
  version: string
  title: string
  publishedAt?: string
  summary: string
  sections: NightOverReleaseSection[]
}

// 新しいバージョンを先頭へ追加すると、リリース情報へ新しい順で表示されます。
export const nightOverReleases: NightOverRelease[] = [
  {
    version: '1.0.0',
    title: '初回リリース',
    summary: '小説の執筆、作品管理、資料整理、記録、文章の見直しをひとつの作品フォルダで扱える最初の製品版です。',
    sections: [
      {
        title: '主な内容',
        items: [
          '横書き・縦書きでの本文編集とプレビュー',
          '章と話の管理、締切、目標文字数、ステータス表示',
          '話・章・作品・全作品共通のメモと、登場人物・展開・用語の資料管理',
          '検索、置換、本文整形、統計、取り込み、書き出し',
          'Gitを利用した変更の記録、差分確認、本文とメモの復元',
          'KAKURIYOによる文体・表記・反復などの解析支援',
        ],
      },
    ],
  },
]

export const nightOverCurrentVersion = nightOverReleases[0]?.version ?? ''
