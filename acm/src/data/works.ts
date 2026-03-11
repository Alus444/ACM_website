import type { Work } from '../types'

export const works: Work[] = [
  {
    id: 'work-01',
    title: 'オリジナルキャラクター A',
    description: 'VTuber向けオリジナル3Dアバター。表情モーフ・揺れ物物理シミュレーション対応。',
    imageUrl: '/images/works/work-01.jpg',
    tags: ['VTuber', 'キャラクター', 'リギング'],
    year: 2024,
    software: ['Blender', 'Substance Painter'],
  },
  {
    id: 'work-02',
    title: 'ファンタジー武器セット',
    description: 'ゲーム向けローポリ武器モデル。PBRテクスチャ対応。',
    imageUrl: '/images/works/work-02.jpg',
    tags: ['ゲームアセット', '武器', 'ローポリ'],
    year: 2024,
    software: ['Blender', 'Substance Painter'],
  },
  {
    id: 'work-03',
    title: 'SF環境アセット',
    description: 'サイバーパンク風の建物・小物セット。Unity / Unreal Engine対応。',
    imageUrl: '/images/works/work-03.jpg',
    tags: ['環境', 'SF', 'ゲームアセット'],
    year: 2023,
    software: ['Blender', 'ZBrush'],
  },
  {
    id: 'work-04',
    title: 'クリーチャーモデル',
    description: 'ハイポリスカルプト。ゲームおよびCGI用途。',
    imageUrl: '/images/works/work-04.jpg',
    tags: ['クリーチャー', 'スカルプト', 'ハイポリ'],
    year: 2023,
    software: ['ZBrush', 'Blender'],
  },
]
