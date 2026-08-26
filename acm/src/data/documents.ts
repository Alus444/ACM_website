export interface DocumentationItem {
  id: string
  title: string
  category: string
  description: string
  imageUrl: string
  imageAlt: string
  path: string
}

export const documentationItems: DocumentationItem[] = [
  {
    id: 'nightover',
    title: 'NIGHTOVER',
    category: 'Windowsアプリ',
    description: '小説執筆エディタの機能、作品データの保存、設定、更新内容を掲載しています。',
    imageUrl: '/images/documents/nightover.webp',
    imageAlt: 'NIGHTOVERのペン先とタイトルを配した黒いサムネイル',
    path: '/nightover',
  },
  {
    id: 'vhs-simulator',
    title: 'ACM VHS Simulator',
    category: 'After Effectsプラグイン',
    description: 'インストール、内蔵プリセット、各パラメータ、想定される問題を掲載しています。',
    imageUrl: '/images/documents/vhs-simulator-logo.webp',
    imageAlt: '青空と雲の映像にVHS Simulatorのロゴを重ねたサムネイル',
    path: '/vhs-simulator',
  },
]
