import type { BoothItem } from '../types'

export const boothItems: BoothItem[] = [
  {
    id: 'booth-01',
    title: 'VRChatアバター - [商品名]',
    description: 'VRChat対応オリジナル3Dアバター。Quest対応・表情モーフ多数収録。',
    imageUrl: '/images/booth/booth-01.jpg',
    price: 3000,
    boothUrl: 'https://your-booth.booth.pm/items/0000001',
    category: 'アバター',
  },
  {
    id: 'booth-02',
    title: '武器アセットパック - [商品名]',
    description: 'Unity / UE5向け武器モデルパック。PBRテクスチャ・LOD付き。',
    imageUrl: '/images/booth/booth-02.jpg',
    price: 1500,
    boothUrl: 'https://your-booth.booth.pm/items/0000002',
    category: 'アセット',
  },
  {
    id: 'booth-03',
    title: '衣装モデル - [商品名]',
    description: 'VRChat対応衣装モデル。複数のカラーバリエーション付属。',
    imageUrl: '/images/booth/booth-03.jpg',
    price: 800,
    boothUrl: 'https://your-booth.booth.pm/items/0000003',
    category: '衣装',
  },
]
