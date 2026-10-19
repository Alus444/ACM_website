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
    version: '1.4.2',
    title: '内蔵解析の辞書と説明を改善',
    summary: '接続詞・副詞・連体詞などの辞書を補い、一部の語の品詞分類を修正しました。',
  },
  {
    version: '1.4.1',
    title: 'レーダーの小さな差を読み取りやすく調整',
    summary: '軸ごとの目安を50に置く共通尺度へ変更。',
  },
  {
    version: '1.4.0',
    title: '内蔵解析の品詞分類とレーダーを改善',
    summary: '未判定のひらがなを一律に描写語へ数える扱いを見直し、自作の副詞辞書を追加しました。',
  },
  {
    version: '1.3.3',
    title: 'KAKURIYOの表示文言を改善',
    summary: '表記ゆれや反復などの説明を、操作や判断が分かりやすい言葉へ変更しました。',
  },
  {
    version: '1.3.2',
    title: '公式MeCabの導入手順を追加',
    summary: '公式Windows版MeCabとIPA辞書の導入手順を整えました。',
  },
  {
    version: '1.3.1',
    title: 'MeCabの接続確認と設定画面を修正',
    summary: '既定辞書の情報を取得できない場合の設定確認を改善しました。',
  },
  {
    version: '1.3.0',
    title: 'MeCabのパスを自動検出',
    summary: '実行ファイル欄が空なら、PATHと一般的なインストール先から候補を検索します。1件なら自動入力し、複数なら選択できます。手動指定したパスは保持されます。',
  },
  {
    version: '1.2.0',
    title: '任意のMeCabモードを追加',
    summary: '通常版のKAKURIYOで、内蔵解析と利用者が別途導入したMeCabを切り替えられるようにしました。切り替え時は保存済みの結果を読み込み、新しい本文解析は更新操作で開始します。MeCab本体や辞書は同梱していません。',
  },
  {
    version: '1.1.0',
    title: 'NIGHTOVER Lite',
    summary: '従来の体験版をNIGHTOVER Liteへ変更しました。執筆・作品管理・入出力は通常版と同じ条件で利用でき、KAKURIYOは通常版専用です。',
  },
  {
    version: '1.0.0',
    title: '初回リリース',
  },
]

export const nightOverCurrentVersion = nightOverReleases[0]?.version ?? ''
