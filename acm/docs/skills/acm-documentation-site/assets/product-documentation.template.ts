export type ProductDocTheme = {
  background: string
  panel: string
  line: string
  lineBright: string
  accent: string
  text: string
  muted: string
  subtle: string
}

export type ProductDocConfig = {
  slug: string
  productName: string
  documentLabel: string
  currentVersion: string
  overviewPage: string
  titleSuffix: string
  logoSrc?: string
  legacyPageAliases: Record<string, string>
  theme: ProductDocTheme
}

export type ProductDocImage = {
  src: string
  alt: string
  caption?: string
}

export type ProductDocCallout = {
  title: string
  body: string
  tone?: 'info' | 'warning'
}

export type ProductDocSection = {
  id: string
  label: string
  eyebrow?: string
  paragraphs?: string[]
  bullets?: string[]
  callout?: ProductDocCallout
  image?: ProductDocImage
}

export type ProductDocPage = {
  id: string
  group: string
  label: string
  description: string
  keywords: string[]
  lead?: string
  sections: ProductDocSection[]
}

export const productDocConfig: ProductDocConfig = {
  slug: 'product-name',
  productName: 'PRODUCT NAME',
  documentLabel: 'Documentation',
  currentVersion: '0.0.0',
  overviewPage: 'overview',
  titleSuffix: 'PRODUCT NAME',
  legacyPageAliases: {},
  theme: {
    background: '#0a0e11',
    panel: '#10171c',
    line: '#29424c',
    lineBright: '#43818d',
    accent: '#6fe5e7',
    text: '#eef4f6',
    muted: '#afbec4',
    subtle: '#83969e',
  },
}

// Keep every page in this one ordered list. Navigation, search, page TOC,
// previous/next links, and URL validation are derived from it.
export const productDocPages: ProductDocPage[] = [
  {
    id: 'overview',
    group: 'はじめに',
    label: '概要・対応環境',
    description: '製品の役割と対応状況',
    keywords: ['概要', '対応環境', 'Windows'],
    lead: '製品が何をするものか、誰に向いているかを1〜2文で記載します。',
    sections: [
      {
        id: 'positioning',
        label: '概要',
        eyebrow: 'POSITIONING',
        paragraphs: ['代表的な用途、できること、対象外とすることを簡潔に記載します。'],
      },
      {
        id: 'support',
        label: '対応状況',
        eyebrow: 'SUPPORT',
        paragraphs: ['対応OS、対応ホスト、動作確認済みバージョンを、根拠のある表現で記載します。'],
      },
    ],
  },
  {
    id: 'install',
    group: 'はじめに',
    label: 'インストール',
    description: '導入・更新・削除',
    keywords: ['インストール', '更新', '削除'],
    lead: '導入前に閉じるアプリや、配置先が分かる短い説明を記載します。',
    sections: [
      {
        id: 'install-steps',
        label: '導入',
        paragraphs: ['実際の操作順を、1項目につき1動作で記載します。'],
        bullets: ['Adobeアプリを終了', '配布フォルダーを所定の場所へ配置', '対象アプリで製品名を確認'],
      },
      {
        id: 'update-remove',
        label: '更新と削除',
        paragraphs: ['上書き条件、旧版の扱い、削除対象を記載します。'],
      },
    ],
  },
  {
    id: 'features',
    group: '機能',
    label: '機能リファレンス',
    description: '機能ごとの使い方',
    keywords: ['機能', '使い方', '設定'],
    lead: '機能名だけでなく、操作すると何が変わるかを記載します。',
    sections: [
      {
        id: 'feature-example',
        label: '機能名',
        paragraphs: ['機能の役割と、画面または結果に現れる変化を記載します。'],
        callout: {
          title: '補足が必要な場合だけ使用',
          body: '本文と重複する装飾枠は作りません。',
          tone: 'info',
        },
      },
    ],
  },
  {
    id: 'troubleshooting',
    group: '運用とサポート',
    label: '想定される問題',
    description: '症状別の確認と対処',
    keywords: ['問題', 'トラブル', '動かない'],
    sections: [
      {
        id: 'issue-example',
        label: '症状を書く',
        paragraphs: ['原因候補ではなく、読者が見ている症状を見出しにし、対処を本文に記載します。'],
      },
    ],
  },
]
