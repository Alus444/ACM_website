import type { PriceCategory } from '../types'

export const priceCategories: PriceCategory[] = [
  {
    name: '3DCG',
    options: [
      { label: 'アセットモデル', price: '¥10,000〜' },
      { label: '服モデル', price: '¥50,000〜' },
      { label: 'テクスチャ改変', price: '¥1,000〜' },
      {
        label: 'リクエスト',
        price: '無料',
        note: '+デザイン提示なし ¥10,000 / 修正・リテイク 2回まで無料 / キャンセル料：基本料 + 作業料（時間 × ¥3,000）',
      },
    ],
  },
  {
    name: 'MOVIE',
    options: [
      { label: '基本料金（〜5分）', price: '¥3,000〜' },
      { label: '+ 文字アニメーション', price: '+¥1,000' },
      { label: '+ 簡単なエフェクト', price: '+¥1,000' },
      { label: '+ 5分以上（1分ごと）', price: '+¥500' },
    ],
  },
]

export const commissionNotes: string[] = [
  '分からないことがあれば Twitter の DM に直接送っていただいて大丈夫です。',
  'お支払いは BOOTH にてお願いいたします。（振込も可）',
  '内容によってはお断りする場合があります。',
  '製作者・担当者が Alus であることを公開する場合があります。',
  '著作権は放棄しません。譲渡を行う場合は相談の上、金額を変更します。',
  '3DモデルはUVライセンスでの提供になります。',
]
