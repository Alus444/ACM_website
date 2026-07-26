<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type NavItem = {
  id: string
  label: string
  keywords: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

type SearchEntry = {
  page: string
  headingId: string
  title: string
  text: string
}

const query = ref('')
const menuOpen = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const lightboxSrc = ref('')
const lightboxAlt = ref('')
const lightboxCaption = ref('')
const lightboxCloseButton = ref<HTMLButtonElement | null>(null)
const route = useRoute()
const router = useRouter()
let previousBodyOverflow = ''
let lightboxTrigger: HTMLElement | null = null

const navGroups: NavGroup[] = [
  {
    label: 'はじめに',
    items: [
      { id: 'intro', label: 'NIGHTOVER', keywords: '概要 はじめに windows 小説 執筆' },
      { id: 'editions', label: '体験版と製品版', keywords: 'trial full 制限 比較' },
      { id: 'terms', label: '利用規約', keywords: '規約 ライセンス 法人 サークル 返金 外部送信 権利' },
    ],
  },
  {
    label: '画面構成',
    items: [
      { id: 'workspace', label: '全体構成', keywords: 'エディタ 3ペイン 全体 集中モード' },
      { id: 'home', label: 'ホーム画面', keywords: '新規プロジェクト 保存先 最近の作品 開く' },
      { id: 'workspace-left', label: '左ペイン', keywords: '作品 締切 アウトライン 章 話 文字数 ステータス' },
      { id: 'workspace-center', label: '中央ペイン', keywords: 'ヘッダー 本文 エディタ Git 記録 履歴' },
      { id: 'workspace-right', label: '右ペイン', keywords: 'メモ 資料 KAKURIYO 開閉' },
    ],
  },
  {
    label: '作品管理',
    items: [
      { id: 'project', label: '章と話', keywords: '作品名 アウトライン 章 話 並び替え 右クリック' },
      { id: 'project-deadline', label: '締切と目標文字数', keywords: '締切 目標 文字数 進捗' },
      { id: 'project-status', label: 'ステータス', keywords: '下書き 改稿中 改稿完了 色 共通 プロジェクト' },
    ],
  },
  {
    label: '執筆機能',
    items: [
      { id: 'editor-display', label: '横書き・縦書き・プレビュー', keywords: '横書き 縦書き プレビュー 禁則 表示状態' },
      { id: 'editor-input', label: '入力と操作', keywords: '入力 ime 選択 コピー スクロール' },
      { id: 'ruby', label: 'ルビと傍点', keywords: 'ルビ 傍点 ruby emphasis' },
      { id: 'input-assist', label: '記号の入力補助', keywords: 'ダッシュ 三点リーダ 自動変換 二連化 記号' },
      { id: 'search', label: '検索・置換・整形', keywords: '検索 置換 整形 空白 改行' },
    ],
  },
  {
    label: 'メモと資料',
    items: [
      { id: 'notes', label: 'メモ', keywords: '話 章 作品 共通 メモ 一覧' },
      { id: 'references', label: '資料', keywords: '資料 登場人物 展開 用語 ページ' },
      { id: 'linking', label: '本文リンクと初出', keywords: '本文 資料 ハイライト ジャンプ 初出 登場人物 用語' },
    ],
  },
  {
    label: 'KAKURIYO',
    items: [
      { id: 'kakuriyo', label: 'KAKURIYO 概要', keywords: '解析 支援 概要 セクション window' },
      { id: 'kakuriyo-radar', label: '文体レーダーと傾向', keywords: '文体 レーダー 会話 名詞 動詞 描写 接続 作品語 文末 反復 傾向' },
      { id: 'kakuriyo-review', label: '要確認・記憶・反復・学習', keywords: '要確認 記憶 作品語 一般語 採用 見送り 反復 学習' },
      { id: 'kakuriyo-update', label: '解析の更新', keywords: '更新 現在話 クリーン 再解析 保存データ 失敗 バージョン' },
    ],
  },
  {
    label: '統計と履歴',
    items: [
      { id: 'statistics', label: '統計', keywords: '統計 会話率 文長 段落 記号 人物 用語' },
      { id: 'git', label: 'Git 記録と復元', keywords: 'git 初期化 dirty 記録 履歴 差分 復元' },
    ],
  },
  {
    label: '保存とデータ',
    items: [
      { id: 'saving', label: '保存と自動保存', keywords: '自動保存 下書き 手動保存 dirty backup' },
      { id: 'data-files', label: '作品フォルダとバックアップ', keywords: 'project json manifest manuscripts notes appdata lock backup' },
      { id: 'import-export', label: '取り込み・書き出し', keywords: 'txt zip import export なろう カクヨム コピー' },
    ],
  },
  {
    label: '設定と操作',
    items: [
      { id: 'settings', label: '設定の使い方', keywords: '設定 保存 初期化 OK キャンセル' },
      { id: 'settings-saving', label: '保存の設定', keywords: '保存場所 自動保存 間隔 全体保存' },
      { id: 'settings-writing', label: '本文・入力の設定', keywords: 'ルビ 文字数 記号 改行 コピー' },
      { id: 'settings-appearance', label: 'テーマ・フォント・色', keywords: 'フォント アクセント テーマ ダーク ライト' },
      { id: 'settings-support', label: '連携・支援の設定', keywords: 'Git リンク 初出 有効 無効' },
      { id: 'shortcuts', label: 'ショートカット', keywords: 'ctrl alt f6 f11 keyboard' },
    ],
  },
]

const allItems = navGroups.flatMap((group) => group.items)
const legacyPageAliases: Record<string, string> = {
  appearance: 'settings-appearance',
  editor: 'editor-display',
}
const fallbackPage: NavItem = {
  id: 'intro',
  label: 'NIGHTOVER',
  keywords: '概要 はじめに windows 小説 執筆',
}
const activePage = computed(() => {
  const requested = typeof route.params.page === 'string' ? route.params.page : 'intro'
  const resolved = legacyPageAliases[requested] ?? requested
  return allItems.some((item) => item.id === resolved) ? resolved : 'intro'
})

const currentPage = computed<NavItem>(
  () => allItems.find((item) => item.id === activePage.value) ?? fallbackPage,
)
const currentPageIndex = computed(() => allItems.findIndex((item) => item.id === activePage.value))
const previousPage = computed(() => allItems[currentPageIndex.value - 1])
const nextPage = computed(() => allItems[currentPageIndex.value + 1])

const searchIndex: SearchEntry[] = [
  {
    page: 'intro',
    headingId: 'main-features',
    title: 'NIGHTOVERの主な機能',
    text: 'Windows 小説執筆 本文 横書き 縦書き プレビュー 章 話 アウトライン 締切 目標文字数 ステータス メモ 資料 登場人物 展開 用語 リンクジャンプ 検索 置換 整形 統計 Git 記録 復元 KAKURIYO 解析支援',
  },
  {
    page: 'intro',
    headingId: 'runtime',
    title: '動作形式',
    text: '対応環境 Windows デスクトップアプリ NIGHTOVER.exe 作品フォルダ ダーク ライト テーマ',
  },
  {
    page: 'terms',
    headingId: 'terms-license',
    title: 'ライセンス',
    text: '1人1ライセンス 本人 所有 管理 複数 Windows PC 法人 団体 サークル 利用者数 共用不可 利用者変更不可 引き継ぎ不可',
  },
  {
    page: 'terms',
    headingId: 'terms-works',
    title: '作品の利用と権利',
    text: '小説 文章 設定資料 権利 利用者 商用 同人誌 電子書籍 商業出版 投稿サイト コンテスト クレジット不要',
  },
  {
    page: 'terms',
    headingId: 'terms-data',
    title: 'データと外部送信',
    text: '本文 作品情報 設定 利用状況 外部送信なし ローカル PC Git 外部サーバー 送信しない',
  },
  {
    page: 'terms',
    headingId: 'terms-refunds',
    title: '返金',
    text: 'ダウンロード商品 購入者都合 返品 交換 返金 原則不可 重複決済 ファイル破損 製品提供',
  },
  {
    page: 'terms',
    headingId: 'terms-liability',
    title: '保証と責任',
    text: '動作保証 不具合 対応環境 損害賠償 通常過失 故意 重大な過失 購入金額',
  },
  {
    page: 'home',
    headingId: 'home-screen',
    title: 'ホーム画面',
    text: '新規プロジェクト 既定保存先 任意の場所 最近使った作品 最大5件 ごみ箱 テーマ切り替え',
  },
  {
    page: 'workspace',
    headingId: 'editor-screen',
    title: 'エディタ画面の3ペイン',
    text: '左ペイン 320px プロジェクト 締切 アウトライン 総文字数 ステータス 中央ペイン 本文エディタ Git記録 右ペイン メモ 資料 KAKURIYO',
  },
  {
    page: 'workspace-center',
    headingId: 'center-header',
    title: '中央ヘッダー',
    text: 'EPISODE 話タイトル ステータス 現在文字数 目標 選択文字数 プレビュー 集中 表示設定 戻る 直前1件',
  },
  {
    page: 'workspace-left',
    headingId: 'left-outline',
    title: '左ペイン',
    text: '作品切り替え 設定 締切 目標文字数 章 話 アウトライン ツリー表示 並び 見やすい 折りたたみなし 文字数 進捗 ステータス 保存状態',
  },
  {
    page: 'workspace-center',
    headingId: 'center-body',
    title: '本文エリア',
    text: '本文 編集 横書き 縦書き プレビュー 検索ジャンプ スクロール 表示状態 Git 記録 履歴',
  },
  {
    page: 'workspace-right',
    headingId: 'right-overview',
    title: '右ペイン',
    text: 'メモ 話ごと 章ごと 全体 共通 メモ一覧 資料 登場人物 展開 用語 KAKURIYO解析 開閉',
  },
  {
    page: 'workspace',
    headingId: 'focus-mode',
    title: '集中モード',
    text: 'F11 左右ペイン Git操作 非表示 本文 選択 カーソル スクロール位置 縦書き状態 維持',
  },
  {
    page: 'project',
    headingId: 'outline',
    title: 'アウトライン',
    text: '章 話 追加 名前変更 削除 ドラッグ 並び替え ツリー表示 文字数 ステータス 目標進捗 上下キー 章メモ',
  },
  {
    page: 'project',
    headingId: 'project-title',
    title: '作品の切り替えと表示名',
    text: '作品タイトル 左クリック 最近の作品 切り替え 右クリック 表示名 project.json フォルダ名 内部ID 変更しない',
  },
  {
    page: 'project',
    headingId: 'outline-menu',
    title: 'アウトラインの右クリック操作',
    text: '行頭空白 挿入 章 話 作品全体 本文コピー txt 書き出し 名前変更 削除 複数選択',
  },
  {
    page: 'project-deadline',
    headingId: 'deadline',
    title: '締切と目標文字数',
    text: '締切日 残り日数 作品全体 目標文字数 全話共通 話ごと 進捗 左ペイン 中央ヘッダー',
  },
  {
    page: 'project-status',
    headingId: 'status',
    title: '話ごとのステータス',
    text: '下書き 改稿中 改稿完了 ユーザー追加 全作品共通 作品専用 色変更 削除',
  },
  {
    page: 'data-files',
    headingId: 'project-file-map',
    title: '作品フォルダのファイル構成',
    text: 'project.json manifest outline deadline statuses first appearances statistics cache kakuriyo manuscripts episode txt notes reference md 作品データ 保存先',
  },
  {
    page: 'data-files',
    headingId: 'global-file-map',
    title: 'アプリ全体で共有するデータ',
    text: 'APPDATA NIGHTOVER settings.json recent.json global-memo.md common-statuses.json 共通メモ 共通ステータス 最近の作品',
  },
  {
    page: 'data-files',
    headingId: 'project-lock',
    title: '同じ作品の多重起動防止',
    text: '同時に開けない Windows セッション named mutex .nightover.lock PID 端末名 残骸 起動拒否しない',
  },
  {
    page: 'data-files',
    headingId: 'backup-guide',
    title: 'バックアップする範囲',
    text: 'バックアップ 作品フォルダ 全体 project.json manifest manuscripts notes Git 閉じる コピー 復元',
  },
  {
    page: 'editor-display',
    headingId: 'display-modes',
    title: '4つの表示モード',
    text: '横書き編集 横書きプレビュー 縦書き編集 縦書きプレビュー 編集可能 読み取り専用 ルビ 縦組み',
  },
  {
    page: 'editor-display',
    headingId: 'display-controls',
    title: '本文表示の設定',
    text: '文字サイズ 8 16 10.5 字行 10 120 縦書き 統計 ... 即時反映 アプリ設定',
  },
  {
    page: 'editor-display',
    headingId: 'horizontal-writing',
    title: '横書き',
    text: '実測文字幅 折り返し 句読点 閉じ括弧 ぶら下がり ルビ記法 展開 プレビュー 読み取り専用',
  },
  {
    page: 'editor-display',
    headingId: 'vertical-writing',
    title: '縦書き編集',
    text: '右から左 入力 選択 貼り付け undo redo ルビ記法 展開しない 列移動 Home End PageUp PageDown',
  },
  {
    page: 'editor-display',
    headingId: 'vertical-preview',
    title: '縦書きプレビュー',
    text: '読み取り専用 ルビ 開始列 半角英数字 90度回転 縦組み互換字形 代替表示 Esc 横書き編集',
  },
  {
    page: 'editor-input',
    headingId: 'text-input',
    title: '入力とIME',
    text: 'IME 変換範囲 下線 候補窓 キャレット Windows標準 確定 重複入力 抑制',
  },
  {
    page: 'editor-input',
    headingId: 'selection-copy',
    title: '選択・コピー・貼り付け',
    text: 'ドラッグ Shiftクリック ダブルクリック 単語 Ctrl 文選択 本文をコピー 選択範囲 プレビュー 編集不可',
  },
  {
    page: 'editor-input',
    headingId: 'editor-scroll',
    title: '本文のスクロール',
    text: 'ホイール Shift 3行 3列 中クリック オートスクロール 横書き 縦書き スクロールバー',
  },
  {
    page: 'editor-display',
    headingId: 'display-indicator',
    title: '本文表示状態インジケータ',
    text: '緑 赤 横書き 縦書き 互換字形 fallback 指定字数 早い折り返し 注意 集中モード',
  },
  {
    page: 'ruby',
    headingId: 'ruby-syntax',
    title: 'ルビ',
    text: '親文字 ルビ記法 |親文字《ルビ》 ｜親文字《ルビ》 漢字《かな》 入力ダイアログ 文字数上限',
  },
  {
    page: 'ruby',
    headingId: 'ruby-validation',
    title: 'ルビを挿入できる条件',
    text: '親文字 ルビ 空欄 改行 上限 前後空白 入力条件 不正記法 通常本文',
  },
  {
    page: 'ruby',
    headingId: 'emphasis',
    title: '傍点',
    text: '選択範囲 中点 ・ ルビ 空白 タブ 改行 保持 Ctrl B',
  },
  {
    page: 'ruby',
    headingId: 'annotation-behavior',
    title: 'ルビ・傍点の保存と取り消し',
    text: 'undo redo 選択パネル 閉じる 非アクティブ 保存本文 プレーンテキスト 表示時 解釈',
  },
  {
    page: 'search',
    headingId: 'search-tab',
    title: '作品内検索',
    text: 'プロジェクト すべての本文 一致箇所 前後 結果一覧 複数一致 クリック Enter 本文へ移動',
  },
  {
    page: 'search',
    headingId: 'search-jump',
    title: '検索結果へ移動',
    text: '対象話 一致範囲 選択 縦書き プレビュー 解除 横書き編集',
  },
  {
    page: 'search',
    headingId: 'replace-tab',
    title: '置換',
    text: '現在の1件 すべて置換 改稿中 ダッシュ 三点リーダ 置換文字列',
  },
  {
    page: 'search',
    headingId: 'format-tab',
    title: '本文整形',
    text: '文頭 文末 改行 行頭空白 削除 挿入 空白行 連続空行 圧縮 現在話 全話 取り消し Ctrl Z',
  },
  {
    page: 'search',
    headingId: 'format-undo',
    title: '直前の整形を戻す',
    text: '1回 取り消し ダイアログ 閉じる 保持 プロジェクト Ctrl Z',
  },
  {
    page: 'notes',
    headingId: 'memo-types',
    title: '4種類のメモ',
    text: '話ごと 章ごと 作品全体 共通メモ 現在の話 親章 すべての作品 メモ一覧',
  },
  {
    page: 'notes',
    headingId: 'memo-behavior',
    title: 'メモの切り替えと保存',
    text: '話メモ 章メモ 親章なし 編集不可 一覧 6件 ホイール Ctrl S 自動保存 notes episode chapter project global',
  },
  {
    page: 'references',
    headingId: 'references',
    title: '資料',
    text: '登場人物 人物設定 関係 呼び方 展開 プロット 場面 伏線 用語 固有名詞 地名 作中用語 ページ追加 名前変更 削除 本文編集',
  },
  {
    page: 'references',
    headingId: 'reference-rules',
    title: '資料ページの操作と規則',
    text: '追加 ダブルクリック 改名 右クリック 削除 同名 禁止 page id 選択保持 Ctrl S 自動保存 Markdown',
  },
  {
    page: 'linking',
    headingId: 'text-linking',
    title: '本文と資料の連携',
    text: '登場人物 用語 一致 本文 ハイライト 右クリック リンク先へ移動 初出話 KAKURIYO 作品語 自動同期',
  },
  {
    page: 'kakuriyo',
    headingId: 'support-sections',
    title: 'KAKURIYOの表示セクション',
    text: '概要 解析状態 対象本文 更新時刻 要確認件数 文体レーダー 要確認 未確定語 表記ゆれ 記憶 一般語 作品語 別名 読み 傾向 会話 地の文 語尾 句読点 反復 語句 比喩 段落リズム 学習状態 採用 見送り',
  },
  {
    page: 'kakuriyo',
    headingId: 'support-entry',
    title: 'KAKURIYO解析画面を開く',
    text: '右ペイン KAKURIYO解析 別ウィンドウ modeless 読み取り専用 メモ 資料 併用 話を選択',
  },
  {
    page: 'kakuriyo',
    headingId: 'analysis-source',
    title: '解析対象になる本文',
    text: '未保存 下書き dirty saved manuscript 保存本文 優先 現在話 章 作品 体験版 基本解析',
  },
  {
    page: 'kakuriyo-radar',
    headingId: 'radar-eight-axes',
    title: '文体レーダーの8軸',
    text: '会話 名詞 動詞 描写 接続 作品語 文末 反復 現在話 章平均 作品平均 高い傾向',
  },
  {
    page: 'kakuriyo-radar',
    headingId: 'radar-comparison',
    title: '現在話・章平均・作品平均の比較',
    text: '現在話 章平均 全話平均 作品平均との差 章横断 変化 外れ値 文体',
  },
  {
    page: 'kakuriyo-radar',
    headingId: 'voice-trends',
    title: '傾向で確認できる内容',
    text: '会話 地の文 dialogue narration 文末 profile 常体 敬体 character voice chapter trend anomaly recurring warning',
  },
  {
    page: 'kakuriyo-review',
    headingId: 'review-warnings',
    title: '要確認項目',
    text: 'warning 種類 要約 理由 accepted ignored 採用 見送り 一般語 作品語 TSV 一括コピー 未確認語',
  },
  {
    page: 'kakuriyo-review',
    headingId: 'project-memory',
    title: '記憶と作品語',
    text: 'ProjectMemory canonical alias 表記 別名 読み observed surfaces consistency warning project lexicon',
  },
  {
    page: 'kakuriyo-review',
    headingId: 'repetition-support',
    title: '反復の確認',
    text: '語尾 repeated sentence ending near lemma phrase recurrence figurative recurrence paragraph rhythm 反復',
  },
  {
    page: 'kakuriyo-review',
    headingId: 'learning-state',
    title: '学習状態',
    text: 'adaptive writing partner accepted ignored confidence tuning project style memory learning log muted 通常非表示',
  },
  {
    page: 'kakuriyo-update',
    headingId: 'refresh-actions',
    title: '更新操作の使い分け',
    text: '更新 current episode 現在話 背景集計 クリーン キャッシュ削除 全体再解析 体験版 製品版',
  },
  {
    page: 'kakuriyo-update',
    headingId: 'cache-invalidation',
    title: '解析結果が古くなる条件',
    text: '話切り替え 下書き変更 保存 project reload engineVersion dataVersion schemaVersion memory lexicon feedback invalid stale',
  },
  {
    page: 'kakuriyo-update',
    headingId: 'support-cache-files',
    title: 'KAKURIYOの保存データ',
    text: 'manifest kakuriyo-state.json project-lexicon.tsv project-memory.tsv cache analysis refresh-progress.json',
  },
  {
    page: 'kakuriyo-update',
    headingId: 'fail-soft',
    title: '解析に失敗した場合',
    text: '解析 失敗 問題 支援情報を更新できませんでした 古い情報 バージョン不一致 話を選択 未設定 本文 編集 保存 後から 更新',
  },
  {
    page: 'statistics',
    headingId: 'statistics-feature',
    title: '統計',
    text: '話 章 作品全体 文字数 会話率 文長 段落 記号 登場人物 用語 出現回数 初出話 直近話 差分要約 未保存下書き 製品版',
  },
  {
    page: 'statistics',
    headingId: 'statistics-tabs',
    title: '統計の4つのタブ',
    text: '概要 会話 テンポ 記号 人物 用語 文字数 会話率 文長 段落 初出 直近',
  },
  {
    page: 'statistics',
    headingId: 'statistics-cache',
    title: '再分析と統計キャッシュ',
    text: '再分析 manifest statistics-cache.json 未保存 draft 反映 挿絵 対象外 品詞分析 対象外',
  },
  {
    page: 'git',
    headingId: 'git-start',
    title: 'Git記録を始める',
    text: 'Git連携 インストール PC 見つからない 表示されない 初期化 プロジェクト 記録 履歴 中央ペイン コマンド不要',
  },
  {
    page: 'git',
    headingId: 'git-dirty',
    title: '未記録の変更',
    text: 'dirty 未記録 ドット 保存 本文 メモ 資料 差分',
  },
  {
    page: 'git',
    headingId: 'git-history',
    title: 'Git記録と復元',
    text: '履歴 非同期 読み込み 本文 差分 行内置換 記録時の構造 遅延読込',
  },
  {
    page: 'git',
    headingId: 'git-restore',
    title: '全体復元と本文だけの復元',
    text: '作品全体 復元 本文のみ 確認 保存 失敗 中断 ステータス 通知',
  },
  {
    page: 'saving',
    headingId: 'save-timing',
    title: '保存のタイミング',
    text: '本文 メモ 資料 下書き Ctrl S 話切り替え ホーム 自動保存間隔 Git記録 復元 全体保存',
  },
  {
    page: 'saving',
    headingId: 'draft-scope',
    title: '保存される下書きの範囲',
    text: '現在話 メモ 資料 未表示 全体保存 手動保存 統計キャッシュ dirty',
  },
  {
    page: 'import-export',
    headingId: 'text-copy-export',
    title: '本文コピーとtxt書き出し',
    text: '現在の話 現在の章 複数選択 作品全体 先頭 末尾 改行数 txt export 体験版 製品版',
  },
  {
    page: 'import-export',
    headingId: 'narou-import',
    title: '小説家になろうから取り込む',
    text: '小説家になろう ZIP TXT Nコード タイトル エピソード区切り _draftepisode 通常本文 優先 感想 除外',
  },
  {
    page: 'import-export',
    headingId: 'kakuyomu-import',
    title: 'カクヨムから取り込む',
    text: 'カクヨム ZIP about.txt episode_0001 目次 § 章 タイトル 本文 公開状態 作成日時 更新日時 話メモ 作品メモ',
  },
  {
    page: 'import-export',
    headingId: 'plain-text-import',
    title: '作品の取り込み',
    text: '見出し付き TXT 単一話 txt 章 話 本文 import 製品版',
  },
  {
    page: 'settings',
    headingId: 'settings-overview',
    title: '設定の保存と初期化',
    text: 'アプリ全体 共通設定 APPDATA NIGHTOVER settings.json OK キャンセル 初期値に戻す 再起動不要 即時反映 自動保存タイマー 本文表示 リンクキャッシュ Git 統計 支援',
  },
  {
    page: 'settings-saving',
    headingId: 'setting-default-save-path',
    title: '保存の設定',
    text: 'デフォルト保存場所 自動保存 有効 無効 間隔 全体保存 初期値 体験版',
  },
  {
    page: 'settings-writing',
    headingId: 'setting-ruby-count',
    title: '本文・入力の設定',
    text: 'ルビ 親文字 文字数 スペース除外 ダッシュ 三点リーダ 二連化 本文コピー 改行',
  },
  {
    page: 'settings-appearance',
    headingId: 'setting-font-accent',
    title: '本文フォントとダークモードのアクセント',
    text: '本文フォント Meiryo インストール フォント プレビュー 初期値 再レイアウト ダークモード アクセント #F2BC6C カラーピッカー 資料タブ 選択色 ライトモード 影響なし',
  },
  {
    page: 'settings-support',
    headingId: 'setting-git',
    title: '連携・支援の設定',
    text: 'Git 連携 記録 履歴 リンクジャンプ 初出チェック 有効 無効',
  },
  {
    page: 'home',
    headingId: 'default-save-path',
    title: 'デフォルト保存場所',
    text: '新規プロジェクト 作成先 フォルダ Documents NIGHTOVER 参照 既存作品 移動しない 空欄不可 体験版 変更不可',
  },
  {
    page: 'saving',
    headingId: 'auto-save',
    title: '自動保存',
    text: '有効 初期値 オン 間隔 10秒 1秒 60秒 現在開いている本文 メモ 資料 変更あり 全体保存 未表示 話 大規模プロジェクト 負荷 手動保存 統計更新',
  },
  {
    page: 'git',
    headingId: 'git-start',
    title: 'Git 連携',
    text: '有効 初期値 オン 記録 履歴 ボタン 表示 非表示 プロジェクト 初期化 無効 削除しない リポジトリ 記録済み履歴',
  },
  {
    page: 'linking',
    headingId: 'link-support',
    title: 'リンクジャンプと初出チェック',
    text: '登場人物 用語 本文 ハイライト 右クリック リンク先へ移動 資料タブ 初出話 保存 バックグラウンド スキャン 初期値 オフ ページタイトル 中黒 括弧 スペース 分割名 弱一致 衝突 1文字語 誤爆抑制',
  },
  {
    page: 'ruby',
    headingId: 'ruby-count',
    title: 'ルビ上限と文字数計算',
    text: '親文字 ルビ 読み 上限 初期値 10字 1字 50字 投稿先 小説家になろう カクヨム 超過 案内 文字数 スペース 空白 除外 改行 常に除外 不正記法 通常文字 表示 締切進捗 選択文字数 統計 |東京《とうきょう》',
  },
  {
    page: 'input-assist',
    headingId: 'punctuation',
    title: 'ダッシュと三点リーダの自動変換',
    text: 'ダッシュ ― — 罫線文字 ─ 三点リーダ ... … 二連化 入力 置換文字列 既存本文 変更しない 初期値 オフ 製品版 有償版 体験版',
  },
  {
    page: 'import-export',
    headingId: 'manuscript-copy',
    title: '本文コピー時の改行',
    text: '本文をコピー 章 話 先頭 末尾 改行 0行 20行 追加 既存の改行 指定数にそろえる 選択範囲 コピー 切り取り txt 書き出し 対象外',
  },
  {
    page: 'settings-appearance',
    headingId: 'setting-theme',
    title: 'テーマ',
    text: 'ホーム プロジェクト 右下 ダーク ライト テーマ 切り替え アプリ全体 保存 設定ダイアログ外',
  },
  {
    page: 'shortcuts',
    headingId: 'shortcut-list',
    title: '編集モードのショートカット',
    text: 'Alt Ctrl S 保存 Ctrl Z 元に戻す Ctrl Shift Z Ctrl Y やり直す Ctrl A C X V 全選択 コピー 切り取り 貼り付け Ctrl 矢印 単語移動 Backspace Delete 単語削除 Home End Ctrl B 傍点 F11 集中モード F6 ペイン Ctrl Tab メモ資料 Ctrl 1 2 3 資料カテゴリ',
  },
  {
    page: 'shortcuts',
    headingId: 'preview-shortcuts',
    title: 'プレビューのショートカット',
    text: 'Esc 編集へ戻る 矢印 PageUp PageDown Home End F11 読み取り スクロール',
  },
  {
    page: 'shortcuts',
    headingId: 'mouse-shortcuts',
    title: 'マウス操作',
    text: 'ダブルクリック 語 句読点 Ctrl 文選択 Shift クリック 範囲 中クリック オートスクロール',
  },
  {
    page: 'editions',
    headingId: 'edition-comparison',
    title: '体験版と製品版の機能比較',
    text: '本文編集 保存 自動保存 横書き 縦書き ルビ 傍点 検索 置換 本文整形 メモ 資料 リンクジャンプ 初出 締切 目標文字数 ステータス Git 集中モード テーマ フォント 統計 保存場所 作品数 記号変換 三点リーダ 二連化 Trial Full',
  },
  {
    page: 'editions',
    headingId: 'edition-export-import',
    title: '体験版の書き出しと取り込み',
    text: '本文コピー txt 書き出し 話 章 作品全体 小説家になろう ZIP TXT カクヨム 通常TXT 取り込み import export 製品版',
  },
  {
    page: 'editions',
    headingId: 'edition-kakuriyo',
    title: '体験版のKAKURIYO',
    text: 'KAKURIYO 現在話 基本解析 概要 要確認 傾向 反復 採用 見送り ミュート 一般語 作品語 更新 章平均 作品平均 文体レーダー 作品全体 クリーン再解析 文体記憶',
  },
  {
    page: 'editions',
    headingId: 'trial-limits',
    title: '体験版の作品数',
    text: '同じ親フォルダ 最大3件 4件以上 読み込み 制限 デフォルト保存場所 変更不可',
  },
  {
    page: 'editions',
    headingId: 'trial-policy',
    title: '体験版の期限とデータ互換性',
    text: '期限なし 文字数制限なし 保存可能 話 章 txt 書き出し Trial Full 同じデータ形式 製品版 開く データを壊さない',
  },
]

const searchResults = computed(() => {
  const terms = query.value
    .trim()
    .toLocaleLowerCase('ja')
    .split(/\s+/)
    .filter(Boolean)

  if (terms.length === 0) return []

  return searchIndex
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase('ja')
      const body = entry.text.toLocaleLowerCase('ja')
      const pageLabel = allItems.find((item) => item.id === entry.page)?.label ?? 'NIGHTOVER'
      const haystack = `${pageLabel} ${title} ${body}`.toLocaleLowerCase('ja')
      const matches = terms.every((term) => haystack.includes(term))
      const score = terms.reduce(
        (total, term) => total + (title.includes(term) ? 3 : 0) + (body.includes(term) ? 1 : 0),
        0,
      )
      return { ...entry, pageLabel, matches, score }
    })
    .filter((entry) => entry.matches)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
})

const pageTocMap: Record<string, { id: string; label: string }[]> = {
  intro: [
    { id: 'main-features', label: '主な機能' },
    { id: 'runtime', label: '動作形式' },
  ],
  terms: [
    { id: 'terms-scope', label: '適用' },
    { id: 'terms-license', label: 'ライセンス' },
    { id: 'terms-works', label: '作品と権利' },
    { id: 'terms-prohibited', label: '禁止事項' },
    { id: 'terms-data', label: 'データと外部送信' },
    { id: 'terms-saving', label: '保存・動作環境・更新' },
    { id: 'terms-refunds', label: '返金' },
    { id: 'terms-liability', label: '保証と責任' },
    { id: 'terms-changes', label: '利用停止と規約変更' },
    { id: 'terms-contact', label: '準拠法と提供者' },
  ],
  workspace: [
    { id: 'editor-screen', label: 'エディタ画面' },
    { id: 'focus-mode', label: '集中モード' },
  ],
  home: [
    { id: 'home-screen', label: '作品を開く' },
    { id: 'default-save-path', label: '新規作品の保存先' },
  ],
  'workspace-left': [
    { id: 'left-overview', label: '左ペインの構成' },
    { id: 'left-deadline', label: '締切と目標' },
    { id: 'left-outline', label: '章・話の一覧' },
    { id: 'left-footer', label: '下部の表示' },
  ],
  'workspace-center': [
    { id: 'center-header', label: '上部' },
    { id: 'center-body', label: '本文エリア' },
    { id: 'center-footer', label: '下部' },
  ],
  'workspace-right': [
    { id: 'right-overview', label: '右ペインの構成' },
    { id: 'right-memo', label: 'メモ' },
    { id: 'right-reference', label: '資料' },
    { id: 'right-kakuriyo', label: 'KAKURIYO' },
  ],
  project: [
    { id: 'project-title', label: '作品の切り替えと名前' },
    { id: 'outline', label: 'アウトライン' },
    { id: 'outline-menu', label: '右クリック操作' },
  ],
  'project-deadline': [
    { id: 'deadline', label: '締切と目標文字数' },
  ],
  'project-status': [
    { id: 'status', label: 'ステータス' },
  ],
  'data-files': [
    { id: 'project-file-map', label: '作品フォルダ' },
    { id: 'global-file-map', label: 'アプリ共通データ' },
    { id: 'project-lock', label: '多重起動防止' },
    { id: 'backup-guide', label: 'バックアップ' },
  ],
  'editor-display': [
    { id: 'display-controls', label: '表示設定' },
    { id: 'display-modes', label: '4つの表示モード' },
    { id: 'horizontal-writing', label: '横書き' },
    { id: 'vertical-writing', label: '縦書き編集' },
    { id: 'vertical-preview', label: '縦書きプレビュー' },
    { id: 'display-indicator', label: '表示状態' },
  ],
  'editor-input': [
    { id: 'text-input', label: '入力とIME' },
    { id: 'selection-copy', label: '選択とコピー' },
    { id: 'editor-scroll', label: 'スクロール' },
  ],
  ruby: [
    { id: 'ruby-syntax', label: 'ルビ' },
    { id: 'ruby-validation', label: '入力条件' },
    { id: 'ruby-count', label: '上限と文字数' },
    { id: 'emphasis', label: '傍点' },
    { id: 'annotation-behavior', label: '保存と取り消し' },
  ],
  'input-assist': [
    { id: 'punctuation', label: '自動変換' },
    { id: 'punctuation-combination', label: '設定の組み合わせ' },
  ],
  search: [
    { id: 'search-tab', label: '検索' },
    { id: 'search-jump', label: '検索結果へ移動' },
    { id: 'replace-tab', label: '置換' },
    { id: 'format-tab', label: '整形' },
    { id: 'format-undo', label: '整形を戻す' },
  ],
  notes: [
    { id: 'memo-types', label: 'メモ' },
    { id: 'memo-behavior', label: 'メモの動作' },
  ],
  references: [
    { id: 'references', label: '資料' },
    { id: 'reference-rules', label: '資料ページの規則' },
  ],
  linking: [
    { id: 'text-linking', label: '本文との連携' },
    { id: 'link-support', label: 'リンクジャンプ' },
    { id: 'first-appearance', label: '初出チェック' },
  ],
  kakuriyo: [
    { id: 'support-entry', label: '開き方' },
    { id: 'support-sections', label: '表示セクション' },
    { id: 'analysis-source', label: '解析対象' },
    { id: 'support-readonly', label: '読み取り専用' },
  ],
  'kakuriyo-radar': [
    { id: 'radar-eight-axes', label: '8つの軸' },
    { id: 'radar-comparison', label: '比較の読み方' },
    { id: 'voice-trends', label: '傾向' },
  ],
  'kakuriyo-review': [
    { id: 'review-warnings', label: '要確認' },
    { id: 'project-memory', label: '記憶と作品語' },
    { id: 'repetition-support', label: '反復' },
    { id: 'learning-state', label: '学習状態' },
  ],
  'kakuriyo-update': [
    { id: 'refresh-actions', label: '更新操作' },
    { id: 'cache-invalidation', label: '再解析条件' },
    { id: 'support-cache-files', label: '保存データ' },
    { id: 'fail-soft', label: '失敗時の動作' },
  ],
  statistics: [
    { id: 'statistics-feature', label: '開き方と範囲' },
    { id: 'statistics-tabs', label: '4つのタブ' },
    { id: 'statistics-metrics', label: '集計項目' },
    { id: 'statistics-cache', label: '再分析とキャッシュ' },
  ],
  git: [
    { id: 'git-start', label: '利用開始' },
    { id: 'git-dirty', label: '未記録の変更' },
    { id: 'git-history', label: '履歴と差分' },
    { id: 'git-restore', label: '復元' },
  ],
  saving: [
    { id: 'save-timing', label: '保存' },
    { id: 'draft-scope', label: '下書きの範囲' },
    { id: 'auto-save', label: '自動保存' },
    { id: 'manual-save', label: '手動保存' },
    { id: 'save-failures', label: '失敗時の扱い' },
  ],
  'import-export': [
    { id: 'text-copy-export', label: 'コピーとtxt' },
    { id: 'manuscript-copy', label: 'コピー時の改行' },
    { id: 'narou-import', label: 'なろう' },
    { id: 'kakuyomu-import', label: 'カクヨム' },
    { id: 'plain-text-import', label: '通常のTXT' },
  ],
  settings: [
    { id: 'settings-overview', label: '保存と初期化' },
  ],
  'settings-saving': [
    { id: 'setting-default-save-path', label: '保存場所' },
    { id: 'setting-auto-save', label: '自動保存' },
  ],
  'settings-writing': [
    { id: 'setting-ruby-count', label: 'ルビと文字数' },
    { id: 'setting-punctuation', label: '記号の自動変換' },
    { id: 'setting-manuscript-copy', label: '本文コピー' },
  ],
  'settings-appearance': [
    { id: 'setting-font-accent', label: 'フォントと色' },
    { id: 'setting-theme', label: 'テーマ' },
  ],
  'settings-support': [
    { id: 'setting-git', label: 'Git 連携' },
    { id: 'setting-link-support', label: 'リンクと初出' },
  ],
  shortcuts: [
    { id: 'shortcut-list', label: '編集モード' },
    { id: 'preview-shortcuts', label: 'プレビュー' },
    { id: 'mouse-shortcuts', label: 'マウス操作' },
  ],
  editions: [
    { id: 'edition-comparison', label: '機能比較' },
    { id: 'trial-limits', label: '体験版の作品数' },
    { id: 'trial-policy', label: 'データと期限' },
  ],
}

const currentToc = computed(() => pageTocMap[activePage.value] ?? [])

const kakuriyoSections = [
  { name: '概要', icon: 'gaiyou.svg', text: '解析状態、対象本文、更新時刻、要確認件数を表示します。' },
  { name: '文体レーダー', icon: 'buntai.svg', text: '現在話・章平均・全話平均を8軸で比較します。' },
  { name: '要確認', icon: 'kakunin.svg', text: '未確定語や表記ゆれなど、確認候補を一覧にします。' },
  { name: '記憶', icon: 'kioku.svg', text: '一般語と作品語、別名、読みを管理します。' },
  { name: '傾向', icon: 'koe.svg', text: '会話と地の文、語尾、句読点などの傾向を表示します。' },
  { name: '反復', icon: 'hanpuku.svg', text: '語尾、語句、比喩、段落リズムの反復候補を示します。' },
  { name: '学習状態', icon: 'tuiseki.svg', text: '採用・見送りの履歴と支援設定の状態を表示します。' },
]

function navigateTo(id: string) {
  const path = id === 'intro' ? '/nightover' : `/nightover/${id}`
  if (router.currentRoute.value.path !== path) router.push(path)
  query.value = ''
  menuOpen.value = false
}

async function openSearchResult(result: SearchEntry) {
  const path = result.page === 'intro' ? '/nightover' : `/nightover/${result.page}`
  if (router.currentRoute.value.path !== path) await router.push(path)
  query.value = ''
  menuOpen.value = false
  await nextTick()
  jumpToHeading(result.headingId)
}

function jumpToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScreenshotClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const link = target.closest<HTMLAnchorElement>('.app-screenshot a')
  const image = link?.querySelector<HTMLImageElement>('img')
  if (!link || !image) return

  event.preventDefault()
  lightboxTrigger = link
  lightboxSrc.value = link.href
  lightboxAlt.value = image.alt
  lightboxCaption.value = link.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ?? ''
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  nextTick(() => lightboxCloseButton.value?.focus())
}

function closeLightbox() {
  if (!lightboxSrc.value) return
  lightboxSrc.value = ''
  lightboxAlt.value = ''
  lightboxCaption.value = ''
  document.body.style.overflow = previousBodyOverflow
  nextTick(() => lightboxTrigger?.focus())
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && lightboxSrc.value) {
    event.preventDefault()
    closeLightbox()
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
    event.preventDefault()
    menuOpen.value = true
    nextTick(() => searchInput.value?.focus())
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.documentElement.classList.add('nightover-docs-open')
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow
  document.documentElement.classList.remove('nightover-docs-open')
})

watch(
  () => route.params.page,
  (page) => {
    if (typeof page === 'string' && legacyPageAliases[page]) {
      router.replace(`/nightover/${legacyPageAliases[page]}`)
      return
    }
    if (typeof page === 'string' && !allItems.some((item) => item.id === page)) {
      router.replace('/nightover')
      return
    }
    document.title = `${currentPage.value.label} | NIGHTOVER`
    window.scrollTo({ top: 0 })
  },
  { immediate: true },
)
</script>

<template>
  <div class="docs-site">
    <header class="docs-header">
      <button class="header-brand" type="button" aria-label="NIGHTOVER ドキュメントトップへ" @click="navigateTo('intro')">
        <img src="/images/nightover/nightover.ico" alt="" class="app-icon" />
        <img src="/images/nightover/NIGHTOVER_title.svg" alt="NIGHTOVER" class="title-logo" />
        <span class="docs-label">Documentation</span>
      </button>

      <div class="header-right">
        <button
          class="mobile-menu"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="docs-sidebar"
          @click="menuOpen = !menuOpen"
        >
          <span></span><span></span><span></span>
          <i>目次</i>
        </button>
      </div>
    </header>

    <div class="docs-layout">
      <aside id="docs-sidebar" :class="['docs-sidebar', { open: menuOpen }]">
        <div class="sidebar-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            placeholder="ドキュメントを検索"
            aria-label="ドキュメントを検索"
          />
          <kbd>Ctrl K</kbd>
        </div>

        <div v-if="query" class="sidebar-results">
          <p>検索結果</p>
          <button
            v-for="item in searchResults"
            :key="`${item.page}-${item.headingId}`"
            type="button"
            @click="openSearchResult(item)"
          >
            <strong>{{ item.title }}</strong>
            <small>{{ item.pageLabel }}</small>
          </button>
          <span v-if="searchResults.length === 0">一致する項目がありません</span>
        </div>

        <nav v-else aria-label="NIGHTOVER ドキュメント">
          <section v-for="group in navGroups" :key="group.label" class="nav-group">
            <h2>{{ group.label }}</h2>
            <button
              v-for="item in group.items"
              :key="item.id"
              :class="{ active: activePage === item.id }"
              type="button"
              @click="navigateTo(item.id)"
            >
              {{ item.label }}
            </button>
          </section>
        </nav>

        <div class="sidebar-version">
          <span>仕様基準日</span>
          <strong>2026-06-28</strong>
        </div>
      </aside>

      <main class="docs-content" @click="handleScreenshotClick">
        <article>
          <header v-if="activePage !== 'intro'" class="page-heading">
            <div class="breadcrumbs"><span>ドキュメント</span><i>/</i><span>{{ currentPage.label }}</span></div>
            <h1>{{ currentPage.label }}</h1>
          </header>

          <section v-if="activePage === 'intro'" id="intro" class="doc-section intro-section">
            <div class="breadcrumbs"><span>ドキュメント</span><i>/</i><span>はじめに</span></div>
            <h1>NIGHTOVER</h1>
            <p class="lead">
              NIGHTOVERは、小説執筆向けのWindowsデスクトップアプリです。本文、章と話、
              メモ、資料、締切、記録、解析支援をひとつのプロジェクトで管理します。
            </p>

            <h2 id="main-features">主な機能</h2>
            <ul>
              <li>横書き・縦書きでの本文編集とプレビュー</li>
              <li>章と話のアウトライン、締切、目標文字数、ステータス管理</li>
              <li>話・章・作品全体・全作品共通のメモ</li>
              <li>登場人物・展開・用語の資料管理と本文からのリンクジャンプ</li>
              <li>検索、置換、本文整形、統計、Gitを利用した記録と復元</li>
              <li>KAKURIYOによる文体・表記・反復などの解析支援</li>
            </ul>

            <h2 id="runtime">動作形式</h2>
            <div class="spec-table two-cols">
              <div class="table-head">項目</div><div class="table-head">内容</div>
              <div>対応環境</div><div>Windows</div>
              <div>アプリ形式</div><div>デスクトップアプリ</div>
              <div>実行ファイル</div><div><code>NIGHTOVER.exe</code></div>
              <div>作品データ</div><div>作品ごとのフォルダに保存</div>
              <div>表示テーマ</div><div>ダーク / ライト</div>
            </div>
          </section>

          <section v-if="activePage === 'workspace'" id="workspace" class="doc-section">
            <h3 id="editor-screen">エディタ画面</h3>
            <p>
              作品を開くと、左・中央・右の3つに分かれたエディタ画面を表示します。
              左右には作品を整理するための情報を置き、中央の本文を最も広く使う構成です。
            </p>
            <div class="spec-table workspace-table">
              <div class="table-head">ペイン</div><div class="table-head">内容</div><div class="table-head">基準幅</div>
              <div><strong>左</strong></div><div>プロジェクト、締切、アウトライン、総文字数、ステータス表示</div><div>320px</div>
              <div><strong>中央</strong></div><div>話ヘッダー、本文エディタ、Git記録、操作案内</div><div>可変</div>
              <div><strong>右</strong></div><div>メモ、資料、KAKURIYO支援</div><div>320px</div>
            </div>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/editor-overview.png" target="_blank" rel="noopener" aria-label="編集画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/editor-overview.png"
                  alt="NIGHTOVERの編集画面。左に章と話、中央に本文、右にメモを表示している"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 左に章・話、中央に本文、右にメモを表示した3ペイン構成</figcaption>
            </figure>
            <p>
              各ペインの表示内容と操作は、左メニューの「左ペイン」「中央ペイン」「右ペイン」で個別に説明します。
            </p>

            <h3 id="focus-mode">集中モード</h3>
            <p>
              ヘッダーの「集中」または<kbd>F11</kbd>で切り替えます。
              左右ペイン、Git操作、本文表示状態インジケータを隠し、中央の本文領域を広げます。
            </p>
            <ul>
              <li>本文、選択範囲、入力位置は変更しません。</li>
              <li>スクロール位置、縦書き状態、編集 / プレビュー状態を維持します。</li>
              <li>必要な場合は集中モード用のパネルボタンから右ペインだけを表示できます。</li>
              <li>本文下部の「ALT長押しでショートカット一覧」は残ります。</li>
            </ul>
            <div class="admonition note">
              <strong>集中モードについて</strong>
              <p>
                集中モードへ入っても、メモやGitの状態、本文データが削除・解除されることはありません。
                通常表示へ戻すと、それまでの作業状態で各領域が再表示されます。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'home'" id="home" class="doc-section">
            <h3 id="home-screen">作品を作成・選択する</h3>
            <p>ホーム画面は、作品を新しく作る、または既存の作品フォルダを開くための入口です。</p>
            <div class="spec-table two-cols">
              <div class="table-head">操作</div><div class="table-head">内容</div>
              <div><strong>新規プロジェクト</strong></div><div>作品名を入力し、設定されたデフォルト保存場所へ作品フォルダを作成します。</div>
              <div><strong>保存先から開く</strong></div><div>デフォルト保存場所にある有効なNIGHTOVER作品を一覧から開きます。</div>
              <div><strong>他の場所から開く</strong></div><div>任意の場所にある作品フォルダを選択して開きます。</div>
              <div><strong>最近のプロジェクト</strong></div><div>最近開いた作品を最大5件表示し、キーボード選択と<kbd>Enter</kbd>でも開けます。</div>
              <div><strong>テーマ</strong></div><div>右下のトグルからダーク / ライトを切り替えます。</div>
            </div>
            <p>
              作品として一覧へ表示されるには、フォルダ内に<code>project.json</code>と
              <code>manifest/outline.json</code>が必要です。必要なファイルが存在しない項目は候補から除外されます。
            </p>
            <div class="admonition warning">
              <strong>作品フォルダの削除</strong>
              <p>
                最近の作品または保存先一覧を右クリックすると、確認後に作品フォルダをOSのごみ箱へ移動できます。
                NIGHTOVER作品と判定できるフォルダだけが対象です。
              </p>
            </div>

            <h3 id="default-save-path">新規作品の保存先</h3>
            <p>
              新規プロジェクトは、設定したデフォルト保存場所へ作品フォルダを作成します。
              初期状態では<code>%USERPROFILE%\Documents\NIGHTOVER</code>を使用します。
            </p>
            <p>
              保存場所を変更しても、作成済みの作品は移動しません。
              変更後に新しく作る作品だけが新しい保存先へ作成され、既存作品は「他の場所から開く」から引き続き開けます。
            </p>
            <div class="admonition info">
              <strong>体験版での保存場所</strong>
              <p>
                体験版ではデフォルト保存場所を変更できません。初期の保存場所に作成した作品を使用します。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'workspace-left'" id="workspace-left" class="doc-section">
            <p>
              左ペインには、作品全体の進み具合と章・話の一覧をまとめて表示します。
              本文を開く、話を並べ替える、締切やステータスを確認するときに使います。
            </p>

            <h3 id="left-overview">左ペインの構成</h3>
            <div class="spec-table two-cols">
              <div class="table-head">位置</div><div class="table-head">表示内容</div>
              <div><strong>上部</strong></div><div>作品名、最近使った作品への切り替え、設定</div>
              <div><strong>進捗カード</strong></div><div>締切までの日数、作品全体の文字数、目標までの進捗</div>
              <div><strong>操作列</strong></div><div>章・話の追加、表示の切り替え、検索・置換</div>
              <div><strong>章・話の一覧</strong></div><div>アウトライン、各話の文字数、目標の進捗、ステータスの色</div>
              <div><strong>下部</strong></div><div>作品全体の合計文字数と、保存結果などのお知らせ</div>
            </div>

            <h3 id="left-deadline">締切と目標</h3>
            <p>
              進捗カードには、設定した締切までの日数と、作品全体の目標文字数に対する進み具合を表示します。
              未設定の場合は「目標設定」、設定済みの場合は<code>...</code>から内容を変更できます。
            </p>
            <p>
              話ごとの目標文字数を設定すると、各話の下に細い進捗バーが表示されます。
              現在の話については、同じ文字数を中央ペイン上部でも確認できます。
            </p>

            <h3 id="left-outline">章・話の一覧</h3>
            <ul>
              <li>一覧から読みたい話を選択します。</li>
              <li>ツリー表示にすると、章と話の並びが見やすくなります。章を折りたたむ機能ではありません。</li>
              <li>章や話をドラッグして並べ替えます。</li>
              <li>各話の右側に現在の文字数と、設定済みステータスの色を表示します。</li>
              <li>章を選ぶと、その章に付けたメモを右ペインへ表示します。</li>
              <li>右クリックから名前変更、本文のコピー、txt書き出しなどを行えます。</li>
            </ul>

            <h3 id="left-footer">下部の表示</h3>
            <p>
              一覧の下には作品全体の合計文字数を表示します。
              その下のお知らせ欄では、「保存しました」「自動保存しました」など直前の処理結果を確認できます。
            </p>
          </section>

          <section v-if="activePage === 'workspace-center'" id="workspace-center" class="doc-section">
            <p>
              中央ペインは本文を書くための領域です。
              上部で現在話と表示方法を確認し、中央で本文を編集し、下部から記録や履歴を開きます。
            </p>

            <h3 id="center-header">上部</h3>
            <p>現在開いている話と、本文に関係する主要操作を表示します。</p>
            <ul>
              <li>現在話のタイトルとステータス</li>
              <li>現在文字数、目標文字数、選択中の文字数</li>
              <li>横書き・縦書きのプレビュー</li>
              <li>集中モード</li>
              <li>文字サイズ、「字 / 行」、縦書き、統計を開く<code>...</code></li>
              <li>右ペインの開閉</li>
            </ul>
            <p>
              別の話を開くと、本文の上に「← 戻る: 直前の話タイトル」が表示されます。
              クリックすると、前に開いていた話へ戻れます。検索結果から別の話へ移動した場合も同様です。
              戻り先は直前の1件だけ保持します。
            </p>

            <h3 id="center-body">本文エリア</h3>
            <p>
              本文を直接編集する場所です。横書きと縦書きを切り替えられ、プレビューではルビや傍点を展開した状態を確認できます。
              検索結果や資料のリンクから移動したときは、該当箇所を選択または強調表示します。
            </p>
            <ul>
              <li>本文の選択、コピー、切り取り、貼り付け</li>
              <li>ルビ、傍点、ダッシュ、三点リーダなどの入力補助</li>
              <li>マウスホイール、中クリック、スクロールバーによる移動</li>
              <li>編集中の表示位置を保ったまま、編集とプレビューを切り替え</li>
            </ul>

            <h3 id="center-footer">下部</h3>
            <div class="spec-table two-cols">
              <div class="table-head">表示</div><div class="table-head">内容</div>
              <div><strong>操作案内</strong></div><div>プレビューや表示切り替え、ショートカット一覧の開き方</div>
              <div><strong>文字数</strong></div><div>現在話の文字数と、設定済みの場合は目標文字数</div>
              <div><strong>表示状態</strong></div><div>横書き・縦書きの状態や、表示上の注意を色付きの印で通知</div>
              <div><strong>記録</strong></div><div>現在の保存内容をGitの履歴として記録</div>
              <div><strong>履歴</strong></div><div>過去の記録、本文、差分、記録時点の章・話を確認</div>
            </div>
          </section>

          <section v-if="activePage === 'workspace-right'" id="workspace-right" class="doc-section">
            <p>
              右ペインは、本文を見ながらメモや資料を参照・編集する領域です。
              中央ペイン上部のボタンから開閉できます。
            </p>

            <h3 id="right-overview">右ペインの構成</h3>
            <div class="spec-table two-cols">
              <div class="table-head">場所</div><div class="table-head">内容</div>
              <div><strong>上部</strong></div><div>メモと資料の切り替え、KAKURIYO解析を開くボタン</div>
              <div><strong>一覧</strong></div><div>メモの種類、または資料のページを選択</div>
              <div><strong>本文</strong></div><div>選択したメモや資料の内容を表示・編集</div>
            </div>

            <h3 id="right-memo">メモ</h3>
            <p>
              「話ごと」「章ごと」「全体」「共通」から、用途に合うメモを選びます。
              「メモ一覧」では、作品内のメモを一覧から選び、下側で内容を確認できます。
            </p>
            <ul>
              <li>話ごとのメモは、現在開いている話に付属します。</li>
              <li>章ごとのメモは、現在の話が入っている章に付属します。</li>
              <li>全体メモは現在の作品、共通メモはすべての作品で共有します。</li>
            </ul>

            <h3 id="right-reference">資料</h3>
            <p>
              「登場人物」「展開」「用語」に分けて資料ページを管理します。
              上側の一覧からページを選び、下側で本文を編集します。本文中の名前から該当する資料へ移動することもできます。
            </p>

            <h3 id="right-kakuriyo">KAKURIYO</h3>
            <p>
              「KAKURIYO解析 ↗」を押すと、現在の本文を見直すための情報を別画面で開きます。
              右ペイン内の表示切り替えではないため、メモや資料を開いたまま利用できます。
            </p>
          </section>

          <section v-if="activePage === 'project'" id="project" class="doc-section">
            <h3 id="project-title">作品の切り替えと表示名</h3>
            <p>
              左ペイン上部の作品タイトルを左クリックすると、最近使った作品へ切り替えるポップアップを開きます。
              右クリックすると、現在作品の表示タイトルを変更できます。
            </p>
            <div class="admonition note">
              <strong>表示名について</strong>
              <p>
                作品タイトルの変更は<code>project.json</code>の表示名へ反映されます。
                作品フォルダ名と内部のプロジェクトIDは変更しません。
              </p>
            </div>

            <h3 id="outline">アウトライン</h3>
            <p>左ペインのアウトラインで章と話を管理します。本文の編集対象は常に「話」です。</p>
            <ul>
              <li>章と話の追加、名前変更、削除</li>
              <li>ドラッグによる並び替え</li>
              <li>通常表示とツリー表示の切り替え</li>
              <li>話ごとの文字数、ステータス、目標文字数の進捗表示</li>
              <li>章を選択した場合は本文を切り替えず、章メモを表示</li>
              <li>上下キーでは章を飛ばして話同士を移動</li>
            </ul>
            <p>
              章をクリックした場合は本文を切り替えず、その章のメモを右ペインへ表示します。
              章の下に属する話の合計文字数は章行の右端へ表示されます。
            </p>

            <h3 id="outline-menu">アウトラインの右クリック操作</h3>
            <div class="spec-table two-cols">
              <div class="table-head">操作</div><div class="table-head">適用範囲</div>
              <div>行頭に空白を挿入</div><div>右クリックした章または話の本文</div>
              <div>作品全体の行頭に空白を挿入</div><div>すべての話</div>
              <div>本文をコピー</div><div>右クリックした章または話。複数話選択中は選択範囲</div>
              <div>txt書き出し</div><div>章、話、選択中の話、または作品全体</div>
              <div>名前変更</div><div>対象の章または話の表示名</div>
              <div>削除</div><div>対象の章または話（実行前に削除対象を確認）</div>
            </div>
          </section>

          <section v-if="activePage === 'project-deadline'" id="project-deadline" class="doc-section">
            <h3 id="deadline">締切と目標文字数</h3>
            <p>未設定時は「目標設定」、設定済みの場合は締切カードの<code>...</code>から編集します。</p>
            <div class="spec-table two-cols">
              <div class="table-head">設定</div><div class="table-head">表示への反映</div>
              <div><strong>締切日</strong></div><div>カレンダーから選択し、左ペインの締切カードへ残り日数を表示します。</div>
              <div><strong>作品全体の目標文字数</strong></div><div>総文字数と目標の進捗バーを左ペイン上部へ表示します。</div>
              <div><strong>話ごとの目標文字数</strong></div><div>アウトライン行の細い進捗バーと、中央ヘッダーの現在/目標表示へ反映します。</div>
            </div>
            <figure class="app-screenshot app-screenshot--dialog">
              <a href="/images/nightover/screenshots/deadline-goals.png" target="_blank" rel="noopener" aria-label="締切と目標文字数の設定画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/deadline-goals.png"
                  alt="締切日、作品全体の目標文字数、話ごとの目標文字数を設定する画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 締切日と、作品全体・各話の目標文字数</figcaption>
            </figure>
            <p>
              話ごとの目標は全話共通値です。設定後に追加した話にも同じ値を引き継ぎます。
              進捗に使う文字数は、設定ページのルビ・スペース除外規則と共通です。
            </p>
          </section>

          <section v-if="activePage === 'project-status'" id="project-status" class="doc-section">
            <h3 id="status">ステータス</h3>
            <p>
              中央ヘッダーのステータス欄から、現在話へ任意のステータスを割り当てます。
              割り当てた色は、左ペインにある各話の右端にも表示されます。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/status-location.png" target="_blank" rel="noopener" aria-label="ステータス欄とステータス一覧を原寸で開く">
                <img
                  src="/images/nightover/screenshots/status-location.png"
                  alt="中央ヘッダーで開いたステータス一覧と、各話の右端に色付きの印が表示された左ペイン"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 中央ヘッダーのステータス欄と、左ペインへの表示位置</figcaption>
            </figure>
            <div class="status-row">
              <span class="status draft">下書き</span>
              <span class="status revision">改稿中</span>
              <span class="status done">改稿完了</span>
              <span class="status custom">ユーザー追加</span>
            </div>
            <figure class="app-screenshot app-screenshot--dialog">
              <a href="/images/nightover/screenshots/status-outline-indicator.png" target="_blank" rel="noopener" aria-label="左ペインのステータス表示を原寸で開く">
                <img
                  src="/images/nightover/screenshots/status-outline-indicator.png"
                  alt="左ペインの話一覧で、文字数の右側にステータスの色が表示されている状態"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 左ペインでは各話の右端にステータスの色を表示</figcaption>
            </figure>
            <p>
              全作品共通のステータスと、現在の作品だけで使うステータスを分けて管理できます。
              管理画面では追加、色変更、削除に対応しますが、既存ステータス名の直接変更は行いません。
            </p>
            <ul>
              <li><strong>共通</strong> — すべての作品で利用し、<code>%APPDATA%\NIGHTOVER\common-statuses.json</code>へ保存します。</li>
              <li><strong>プロジェクト</strong> — 現在作品だけで利用し、<code>manifest/statuses.json</code>へ保存します。</li>
              <li><strong>改稿中</strong> — 置換後の自動マーキングにも使う予約ステータスで、削除できません。</li>
              <li><strong>改稿完了</strong> — 初期状態で存在しますが、必要なら削除できます。</li>
            </ul>
            <p>
              使用中のステータスを削除した場合、そのステータスだった話は「不明なステータス」へ変更されます。
              「不明なステータス」は、通常のステータス一覧には表示されません。
            </p>
          </section>

          <section v-if="activePage === 'data-files'" id="data-files" class="doc-section">
            <p>
              NIGHTOVERは作品ごとに1つのフォルダを作り、本文、章・話、メモ、資料、解析結果をその中へ保存します。
              アプリ全体で共有する設定や共通メモだけはWindowsのアプリデータ領域へ保存します。
            </p>

            <h3 id="project-file-map">作品フォルダのファイル構成</h3>
            <div class="spec-table file-map-table">
              <div class="table-head">データ</div><div class="table-head">保存先</div>
              <div>作品情報</div><div><code>project.json</code></div>
              <div>章・話と割り当て状態</div><div><code>manifest/outline.json</code></div>
              <div>締切と目標</div><div><code>manifest/deadline.json</code></div>
              <div>作品専用ステータス</div><div><code>manifest/statuses.json</code></div>
              <div>初出情報</div><div><code>manifest/first-appearances.json</code></div>
              <div>統計キャッシュ</div><div><code>manifest/statistics-cache.json</code></div>
              <div>KAKURIYOの状態とキャッシュ</div><div><code>manifest/kakuriyo-state.json</code> / <code>manifest/kakuriyo/</code></div>
              <div>各話の本文</div><div><code>manuscripts/{episodeId}.txt</code></div>
              <div>話・章・作品メモ</div><div><code>notes/episode/</code> / <code>notes/chapter/</code> / <code>notes/project.md</code></div>
              <div>資料ページ</div><div><code>notes/reference/{tabId}/</code></div>
            </div>
            <p>
              <code>project.json</code>と<code>manifest/outline.json</code>は作品として認識するための必須ファイルです。
              本文ファイル名には表示中の話タイトルではなく、話へ割り当てられた内部IDを使用します。
            </p>

            <h3 id="global-file-map">アプリ全体で共有するデータ</h3>
            <p>次のファイルは<code>%APPDATA%\NIGHTOVER</code>以下へ保存され、作品フォルダには含まれません。</p>
            <div class="spec-table two-cols">
              <div class="table-head">ファイル</div><div class="table-head">内容</div>
              <div><code>settings.json</code></div><div>テーマ、フォント、自動保存などのアプリ設定</div>
              <div><code>recent.json</code></div><div>最近使った作品の一覧</div>
              <div><code>global-memo.md</code></div><div>すべての作品で利用する共通メモ</div>
              <div><code>common-statuses.json</code></div><div>全作品共通のステータス定義</div>
            </div>
            <div class="admonition note">
              <strong>作品フォルダだけを移した場合</strong>
              <p>
                本文、章・話、作品メモ、資料などは移動できますが、共通メモ、共通ステータス、アプリ設定は移動元PCの
                <code>%APPDATA%\NIGHTOVER</code>に残ります。
              </p>
            </div>

            <h3 id="project-lock">同じ作品の多重起動防止</h3>
            <p>
              同じWindowsセッション内で、同じ作品フォルダを複数のNIGHTOVERから同時に開くことはできません。
              作品パスをもとにした実ロックで、同時編集による上書きを防ぎます。
            </p>
            <p>
              作品ルートの<code>.nightover.lock</code>にはPIDや端末名などの補助情報を保存します。
              アプリの異常終了などでこのファイルだけが残っても、残骸だけを理由に起動を拒否する仕様ではありません。
            </p>

            <h3 id="backup-guide">バックアップする範囲</h3>
            <p>
              作品を完全にバックアップする場合は、個別の本文ファイルだけでなく作品フォルダ全体を対象にしてください。
              <code>manifest</code>、<code>manuscripts</code>、<code>notes</code>をまとめて保持することで、
              章・話の並び、メモ、資料、進捗、解析状態を同じ時点へ戻せます。
            </p>
            <ul>
              <li>コピー前に手動保存し、可能なら作品を閉じます。</li>
              <li>作品フォルダ内にGitを初期化している場合は、履歴も含めるため隠し項目を除外しないでください。</li>
              <li>別PCへ移す場合、共通メモやアプリ設定も必要なら<code>%APPDATA%\NIGHTOVER</code>を別途保管します。</li>
              <li>一部のキャッシュは再生成できますが、本文とメモを含む作品フォルダ全体を正本として扱うのが安全です。</li>
            </ul>
          </section>

          <section v-if="activePage === 'editor-display'" id="editor-display" class="doc-section">
            <p>同じ本文データを4種類の表示モードで扱います。</p>

            <h3 id="display-controls">本文表示の設定</h3>
            <p>中央ヘッダーの<code>...</code>から、本文表示に関係する項目を変更します。</p>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">範囲</div><div class="table-head">動作</div>
              <div><strong>文字サイズ</strong></div><div>8〜16</div><div>10と11の間だけ10.5を挟み、それ以外は1刻みで変更します。</div>
              <div><strong>字 / 行</strong></div><div>10〜120字</div><div>横書きの折り返し字数と、縦書きの1列あたり文字数へ即時反映します。</div>
              <div><strong>縦書き</strong></div><div>ON / OFF</div><div>編集とプレビューの組方向をまとめて切り替えます。</div>
              <div><strong>統計</strong></div><div>製品版</div><div>本文の編集状態を変えずに統計画面を開きます。</div>
            </div>
            <p>
              文字サイズ、字 / 行、縦書き状態はアプリの表示設定として保存されます。
              本文ファイル自体へフォントや組方向の情報を書き込むことはありません。
            </p>

            <h3 id="display-modes">4つの表示モード</h3>
            <div class="spec-table editor-modes">
              <div class="table-head">表示モード</div><div class="table-head">編集</div><div class="table-head">用途</div>
              <div><strong>横書き編集</strong></div><div>可能</div><div>通常の本文執筆</div>
              <div><strong>横書きプレビュー</strong></div><div>不可</div><div>ルビを展開した横組み確認</div>
              <div><strong>縦書き編集</strong></div><div>可能</div><div>縦組みのまま本文を編集</div>
              <div><strong>縦書きプレビュー</strong></div><div>不可</div><div>ルビと縦組み字形を含む確認</div>
            </div>
            <p>
              縦書きOFFでは「プレビュー」で横書き編集と横書きプレビューを往復し、
              縦書きONでは縦書き編集と縦書きプレビューを往復します。
              モードを切り替えても、現在見ている本文位置を目印として保持し、先頭へ飛ばないよう復元します。
            </p>

            <h3 id="horizontal-writing">横書き</h3>
            <ul>
              <li>現在のフォントで実測した文字幅を使い、英数字や和英混在行も考慮して折り返します。</li>
              <li>本文枠が設定字数ぶんの幅より狭い場合は、指定字数より早く折り返すことがあります。</li>
              <li>行末の句読点や閉じ括弧は、次の行へ送らずにぶら下げて表示します。</li>
            </ul>
            <p>
              横書きプレビューではルビ記法を展開し、読み取り専用で表示します。
              長いルビは親文字中央へ寄せたうえで本文欄からはみ出さないように調整し、収まらない部分は表示範囲へ制限します。
              <kbd>Esc</kbd>で横書き編集へ戻ります。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/preview-ruby.png" target="_blank" rel="noopener" aria-label="横書き編集と横書きプレビューの比較を原寸で開く">
                <img
                  src="/images/nightover/screenshots/preview-ruby.png"
                  alt="中央ペインを並べた比較。左は横書き編集、右はルビを展開した横書きプレビュー"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 左: 横書き編集 / 右: 横書きプレビュー</figcaption>
            </figure>

            <h3 id="vertical-writing">縦書き編集</h3>
            <p>横書きと同じ保存本文を、縦組みのまま直接編集します。縦書き編集は読み取り専用ではありません。</p>
            <ul>
              <li>列は右から左へ進み、設定した「字 / 行」を列分割へ反映します。</li>
              <li>入力、改行、選択、貼り付け、undo / redoは横書きと同じ本文位置を更新します。</li>
              <li>ルビ記法は展開せず、<code>|親文字《ルビ》</code>をそのまま編集します。</li>
              <li><kbd>↑</kbd> / <kbd>↓</kbd>は本文上の前後、<kbd>←</kbd> / <kbd>→</kbd>は列間を移動します。</li>
              <li><kbd>Home</kbd> / <kbd>End</kbd>は現在列の先頭 / 末尾、<kbd>PageUp</kbd> / <kbd>PageDown</kbd>は表示列単位で移動します。</li>
              <li>改行だけの列もクリック、選択、入力位置の対象です。</li>
            </ul>

            <h3 id="vertical-preview">縦書きプレビュー</h3>
            <p>ルビや縦組み字形を展開した、読み取り専用の縦組み確認モードです。</p>
            <ul>
              <li>ルビは、親文字が始まる列に表示します。</li>
              <li>半角英数字や対象記号は連続単位として90度回転表示します。文字数による縦中横は行いません。</li>
              <li>句読点、括弧、波線、ダッシュ類は、保存本文を変えず描画時だけ縦組み互換字形を優先します。</li>
              <li>互換字形がない場合は元字形または回転表示で代替し、表示状態インジケータへ注意を出します。</li>
              <li><kbd>Esc</kbd>では縦書きも解除して横書き編集へ戻ります。「プレビュー」ボタンで戻る場合は縦書き編集を維持します。</li>
            </ul>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/vertical-preview.png" target="_blank" rel="noopener" aria-label="縦書き編集と縦書きプレビューの比較を原寸で開く">
                <img
                  src="/images/nightover/screenshots/vertical-preview.png"
                  alt="中央ペインを並べた比較。左は縦書き編集、右はルビと縦組み字形を展開した縦書きプレビュー"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 左: 縦書き編集 / 右: 縦書きプレビュー</figcaption>
            </figure>

            <h3 id="display-indicator">本文表示状態インジケータ</h3>
            <p>Git操作の左側にある小さな四角で、現在の表示モードと表示上の制約を知らせます。</p>
            <ul>
              <li><strong class="yes">緑</strong> — 「横書き表示中」「縦書き表示中」などの情報</li>
              <li><strong class="indicator-warning">赤</strong> — 互換字形の代替表示や、設定字数より早い折り返しなどの注意</li>
            </ul>
            <p>
              赤表示は本文データの破損を示すエラーではありません。現在の枠やフォントでは表示上の代替が発生していることを知らせます。
              集中モード中はインジケータ自体を隠しますが、表示モードは維持されます。
            </p>
            <figure class="app-screenshot app-screenshot--indicator">
              <a href="/images/nightover/screenshots/display-indicator.png" target="_blank" rel="noopener" aria-label="本文表示状態インジケータを原寸で開く">
                <img
                  src="/images/nightover/screenshots/display-indicator.png"
                  alt="中央ペイン下部にある本文表示状態インジケータを拡大した画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 中央ペイン下部の本文表示状態インジケータ</figcaption>
            </figure>
          </section>

          <section v-if="activePage === 'editor-input'" id="editor-input" class="doc-section">
            <p>本文の入力、選択、コピー、移動に関する操作を説明します。</p>

            <h3 id="text-input">入力とIME</h3>
            <p>
              編集モードでは通常文字、改行、タブ、貼り付けを本文へ挿入できます。
              IME変換中の文字列は本文上へ重ね、変換範囲を下線で表示します。候補窓は横書き・縦書きそれぞれのキャレットへ追従します。
            </p>
            <p>
              IME変換中にIME側が扱う矢印、<kbd>Backspace</kbd>、<kbd>Delete</kbd>はWindows標準処理へ渡します。
              確定文字列は1回だけ本文へ反映し、確定直後の重複入力を抑制します。
            </p>

            <h3 id="selection-copy">選択・コピー・貼り付け</h3>
            <ul>
              <li>ドラッグ選択と<kbd>Shift</kbd> + クリックによる範囲拡張</li>
              <li>ダブルクリックで単語、<kbd>Ctrl</kbd> + ダブルクリックで文を選択</li>
              <li><kbd>Ctrl</kbd> + 矢印で単語単位移動、<kbd>Ctrl</kbd> + <kbd>Backspace</kbd> / <kbd>Delete</kbd>で単語単位削除</li>
              <li><kbd>Ctrl</kbd> + <kbd>Home</kbd> / <kbd>End</kbd>で本文先頭 / 末尾へ移動</li>
              <li>表示モードを変えても、本文上の同じ選択範囲を維持</li>
            </ul>
            <p>
              通常のコピーは選択範囲だけを対象にし、右クリックの「本文をコピー」は現在話の本文全体を対象にします。
              プレビュー中は新しい選択、切り取り、貼り付けを受け付けません。
            </p>

            <h3 id="editor-scroll">マウスとスクロール</h3>
            <div class="spec-table two-cols">
              <div class="table-head">操作</div><div class="table-head">動作</div>
              <div>ホイール</div><div>横書きでは1行、縦書きでは1列ずつ移動</div>
              <div><kbd>Shift</kbd> + ホイール</div><div>横書きでは3行、縦書きでは3列ずつ移動</div>
              <div>中クリック</div><div>基準点を表示し、横書きでは上下、縦書きでは左右のオートスクロール</div>
              <div>本文専用スクロールバー</div><div>横書きは右側の縦バー、縦書きは下部の横バーを使用</div>
            </div>
          </section>

          <section v-if="activePage === 'ruby'" id="ruby" class="doc-section">
            <h3 id="ruby-syntax">ルビ</h3>
            <p>本文中では次の記法を使用します。</p>
            <pre><code>|親文字《ルビ》
｜親文字《ルビ》
漢字《かな》</code></pre>
            <p>
              本文を選択してルビ操作を実行すると、入力ダイアログからルビを設定できます。
              親文字とルビの文字数上限は設定で変更できます。
            </p>
            <p>
              明示記法は半角の<code>|</code>と全角の<code>｜</code>に対応します。
              条件を満たす漢字列では縦線を省略した<code>漢字《かな》</code>もプレビューで解釈します。
              編集中は記法を保存本文どおりに表示し、プレビュー時だけ親文字と読みへ展開します。
            </p>

            <h3 id="ruby-validation">ルビを挿入できる条件</h3>
            <ul>
              <li>親文字とルビの両方が空ではないこと</li>
              <li>親文字とルビに改行を含まないこと</li>
              <li>設定した親文字上限・ルビ文字上限を超えないこと</li>
              <li>ルビ入力欄の前後空白を除いたあとに有効な文字が残ること</li>
            </ul>
            <p>
              条件に合わない場合は本文へ記法を挿入せず、現在の文字数と設定上限を含む案内を表示します。
              既存本文に不正な記法がある場合、プレビューと文字数計算では通常の本文として扱います。
            </p>

            <h3 id="ruby-count">ルビ上限と文字数計算</h3>
            <p>
              ルビの文字数上限は、投稿先の仕様に合わせるために変更できます。
              初期値は小説家になろうに合わせて親文字・ルビともに10字です。
              カクヨムへ投稿する場合は、親文字20字、ルビ50字まで使用できます。
            </p>
            <p>
              親文字またはルビが上限を超えた場合は、ルビ操作ボタンと入力確定時に案内を表示します。
              上限を変えると、開いている作品の文字数キャッシュと統計も新しい条件で再計算します。
            </p>
            <p>
              「ルビ・スペースを除外」がONでも、ルビの親文字は文字数へ含まれます。
              改行は設定に関係なく文字数へ含めず、ルビとして解釈できない記法は通常の本文として数えます。
            </p>
            <div class="setting-example">
              <strong>文字数計算の例</strong>
              <p>
                <code>|東京《とうきょう》 へ</code>は、除外設定がONなら親文字の「東京」と「へ」だけを数えて3字です。
                OFFならルビ記号、読み、スペースも保存本文どおりに数えて12字です。
              </p>
            </div>
            <p>
              同じ数え方を、現在話とアウトラインの文字数、締切の進捗、選択文字数、統計で共通して使用します。
              上限と除外方法は「本文・入力の設定」で変更できます。
            </p>

            <h3 id="emphasis">傍点</h3>
            <p>
              傍点は、対象文字に「・」のルビを付ける方法で表現します。空白、タブ、改行はそのまま保持します。
              選択範囲には<kbd>Ctrl</kbd> + <kbd>B</kbd>でも適用できます。
            </p>
            <p>
              選択範囲に傍点を付けられる文字が1つもない場合は挿入しません。
              空白をまたぐ選択では、空白を削除せず、傍点を付けられる文字だけへ記法を適用します。
            </p>

            <h3 id="annotation-behavior">保存と取り消し</h3>
            <p>
              ルビと傍点の挿入は通常の本文編集と同じ1回の編集操作として扱い、undo / redoで戻せます。
              選択時に表示されるルビ・傍点パネルは、選択解除、プレビューへの移動、別画面への切り替え、
              アプリが非アクティブになった場合に閉じます。
            </p>
            <div class="admonition note">
              <strong>保存本文について</strong>
              <p>
                保存本文はプレーンテキストです。プレビュー表示のために保存本文を書き換えることはありません。
                ルビは記法のまま保存し、縦組み字形やルビ位置は表示時にだけ解釈します。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'input-assist'" id="input-assist" class="doc-section">
            <p>
              入力したダッシュや三点リーダを、小説本文で使う表記へ自動的に置き換えられます。
              既存本文の一括変換ではなく、設定を有効にしたあとの入力と置換文字列が対象です。
            </p>

            <h3 id="punctuation">ダッシュと三点リーダの自動変換</h3>
            <div class="spec-table punctuation-settings-table">
              <div class="table-head">機能</div><div class="table-head">入力</div><div class="table-head">結果</div><div class="table-head">利用範囲</div>
              <div><strong>ダッシュ線を罫線文字へ置換</strong></div><div><code>―</code> / <code>—</code></div><div><code>─</code></div><div>体験版・製品版</div>
              <div><strong>三点リーダへ置換</strong></div><div><code>...</code></div><div><code>…</code></div><div>製品版</div>
              <div><strong>単独記号を二連化</strong></div><div><code>…</code></div><div><code>……</code></div><div>製品版</div>
            </div>
            <p>
              二連化は、<code>─</code>、<code>—</code>、<code>―</code>、<code>…</code>のいずれかを1文字だけ入力した場合に適用します。
              置換機能で入力した置換文字列にも、同じ自動変換を適用します。
            </p>
            <p>
              設定を有効にしても、すでに保存されている本文は書き換えません。
              以前の本文もそろえたい場合は、検索・置換または本文整形を使用します。
            </p>

            <h3 id="punctuation-combination">設定を組み合わせた場合</h3>
            <p>
              「ダッシュ線を罫線文字へ置換」と「単独記号を二連化」を両方有効にして<code>―</code>を入力すると、
              先に<code>─</code>へ変換し、その後に二連化して<code>──</code>にします。
            </p>
            <p>
              製品版で三点リーダ化と二連化を両方有効にした場合、<code>...</code>は<code>……</code>になります。
              各機能のON / OFFは「本文・入力の設定」で切り替えます。
            </p>
            <div class="admonition info">
              <strong>体験版で使える変換</strong>
              <p>
                ダッシュ線を罫線文字へ置き換える機能は体験版でも利用できます。
                三点リーダへの変換と単独記号の二連化は製品版の機能です。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'search'" id="search" class="doc-section">
            <p>検索 / 置換ダイアログには、検索、置換、整形の3タブがあります。</p>

            <h3 id="search-tab">検索</h3>
            <ul>
              <li>プロジェクト内のすべての本文を検索</li>
              <li>一致箇所を中心に前後の文脈を含む結果一覧</li>
              <li>同じ行に複数の一致がある場合は<code>[n/N]</code>形式で現在位置と件数を表示</li>
              <li>結果へマウスを重ねた場合の補足パネル</li>
              <li>結果のクリックまたは<kbd>Enter</kbd>で本文へ移動</li>
            </ul>
            <figure class="app-screenshot app-screenshot--dialog">
              <a href="/images/nightover/screenshots/search-results.png" target="_blank" rel="noopener" aria-label="検索結果画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/search-results.png"
                  alt="作品全体から先生という語を検索し、話名と前後の本文を一覧表示した画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 作品全体の検索結果。話名と一致箇所周辺を一覧表示</figcaption>
            </figure>

            <h3 id="search-jump">検索結果へ移動したとき</h3>
            <p>
              検索結果を選ぶと対象の話を開き、一致範囲を選択します。
              縦書き表示中またはプレビュー中でも、対象文字を編集・確認できることを優先し、横書き編集へ戻してから移動します。
            </p>
            <p>
              この移動は通常の表示モード切り替えと異なり、以前の縦書き / プレビュー状態より検索対象の選択を優先します。
            </p>

            <h3 id="replace-tab">置換</h3>
            <ul>
              <li>現在の1件だけ置換</li>
              <li>すべて置換</li>
              <li>置換した話を「改稿中」へ変更するオプション</li>
              <li>設定されたダッシュ・三点リーダ変換を置換文字列へ適用</li>
            </ul>
            <p>
              「改稿中」への変更を有効にした場合、実際に本文が変更された話だけを対象にします。
              置換文字列には入力時と同じ記号変換設定が適用されるため、設定内容によっては入力した置換文字列と保存結果が異なります。
            </p>

            <h3 id="format-tab">整形</h3>
            <div class="spec-table two-cols">
              <div class="table-head">整形</div><div class="table-head">変更内容</div>
              <div><strong>文頭・文末改行を削除</strong></div><div>本文の端にある改行と空白だけの行を削除し、本文中の段落や空行は変更しません。</div>
              <div><strong>行頭空白を削除</strong></div><div>各行先頭の半角スペース、全角スペース、タブを削除します。</div>
              <div><strong>行頭空白を挿入</strong></div><div>現在話または全話の行頭へ空白を挿入します。</div>
              <div><strong>空白行を空行へ変換</strong></div><div>半角・全角スペース、タブだけの行から空白文字を取り除きます。</div>
              <div><strong>連続空行を圧縮</strong></div><div>連続する空行を指定数まで縮めます。0を指定した場合は空行を残しません。</div>
            </div>
            <figure class="app-screenshot app-screenshot--dialog">
              <a href="/images/nightover/screenshots/format-tools.png" target="_blank" rel="noopener" aria-label="本文整形画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/format-tools.png"
                  alt="現在の話または全話を対象に改行や行頭空白を整える整形タブ"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 現在話と全話を選べる本文整形</figcaption>
            </figure>
            <p>各操作は現在話だけ、またはプロジェクト内の全話を対象に実行できます。</p>

            <h3 id="format-undo">直前の整形を戻す</h3>
            <p>
              本文を変更した直前の整形操作を1回だけ取り消せます。
              戻し情報は作品を開いている間保持されるため、整形ダイアログを閉じて開き直しても利用できます。
              整形タブを表示している間は<kbd>Ctrl</kbd> + <kbd>Z</kbd>でも同じ取り消しを実行します。
            </p>
            <div class="admonition warning">
              <strong>整形の取り消し範囲</strong>
              <p>
                複数回の整形履歴をさかのぼる機能ではありません。作品を閉じる前に結果を確認してください。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'notes'" id="notes" class="doc-section">
            <h3 id="memo-types">メモ</h3>
            <p>右ペインのメモは、用途ごとに4つの範囲へ分かれています。</p>
            <div class="spec-table two-cols">
              <div class="table-head">種類</div><div class="table-head">用途</div>
              <div>話ごと</div><div>現在開いている話に紐づくメモ</div>
              <div>章ごと</div><div>現在の話が属する章に紐づくメモ</div>
              <div>全体</div><div>現在の作品全体で共有するメモ</div>
              <div>共通</div><div>すべての作品から利用する共通メモ</div>
            </div>
            <p>
              話メモは<code>notes/episode/{episodeId}.md</code>、章メモは<code>notes/chapter/{chapterId}.md</code>、
              作品メモは<code>notes/project.md</code>へ保存します。共通メモだけは作品フォルダ外の
              <code>%APPDATA%\NIGHTOVER\global-memo.md</code>へ保存します。
            </p>

            <h3 id="memo-behavior">メモの切り替えと保存</h3>
            <ul>
              <li>話メモは現在開いている話へ追従します。</li>
              <li>話を開くと、その話が属する章のメモを表示します。</li>
              <li>所属章がない話では章メモを編集できません。</li>
              <li>メモ一覧では話 / 章を切り替え、別項目のメモを一覧と本文の上下分割で確認できます。</li>
              <li>一覧は6件表示を基準とし、ホイールとスクロールバーで移動します。</li>
              <li>メモ本文は<kbd>Ctrl</kbd> + <kbd>S</kbd>と自動保存の対象です。</li>
            </ul>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/memo-list.png" target="_blank" rel="noopener" aria-label="メモ一覧を原寸で開く">
                <img
                  src="/images/nightover/screenshots/memo-list.png"
                  alt="左右の他ペインを暗くし、右ペインの話ごとのメモ一覧を強調したNIGHTOVERの編集画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 右ペインのメモ一覧を強調表示</figcaption>
            </figure>
          </section>

          <section v-if="activePage === 'references'" id="references-page" class="doc-section">
            <h3 id="references">資料</h3>
            <p>資料は次の3カテゴリに分かれています。</p>
            <ul>
              <li><strong>登場人物</strong> — 人物設定、関係、呼び方など</li>
              <li><strong>展開</strong> — プロット、場面、伏線など</li>
              <li><strong>用語</strong> — 固有名詞、地名、作中用語など</li>
            </ul>
            <p>各カテゴリはページ一覧と本文欄を持ち、ページ本文はMarkdownファイルとして作品フォルダへ保存されます。</p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/reference-pane.png" target="_blank" rel="noopener" aria-label="資料タブを原寸で開く">
                <img
                  src="/images/nightover/screenshots/reference-pane.png"
                  alt="左右の他ペインを暗くし、右ペインの資料タブを強調したNIGHTOVERの編集画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 右ペインの資料タブを強調表示</figcaption>
            </figure>

            <h3 id="reference-rules">資料ページの操作と規則</h3>
            <ul>
              <li><code>+</code>でページを追加します。</li>
              <li>ページ名をダブルクリックすると名前を変更します。</li>
              <li>右クリックから削除します。</li>
              <li>同じカテゴリ内では、同じ名前のページを追加・改名できません。</li>
              <li>選択状態は表示名ではなく内部のページIDを基準に保持します。</li>
              <li>資料本文も<kbd>Ctrl</kbd> + <kbd>S</kbd>と自動保存の対象です。</li>
            </ul>
          </section>

          <section v-if="activePage === 'linking'" id="linking" class="doc-section">
            <h3 id="text-linking">本文との連携</h3>
            <ul>
              <li>登場人物・用語と一致する本文をハイライト</li>
              <li>本文の右クリックメニューから「リンク先へ移動」</li>
              <li>登場人物・用語の資料に初出話を表示</li>
              <li>登場人物・用語をKAKURIYOの作品語へ自動同期</li>
            </ul>
            <p>
              本文と資料を結び付ける機能は、「用語リンクハイライト / ジャンプ」と「初出チェック」に分かれています。
              それぞれ個別に有効化できます。
            </p>

            <h3 id="link-support">リンクジャンプ</h3>
            <p>
              リンクジャンプを有効にすると、資料の「登場人物」または「用語」に登録したページ名と一致する本文をハイライトします。
              対象語の右クリックメニューから「リンク先へ移動」を選ぶと、右ペインで対応する資料ページを開きます。
            </p>
            <p>
              用語は資料ページのタイトルをそのまま候補にします。
              登場人物はタイトルに加え、名前から中黒、括弧、半角・全角スペースを除いた形や、分割した名前も候補として扱います。
              短い別名などの弱い一致は他の資料と衝突しない場合だけ有効になり、1文字だけの語など誤検出しやすい候補は抑制します。
            </p>
            <div class="setting-example">
              <strong>リンクを開く操作</strong>
              <p>
                ハイライト部分を左クリックしただけでは移動しません。
                右クリックして「リンク先へ移動」を実行すると、右ペインの資料タブで該当ページを開きます。
              </p>
            </div>

            <h3 id="first-appearance">初出チェック</h3>
            <p>
              初出チェックを有効にすると、登場人物と用語が作品内で最初に現れる話を検出し、資料ページへ表示します。
              初出ラベルには「初出: 『話タイトル』」のほか、未検出や計算中の状態も表示します。
            </p>
            <p>
              プロジェクト読込時、設定を有効にしたとき、本文保存時、資料ページの追加・名前変更・削除時に検出内容を更新します。
              本文保存後の走査はバックグラウンドで行うため、そのまま編集を続けられます。
            </p>
            <p>
              無効にすると新しい走査を停止し、画面表示に使っていた初出キャッシュを破棄します。
              再び有効にすると、現在の本文と資料をもとに検出情報を作り直します。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/first-appearance-check.png" target="_blank" rel="noopener" aria-label="初出チェックの実機画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/first-appearance-check.png"
                  alt="本文「でかいカニ」で強調された用語「釣具」と、資料「釣具」に表示された初出「でかいカニ」を並べた実機画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 本文「でかいカニ」の用語「釣具」と、資料に表示された初出</figcaption>
            </figure>
          </section>

          <section v-if="activePage === 'kakuriyo'" id="kakuriyo" class="doc-section">
            <div class="section-title-with-icon">
              <img src="/images/nightover/KAKURIYO.svg" alt="" class="kakuriyo-main-icon" />
              <div>
                <p>
                  現在の本文を解析し、文章を見直すための情報を表示します。
                  本文を自動的に修正する機能ではありません。
                </p>
              </div>
            </div>

            <h3 id="support-entry">KAKURIYO解析画面を開く</h3>
            <p>
              右ペイン上段の「KAKURIYO解析 ↗」から、現在話を対象にした独立ウィンドウを開きます。
              <code>↗</code>はメモ / 資料のタブ切り替えではなく、別ウィンドウを開くことを示します。
            </p>
            <ul>
              <li>ウィンドウを開いたまま本文編集を続けられるmodeless形式です。</li>
              <li>左側に固定されたセクション一覧、右側に選択セクションの内容を表示します。</li>
              <li>解析結果の本文は読み取り専用で、直接編集、ページ追加、名前変更、削除はできません。</li>
              <li>章だけが選択されているなど、現在話がない場合は「話を選択すると支援を表示できます」と案内します。</li>
            </ul>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/kakuriyo-overview.png" target="_blank" rel="noopener" aria-label="KAKURIYO概要を原寸で開く">
                <img
                  src="/images/nightover/screenshots/kakuriyo-overview.png"
                  alt="左に解析セクション、右に保存済みの支援状態を表示したKAKURIYO概要画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — KAKURIYOの概要と解析セクション一覧</figcaption>
            </figure>

            <h3 id="support-sections">表示セクション</h3>
            <div class="kakuriyo-grid">
              <article v-for="item in kakuriyoSections" :key="item.name">
                <img :src="`/images/nightover/${item.icon}`" alt="" />
                <h4>{{ item.name }}</h4>
                <p>{{ item.text }}</p>
              </article>
            </div>
            <p>
              「概要」は解析結果が新しいかを確認する入口です。生成時刻、未保存下書き / 保存本文のどちらを使ったか、
              エンジン・データ・各スキーマのバージョン、互換性、要確認件数、現在の文書キーを表示します。
            </p>

            <h3 id="analysis-source">解析対象になる本文</h3>
            <p>現在話の解析では、次の順序で本文を選びます。</p>
            <ol>
              <li>現在話に未保存の変更がある場合は、その下書き本文</li>
              <li>未保存の変更がない場合は、保存済みの本文ファイル</li>
            </ol>
            <p>
              そのため、保存前の文章でもKAKURIYO画面を更新すれば解析へ反映できます。
              章や作品をまたぐ比較では、現在話を起点に同じ作品内の保存データとキャッシュを追加収集します。
            </p>

            <h3 id="support-readonly">解析結果は自動修正ではありません</h3>
            <p>
              KAKURIYOは文章の傾向、表記の揺れ、反復候補などを提示しますが、本文を書き換えません。
              要確認項目の採用・見送りは解析側の判断状態へ保存され、原稿の修正は本文エディタで利用者が行います。
            </p>
            <div class="admonition info">
              <strong>KAKURIYOと本文編集</strong>
              <p>
                KAKURIYOの更新や読み込みに失敗しても、本文エディタ、メモ、資料などNIGHTOVERの通常機能は継続して利用できます。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'kakuriyo-radar'" id="kakuriyo-radar" class="doc-section">
            <p>
              文体レーダーは、現在話の文章傾向を8つの観点へまとめ、同じ章や作品全体との違いを確認するための比較表示です。
              良し悪しを採点するものではなく、意図した文体になっているかを見直す材料として使用します。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/kakuriyo-style-radar.png" target="_blank" rel="noopener" aria-label="文体レーダーを原寸で開く">
                <img
                  src="/images/nightover/screenshots/kakuriyo-style-radar.png"
                  alt="現在話、章平均、全話平均を8軸で比較するKAKURIYO文体レーダー"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 現在話・章平均・全話平均を重ねた文体レーダー</figcaption>
            </figure>

            <h3 id="radar-eight-axes">8つの軸</h3>
            <div class="spec-table radar-axis-table">
              <div class="table-head">軸</div><div class="table-head">確認する傾向</div>
              <div><strong>会話</strong></div><div>本文全体に対する会話部分の現れ方。地の文との配分を確認します。</div>
              <div><strong>名詞</strong></div><div>名詞を中心とした語の使われ方。説明・情報提示の密度を見る手掛かりです。</div>
              <div><strong>動詞</strong></div><div>動作や状態変化を表す語の現れ方。文章の動き方を比較します。</div>
              <div><strong>描写</strong></div><div>情景、状態、感覚などを描く表現の傾向をまとめます。</div>
              <div><strong>接続</strong></div><div>文や節をつなぐ表現の使われ方を確認します。</div>
              <div><strong>作品語</strong></div><div>作品専用辞書や記憶に登録された固有の語が文章へ現れる傾向です。</div>
              <div><strong>文末</strong></div><div>語尾や文末表現の偏り、常体・敬体を含む終わり方の特徴を確認します。</div>
              <div><strong>反復</strong></div><div>語尾、近い語、語句、比喩、段落リズムなどの繰り返し傾向です。</div>
            </div>
            <div class="admonition note">
              <strong>レーダーの見方</strong>
              <p>
                軸が高いこと自体を問題とは判定しません。会話中心の場面や意図的な反復など、作品上の狙いと照らして確認してください。
              </p>
            </div>

            <h3 id="radar-comparison">現在話・章平均・作品平均の比較</h3>
            <div class="spec-table two-cols">
              <div class="table-head">系列</div><div class="table-head">意味</div>
              <div><strong>現在話</strong></div><div>現在選択している話の解析結果。未保存の下書きがあれば下書きを優先します。</div>
              <div><strong>章平均</strong></div><div>現在話が属する章の各話をまとめた基準です。</div>
              <div><strong>作品平均</strong></div><div>作品内の全話をまとめた基準です。</div>
            </div>
            <p>
              現在話だけ大きく異なる軸がある場合、場面転換や演出による意図的な差なのか、
              その話だけ説明・会話・文末などが偏っているのかを確認できます。
              章平均と作品平均が近く、現在話だけ離れている場合は局所的な変化です。
            </p>

            <h3 id="voice-trends">「傾向」で確認できる内容</h3>
            <ul>
              <li>会話と地の文の分割傾向</li>
              <li>文末表現の構成と、常体 / 敬体の手掛かり</li>
              <li>人物に紐づく台詞から見た話し方の特徴</li>
              <li>章ごとの文体特徴と、作品傾向から外れた章</li>
              <li>複数の話や章で繰り返し現れる要確認傾向</li>
              <li>現在章が作品全体の中でどのように見えるか</li>
            </ul>
            <p>
              以前の設計で「声」と「推敲」に分かれていた内容は、現在の画面では「傾向」へまとめて表示します。
            </p>
          </section>

          <section v-if="activePage === 'kakuriyo-review'" id="kakuriyo-review" class="doc-section">
            <p>
              「要確認」「記憶」「反復」「学習状態」は、解析で見つかった候補を確認し、
              作品固有の表記や利用者の判断を次回以降の解析へ引き継ぐための領域です。
            </p>

            <h3 id="review-warnings">要確認項目</h3>
            <p>各項目には、警告の種類、要約、候補になった理由、現在の判断状態を表示します。</p>
            <div class="spec-table two-cols">
              <div class="table-head">操作</div><div class="table-head">意味</div>
              <div><strong>採用</strong></div><div>指摘を確認対象として受け入れた状態にします。本文自体は変更しません。</div>
              <div><strong>見送り</strong></div><div>今回の作品では問題として扱わない判断を保存します。</div>
              <div><strong>一般語へ登録</strong></div><div>通常の語として認識させ、未確認語候補へ繰り返し出にくくします。</div>
              <div><strong>作品語へ登録</strong></div><div>固有名詞や作中用語として作品辞書へ追加します。</div>
              <div><strong>記憶へ登録 / 参照</strong></div><div>同じ対象の正規表記、別名、読みなどを確認・保存します。</div>
              <div><strong>TSV一括コピー</strong></div><div>未確認語の一覧をタブ区切りテキストとしてクリップボードへコピーします。</div>
            </div>
            <p>
              採用・見送り・辞書登録は作品ごとに保存されます。
              現行画面では警告種類全体をミュートするボタンとfeedback corpusの書き出しは通常表示しません。
            </p>

            <h3 id="project-memory">記憶と作品語</h3>
            <p>
              「記憶」は、登場人物や用語などの対象を同じものとして扱うための作品内情報です。
              正規表記、別名、読み、対象の種類、現在話で観測された表記をまとめます。
            </p>
            <ul>
              <li>人物の呼び方が章によって変わっている</li>
              <li>同じ固有名詞に漢字表記とカタカナ表記が混在している</li>
              <li>正式名称と短縮名が別の用語として検出されている</li>
            </ul>
            <p>
              登場人物・用語の資料ページ名は作品語へ自動同期されます。
              資料側の別名候補とKAKURIYO側の記憶を組み合わせ、表記一貫性の確認に利用します。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/kakuriyo-memory.png" target="_blank" rel="noopener" aria-label="KAKURIYOの記憶画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/kakuriyo-memory.png"
                  alt="作品語一覧と選択した語の概要、登録済み表記、現在の状態を表示したKAKURIYOの記憶画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 作品語の一覧と、表記・別名を確認する記憶画面</figcaption>
            </figure>

            <h3 id="repetition-support">反復の確認</h3>
            <div class="spec-table two-cols">
              <div class="table-head">種類</div><div class="table-head">確認内容</div>
              <div>文末反復</div><div>近い範囲で同じ終わり方が連続していないか</div>
              <div>近似語反復</div><div>活用差などを含む近い語が続いていないか</div>
              <div>語句反復</div><div>同じフレーズが近い範囲に繰り返し現れていないか</div>
              <div>比喩反復</div><div>同じ比喩的な表現が繰り返されていないか</div>
              <div>段落リズム</div><div>段落の長さや構成が単調な並びになっていないか</div>
            </div>
            <p>
              反復は演出として意図的に使う場合もあります。候補を削除指示としてではなく、
              読み返す位置を絞り込むための情報として扱ってください。
            </p>

            <h3 id="learning-state">学習状態</h3>
            <p>
              これまでの採用・見送り、作品ごとの警告傾向、信頼度調整、文体記憶、学習ログの概要を表示します。
              NIGHTOVERの作品間で判断を自動的に混ぜるのではなく、現在作品の状態として保持します。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/kakuriyo-learning.png" target="_blank" rel="noopener" aria-label="KAKURIYOの学習状態を原寸で開く">
                <img
                  src="/images/nightover/screenshots/kakuriyo-learning.png"
                  alt="採用や見送りの傾向をもとにした文体メモの値を表示するKAKURIYOの学習状態"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 現在作品に保存された支援調整の状態</figcaption>
            </figure>
            <div class="admonition note">
              <strong>学習状態について</strong>
              <p>
                学習状態は利用者の判断を解析へ反映するための記録です。本文を自動修正したり、
                採用・見送りを自動確定したりするものではありません。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'kakuriyo-update'" id="kakuriyo-update" class="doc-section">
            <p>
              KAKURIYOは永続設定、話ごとの解析キャッシュ、作品集計の進行状態、現在画面用の一時キャッシュを分けて管理します。
              更新操作は、どの範囲を作り直すかによって処理量が異なります。
            </p>

            <h3 id="refresh-actions">更新操作の使い分け</h3>
            <div class="spec-table two-cols">
              <div class="table-head">操作</div><div class="table-head">処理</div>
              <div><strong>更新</strong></div><div>現在話を優先して解析し、その後に章・作品の背景集計を進めます。</div>
              <div><strong>現在話</strong></div><div>選択中の話だけを現在の本文で再解析します。体験版ではこの範囲に限定されます。</div>
              <div><strong>クリーン再解析</strong></div><div>保存済み解析キャッシュを削除し、作品全体を最初から再解析します。製品版向けの操作です。</div>
            </div>
            <p>
              作品を開いた直後に重い全話解析を始めるのではなく、KAKURIYO画面を開いた時点で現在話から必要に応じて作成します。
              話を切り替えた場合も、その話のキャッシュが必要になった時点で遅延更新します。
            </p>

            <h3 id="cache-invalidation">解析結果を更新する条件</h3>
            <ul>
              <li>選択中の話を変更したとき</li>
              <li>現在話の未保存本文を変更、または保存したとき</li>
              <li>作品を再読込したとき</li>
              <li>KAKURIYOのエンジン、データ、各スキーマのバージョンが変わったとき</li>
              <li>作品の記憶、作品辞書、警告の判断状態が変わったとき</li>
            </ul>
            <p>
              古い結果を表示している場合はstale状態と理由を「概要」へ表示します。
              更新後は現在話の解析結果と、必要な比較情報を新しい条件で作り直します。
            </p>

            <h3 id="support-cache-files">KAKURIYOの保存データ</h3>
            <div class="spec-table two-cols">
              <div class="table-head">保存先</div><div class="table-head">内容</div>
              <div><code>manifest/kakuriyo-state.json</code></div><div>採用・見送りなどのfeedback、文体記憶、調整状態</div>
              <div><code>manifest/kakuriyo/project-lexicon.tsv</code></div><div>作品専用の語彙</div>
              <div><code>manifest/kakuriyo/project-memory.tsv</code></div><div>正規表記、別名、読みなどの記憶</div>
              <div><code>manifest/kakuriyo/cache/analysis/</code></div><div>話ごとの解析キャッシュ</div>
              <div><code>manifest/kakuriyo/refresh-progress.json</code></div><div>背景更新の進行状態</div>
            </div>
            <p>
              「クリーン再解析」で削除するのは再生成可能な解析キャッシュです。
              作品語、記憶、採用・見送りなどの永続状態とは分けて扱います。
            </p>

            <h3 id="fail-soft">解析に失敗した場合</h3>
            <div class="spec-table two-cols">
              <div class="table-head">状態</div><div class="table-head">表示と動作</div>
              <div>解析の作成に失敗</div><div>「支援情報を更新できませんでした」と表示し、直前の成功結果があれば古い情報として残します。</div>
              <div>バージョン不一致</div><div>「概要」へ不一致内容を表示し、画面用キャッシュを破棄します。保存済みの判断状態は保持します。</div>
              <div>話が選択されていない</div><div>「話を選択すると支援を表示できます」と案内します。</div>
              <div>作品語・記憶が未設定</div><div>セクションを空白にせず、「未設定」と理由を表示します。</div>
            </div>
            <div class="admonition info">
              <strong>解析に失敗した場合</strong>
              <p>
                KAKURIYOの解析に失敗しても、本文の編集や保存は続けられます。
                KAKURIYOはあとから更新し直せます。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'statistics'" id="statistics" class="doc-section">
            <h3 id="statistics-feature">開き方と集計範囲</h3>
            <p>
              中央ヘッダーの<code>... > 統計</code>から、本文編集を続けられるmodeless画面として開きます。
              統計は製品版の機能です。
            </p>
            <div class="spec-table two-cols">
              <div class="table-head">範囲</div><div class="table-head">対象</div>
              <div><strong>話</strong></div><div>選択した1話。左側の一覧から任意の話を選べます。</div>
              <div><strong>章</strong></div><div>選択した章に含まれる話を集計します。</div>
              <div><strong>全体</strong></div><div>作品内のすべての話を集計します。</div>
            </div>
            <p>
              話スコープで別の話を選んだあと、「現在話へ」を押すとエディタで開いている話へ再び追従します。
              現在話には未保存の下書きがある場合、その下書きを統計へ反映します。
            </p>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/statistics-overview.png" target="_blank" rel="noopener" aria-label="統計概要を原寸で開く">
                <img
                  src="/images/nightover/screenshots/statistics-overview.png"
                  alt="話を選択し、文字数、文数、段落数、平均文長、推定読了時間、グラフを表示する統計概要"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 話ごとの基本集計と、話・章の文字数グラフ</figcaption>
            </figure>

            <h3 id="statistics-tabs">4つのタブ</h3>
            <div class="spec-table two-cols">
              <div class="table-head">タブ</div><div class="table-head">主な内容</div>
              <div><strong>概要</strong></div><div>文字数、文・段落の全体像と、選択範囲の基本的な要約</div>
              <div><strong>会話 / テンポ</strong></div><div>会話部分の比率、文長、段落構成など文章の進み方</div>
              <div><strong>記号</strong></div><div>三点リーダ、ダッシュ、感嘆符、疑問符、括弧などの使用状況</div>
              <div><strong>人物 / 用語</strong></div><div>資料に登録した人物・用語の出現回数、初出話、直近の登場話</div>
            </div>
            <figure class="app-screenshot app-screenshot--wide">
              <a href="/images/nightover/screenshots/statistics-dialogue-tempo.png" target="_blank" rel="noopener" aria-label="会話とテンポの統計を原寸で開く">
                <img
                  src="/images/nightover/screenshots/statistics-dialogue-tempo.png"
                  alt="会話率、地の文率、台詞文数、文長と推移グラフを表示する会話とテンポの統計"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 会話率、文長、話ごとの推移をまとめた「会話 / テンポ」</figcaption>
            </figure>

            <h3 id="statistics-metrics">集計項目の読み方</h3>
            <ul>
              <li><strong>文字数</strong> — 設定のルビ・スペース除外規則を使用し、改行は数えません。</li>
              <li><strong>会話率</strong> — 対象本文の中で会話として扱われた部分の比率を確認します。</li>
              <li><strong>文長</strong> — 文単位の長さから、短文・長文の傾向を確認します。</li>
              <li><strong>段落</strong> — 段落数や段落あたりの構成を確認します。</li>
              <li><strong>差分要約</strong> — 話・章など、選択した範囲同士の数値差を要約します。</li>
            </ul>
            <p>
              挿絵数は統計対象に含めません。また、単一EXEでの配布を優先するため、現行仕様では外部形態素解析器を必要とする品詞分析を表示しません。
            </p>

            <h3 id="statistics-cache">再分析と統計キャッシュ</h3>
            <p>
              上部の「再分析」を押すと、作品内の統計を現在の本文と設定で再生成します。
              結果は<code>manifest/statistics-cache.json</code>へ保存し、次回表示時の再利用に使います。
            </p>
            <p>
              本文保存、ルビ親文字上限、文字数からのルビ・スペース除外設定など、
              集計結果へ影響する変更があった場合はキャッシュを無効化または再構築します。
            </p>
          </section>

          <section v-if="activePage === 'git'" id="git" class="doc-section">
            <p>
              Git連携を有効にすると、作品フォルダの状態を「記録」として残し、
              後から本文や作品全体を確認・復元できます。Gitコマンドを直接入力する必要はありません。
            </p>

            <h3 id="git-start">Git記録を始める</h3>
            <p>
              Git連携を利用するには、PCにGitがインストールされている必要があります。
              Gitが見つからない場合は、設定がONでも「記録」と「履歴」は表示されません。
            </p>
            <div class="admonition note">
              <strong>Gitの準備について</strong>
              <p>
                Gitと聞くと難しく見えますが、NIGHTOVERで記録と復元を使うだけなら身構えなくて大丈夫です。
                Windows向けGitのインストーラーは、特別な設定がなければ表示される選択肢を変えずに進めるだけで導入できます。
                Gitのコマンド操作を覚える必要もありません。
              </p>
            </div>
            <ol>
              <li>設定で「Git連携を有効にする」をONにします。</li>
              <li>プロジェクト画面下部に表示されるGit操作から、作品フォルダを初期化します。</li>
              <li>現在の作品状態を最初の「記録」として保存します。</li>
              <li>以後、変更を残したい時点で「記録」を実行します。</li>
            </ol>
            <p>
              Gitの初期化は作品ごとに行います。アプリ全体のGit連携がONでも、すべての作品が自動的に初期化されるわけではありません。
            </p>

            <h3 id="git-dirty">未記録の変更</h3>
            <p>
              最後の記録以降に作品フォルダへ変更がある場合、Git操作付近へ未記録ドットを表示します。
              これは自動保存されていないという意味ではなく、「ディスク上の現在状態がまだGit履歴へ記録されていない」ことを示します。
            </p>
            <div class="setting-example">
              <strong>保存と記録の違い</strong>
              <p>
                保存は現在の本文・メモ・資料を作品フォルダへ書き込みます。
                Gitの記録は、その保存済み作品フォルダの状態を履歴として固定します。
              </p>
            </div>

            <h3 id="git-history">履歴と差分</h3>
            <p>
              「履歴」では記録一覧を読み込み、選択した記録の本文、現在との差分、記録時の章・話構造を確認できます。
              大きな履歴でも画面を止めにくいよう、一覧は非同期で読み込み、本文や差分は選択時に必要な分を遅延読込します。
            </p>
            <ul>
              <li>変更された行だけでなく、行内で置き換わった部分を確認できます。</li>
              <li>記録時点の本文と現在本文を比較できます。</li>
              <li>記録時点の章・話構造を確認できます。</li>
            </ul>
            <div class="screenshot-pair">
              <figure class="app-screenshot app-screenshot--wide">
                <a href="/images/nightover/screenshots/git-history.png" target="_blank" rel="noopener" aria-label="Git履歴を原寸で開く">
                  <img
                    src="/images/nightover/screenshots/git-history.png"
                    alt="左に記録日時、右に選択した記録の本文を表示したGit履歴画面"
                    loading="lazy"
                  />
                </a>
                <figcaption>実機画面 — 記録一覧と、その時点の本文</figcaption>
              </figure>
              <figure class="app-screenshot app-screenshot--wide">
                <a href="/images/nightover/screenshots/git-history-diff.png" target="_blank" rel="noopener" aria-label="Git差分を原寸で開く">
                  <img
                    src="/images/nightover/screenshots/git-history-diff.png"
                    alt="選択した記録で追加された本文を緑色で表示するGit差分画面"
                    loading="lazy"
                  />
                </a>
                <figcaption>実機画面 — 選択した記録の差分</figcaption>
              </figure>
            </div>

            <h3 id="git-restore">全体復元と本文だけの復元</h3>
            <div class="spec-table two-cols">
              <div class="table-head">復元方法</div><div class="table-head">対象</div>
              <div><strong>作品全体を復元</strong></div><div>本文だけでなく、記録時点の作品フォルダ全体を対象に戻します。</div>
              <div><strong>本文だけを復元</strong></div><div>選択した記録の本文を現在話へ戻し、ほかの作品データは現在状態を維持します。</div>
            </div>
            <p>
              復元前には確認を表示し、必要な保存処理を行います。
              保存または復元に失敗した場合は途中で中断し、結果を左ペイン下部のステータスメッセージへ通知します。
            </p>
            <div class="admonition warning">
              <strong>復元範囲について</strong>
              <p>
                「作品全体」と「本文だけ」では変更される範囲が大きく異なります。
                迷う場合は復元前に新しい記録を作り、現在状態へ戻れるようにしてから実行してください。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'saving'" id="saving" class="doc-section">
            <h3 id="save-timing">保存されるタイミング</h3>
            <p>本文、メモ、資料の編集内容は下書きとして保持され、次のタイミングで保存対象へ同期されます。</p>
            <ul>
              <li><kbd>Ctrl</kbd> + <kbd>S</kbd></li>
              <li>別の話へ切り替えるとき</li>
              <li>ホーム画面へ戻るとき</li>
              <li>設定した自動保存間隔</li>
              <li>Git記録や復元など、保存が必要な操作の前</li>
            </ul>

            <h3 id="draft-scope">下書きと自動保存の範囲</h3>
            <p>
              自動保存は設定した間隔と未保存変更の有無を確認し、変更がある場合に実行します。
              通常は現在開いている本文、メモ、資料ページだけを保存します。
            </p>
            <p>
              設定の「自動保存時に全体保存する」をONにすると、未表示の話・メモ・資料も対象へ含めます。
              作品が大きい場合は保存処理が重くなる可能性があるため、現在作業中の内容だけを保存する通常動作と使い分けてください。
            </p>

            <h3 id="auto-save">自動保存</h3>
            <p>
              自動保存は設定した秒数ごとに無条件で実行するのではなく、本文・メモ・資料に未保存の変更がある場合だけ動作します。
              初期値は有効、確認間隔は10秒です。
            </p>
            <p>
              間隔は1〜60秒の範囲で変更できます。
              設定を確定すると待ち時間を新しい値で数え直し、以前の周期は引き継ぎません。
            </p>
            <p>
              自動保存を無効にしても、<kbd>Ctrl</kbd> + <kbd>S</kbd>、話の切り替え、ホームへ戻る操作、
              Git操作前などの保存は引き続き行います。
            </p>
            <div class="admonition warning">
              <strong>全体保存について</strong>
              <p>
                「自動保存時に全体保存する」を有効にすると、未表示の話・メモ・資料も毎回の対象へ含めます。
                大きな作品で編集時に重さを感じる場合は、無効のまま使用してください。
              </p>
            </div>

            <h3 id="manual-save">手動保存</h3>
            <p>
              <kbd>Ctrl</kbd> + <kbd>S</kbd>などの手動保存では、プロジェクト全体の保存と統計キャッシュの更新を行います。
              通常の自動保存より対象が広く、未表示のデータや集計状態を確実に揃えたい場合に使用します。
            </p>
            <p>
              Git記録や復元など、ディスク上の状態が前提になる操作の前にも保存を試みます。
              保存が成功しない場合は、その後の記録・復元処理へ進みません。
            </p>

            <h3 id="save-failures">保存に失敗した場合</h3>
            <p>
              保存処理に失敗した場合はステータスメッセージへ通知します。
              Git記録や復元の前であれば、その操作を中断して未保存状態を保ちます。
              エラー通知が出た場合は、保存先への書き込み権限、空き容量、作品フォルダの移動・削除を確認してください。
            </p>
            <div class="admonition note">
              <strong>自動保存をOFFにした場合</strong>
              <p>
                無効になるのは時間間隔による自動保存です。話切り替え、ホームへ戻る操作、手動保存、
                Git操作前などの保存導線は引き続き動作します。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'import-export'" id="import-export" class="doc-section">
            <p>
              作品の一部または全体をプレーンテキストとして取り出せます。
              製品版では、外部サービスの書き出しデータや通常のTXTから新しいNIGHTOVER作品を作成できます。
            </p>

            <h3 id="text-copy-export">本文コピーとtxt書き出し</h3>
            <div class="spec-table two-cols">
              <div class="table-head">範囲</div><div class="table-head">利用可否</div>
              <div>現在の話</div><div>体験版・製品版</div>
              <div>現在の章</div><div>体験版・製品版</div>
              <div>複数選択中の話</div><div>体験版・製品版</div>
              <div>作品全体</div><div>製品版</div>
            </div>
            <p>
              アウトラインを右クリックし、「この話 / 章の本文をコピー」「txt書き出し」などを選びます。
              本文コピーでは設定された先頭・末尾改行数を適用しますが、txt書き出しにはその設定を適用しません。
            </p>

            <h3 id="manuscript-copy">本文コピー時の改行</h3>
            <p>
              本文をコピーするときは、先頭と末尾へ0〜20行の改行を追加できます。
              話単位と章単位のコピーに同じ設定を使用します。
            </p>
            <p>
              「既存の改行を指定数にそろえる」が無効の場合、設定した改行数を本文にもともとある先頭・末尾改行へ追加します。
              有効の場合は、本文の端にある改行をいったん取り除いてから指定数を付け直します。
            </p>
            <div class="setting-example">
              <strong>改行数の例</strong>
              <p>
                コピー元に先頭2行・末尾1行の改行があり、設定を「先頭1行・末尾2行」にした場合、
                統一を無効にすると先頭3行・末尾3行になります。有効にすると先頭1行・末尾2行へそろえます。
              </p>
            </div>
            <p>
              通常の選択範囲コピー、切り取り、txt書き出しには適用しません。
              改行数と統一方法は「本文・入力の設定」で変更できます。
            </p>

            <h3 id="narou-import">小説家になろうから取り込む</h3>
            <p>
              ホーム画面の「書き出しを取り込む」から「小説家になろう（ZIP / TXT）」を選びます。
              ZIPの場合は内部のTXTをファイル名だけでなく内容で判定します。
            </p>
            <ul>
              <li><code>【Nコード】</code>、<code>【タイトル】</code>、エピソード区切りを持つ本文書き出しTXTを使用します。</li>
              <li>通常本文と下書き用<code>_draftepisode</code>が同居する場合は通常本文を優先します。</li>
              <li>感想など別用途のTXTが同居していても、本文構造を持たないファイルは採用しません。</li>
              <li>解凍済みの<code>[Nコード].txt</code>を直接選ぶこともできます。</li>
            </ul>

            <h3 id="kakuyomu-import">カクヨムから取り込む</h3>
            <p>
              「カクヨム（ZIP）」から、<code>about.txt</code>と<code>episode_0001.txt</code>形式の話ファイルを含む
              書き出しZIPを選択します。
            </p>
            <div class="spec-table two-cols">
              <div class="table-head">入力データ</div><div class="table-head">NIGHTOVERでの保存先</div>
              <div><code>about.txt</code>の<code>【タイトル】</code></div><div>作品タイトル</div>
              <div><code>【目次】</code>内の<code>§</code>行</div><div>章</div>
              <div><code>episode_*.txt</code>の<code>【タイトル】</code></div><div>話タイトル</div>
              <div><code>【本文...】</code></div><div>各話の本文</div>
              <div>公開状態、作成・更新日時、文字数</div><div>各話の話メモ</div>
              <div><code>about.txt</code>の作品情報</div><div>作品全体メモ</div>
            </div>

            <h3 id="plain-text-import">通常のTXTを取り込む</h3>
            <p>
              外部サービス形式ではないTXTは、見出しを含む本文として章・話へ分割するか、
              1つの話として取り込めます。取り込み時に新しい安全なプロジェクトIDを作り、
              <code>project.json</code>、<code>manifest/outline.json</code>、各話の本文ファイルを生成します。
            </p>
            <div class="admonition info">
              <strong>体験版での取り込み</strong>
              <p>
                体験版でも既存作品を開くことや、話・章・選択中の話のtxt書き出しは利用できます。
                外部書き出しからの作品作成と作品全体txt書き出しが製品版限定です。
              </p>
            </div>
          </section>

          <section v-if="activePage === 'settings'" id="settings" class="doc-section">
            <p>
              設定ページでは、各機能の有効 / 無効、初期値、変更できる範囲を確認できます。
              機能そのものの使い方は、本文エディタ、メモ・資料、保存、Gitなど各機能のページで説明します。
            </p>

            <h3 id="settings-overview">設定の保存と初期化</h3>
            <p>
              設定は<code>%APPDATA%\NIGHTOVER\settings.json</code>へ保存されます。
              ダイアログ右下の「OK」で変更を確定し、「キャンセル」で開く前の状態へ戻ります。
            </p>
            <p>
              左下の「初期値に戻す」は、ダイアログ内の設定をまとめて初期状態へ戻します。
              フォントとダークモードのアクセントには、それぞれ個別の「初期値」ボタンもあります。
            </p>
            <p>
              「OK」で確定した設定は、アプリを再起動しなくても反映されます。
              自動保存の待ち時間を設定し直し、本文の表示、リンク候補、Git操作欄、統計画面、KAKURIYO支援画面を現在の設定で更新します。
            </p>
            <div class="admonition note">
              <strong>設定値が範囲外の場合</strong>
              <p>
                自動保存間隔、ルビの文字数上限、本文コピーの改行数は、OKを押したときに利用可能な範囲へ収められます。
                数値として読み取れない場合は、その項目の初期値が使われます。
              </p>
            </div>
            <figure class="app-screenshot app-screenshot--dialog">
              <a href="/images/nightover/screenshots/settings-writing.png" target="_blank" rel="noopener" aria-label="初期値に戻した設定画面を原寸で開く">
                <img
                  src="/images/nightover/screenshots/settings-writing.png"
                  alt="初期値に戻したNIGHTOVERの設定画面。保存場所、自動保存、Git連携、本文フォント、アクセント色を表示している"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — 初期値に戻した設定画面</figcaption>
            </figure>
          </section>

          <section v-if="activePage === 'settings-saving'" id="settings-saving" class="doc-section">
            <p>
              新規作品の保存先と、自動保存の有効状態・間隔を変更します。
              保存されるタイミングや範囲は<RouterLink to="/nightover/saving">保存と自動保存</RouterLink>で確認できます。
            </p>

            <h3 id="setting-default-save-path">デフォルト保存場所</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値</div><div class="table-head">設定の作用</div>
              <div><strong>デフォルト保存場所</strong></div><div><code>%USERPROFILE%\Documents\NIGHTOVER</code></div><div>変更後に新しく作る作品の保存先を指定します。</div>
            </div>
            <p>
              空欄では確定できません。既存作品は移動せず、体験版では変更できません。
            </p>

            <h3 id="setting-auto-save">自動保存</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値 / 範囲</div><div class="table-head">設定の作用</div>
              <div><strong>自動保存を有効にする</strong></div><div>ON</div><div>時間間隔による自動保存を切り替えます。</div>
              <div><strong>間隔</strong></div><div>10秒 / 1〜60秒</div><div>未保存の変更を確認する間隔を指定します。</div>
              <div><strong>自動保存時に全体保存する</strong></div><div>OFF</div><div>未表示の話・メモ・資料も対象へ含めます。</div>
            </div>
          </section>

          <section v-if="activePage === 'settings-writing'" id="settings-writing" class="doc-section">
            <p>
              ルビと文字数の条件、記号の自動変換、本文コピー時の改行を変更します。
            </p>

            <h3 id="setting-ruby-count">ルビと文字数</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値 / 範囲</div><div class="table-head">設定の作用</div>
              <div><strong>親文字の上限</strong></div><div>10字 / 1〜50字</div><div>1つのルビで扱える親文字数を指定します。</div>
              <div><strong>ルビ文字の上限</strong></div><div>10字 / 1〜50字</div><div>読みとして入力できる文字数を指定します。</div>
              <div><strong>ルビ・スペースを除外</strong></div><div>ON</div><div>文字数計算から読みと半角・全角スペースを除外します。</div>
            </div>
            <p>投稿先ごとの上限と数え方は<RouterLink to="/nightover/ruby">ルビと傍点</RouterLink>で確認できます。</p>

            <h3 id="setting-punctuation">記号の自動変換</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値</div><div class="table-head">設定の作用</div>
              <div><strong>ダッシュ線を罫線文字へ置換</strong></div><div>OFF</div><div><code>―</code> / <code>—</code>を<code>─</code>へ変換します。</div>
              <div><strong><code>...</code>を三点リーダへ置換</strong></div><div>OFF</div><div><code>...</code>を<code>…</code>へ変換します。</div>
              <div><strong>単独記号を二連化</strong></div><div>OFF</div><div>ダッシュまたは三点リーダ1文字を2文字へそろえます。</div>
            </div>
            <p>変換順序と利用範囲は<RouterLink to="/nightover/input-assist">記号の入力補助</RouterLink>で確認できます。</p>

            <h3 id="setting-manuscript-copy">本文コピー時の改行</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値 / 範囲</div><div class="table-head">設定の作用</div>
              <div><strong>先頭の改行数</strong></div><div>0行 / 0〜20行</div><div>コピー本文の先頭へ付ける改行数を指定します。</div>
              <div><strong>末尾の改行数</strong></div><div>0行 / 0〜20行</div><div>コピー本文の末尾へ付ける改行数を指定します。</div>
              <div><strong>既存の改行を指定数にそろえる</strong></div><div>OFF</div><div>既存の端の改行を除去してから指定数へそろえます。</div>
            </div>
            <figure class="app-screenshot app-screenshot--dialog">
              <a href="/images/nightover/screenshots/settings-notation-copy.png" target="_blank" rel="noopener" aria-label="本文と入力の設定を原寸で開く">
                <img
                  src="/images/nightover/screenshots/settings-notation-copy.png"
                  alt="ルビ上限、文字数計算、記号の自動変換、本文コピー時の改行数を表示した設定画面"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面 — ルビ・文字数、記号変換、本文コピーの設定</figcaption>
            </figure>
          </section>

          <section v-if="activePage === 'settings-appearance'" id="settings-appearance" class="doc-section">
            <p>
              アプリ全体の明暗と、本文に使う書体、ダークモードの強調色を変更します。
            </p>

            <h3 id="setting-font-accent">本文フォントとアクセント</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値</div><div class="table-head">設定の作用</div>
              <div><strong>本文フォント</strong></div><div>Meiryo</div><div>インストール済みフォントから本文に使う書体を選択します。</div>
              <div><strong>ダークモードのアクセント</strong></div><div><code class="accent-color-code">#F2BC6C</code></div><div>ダークテーマ時の選択色を指定します。</div>
            </div>
            <p>
              本文フォントを変えると、本文の描画、折り返し位置、縦書き字形、ルビの配置、IME入力位置を新しい書体に合わせて再計算します。
              設定画面では「あいうえお ABC 123」の見本を確認でき、設定を確定するまで実際の本文表示は変更されません。
            </p>
            <p>
              ダークモードのアクセントは<code>#RRGGBB</code>形式で指定します。
              選択中の資料タブなど強調部分の色が変わり、ライトモードの色には影響しません。
            </p>
            <figure class="app-screenshot app-screenshot--accent-comparison">
              <a href="/images/nightover/screenshots/settings-accent-comparison.png" target="_blank" rel="noopener" aria-label="エディタ上でのアクセント色の初期値とシアンの比較を原寸で開く">
                <img
                  src="/images/nightover/screenshots/settings-accent-comparison.png"
                  alt="エディタの資料ペインを並べた比較。左は初期値のF2BC6C、右は変更例の00C8FF"
                  loading="lazy"
                />
              </a>
              <figcaption>実機画面の資料ペイン — 左: 初期値 #F2BC6C / 右: 変更例 #00C8FF</figcaption>
            </figure>

            <h3 id="setting-theme">テーマ</h3>
            <p>
              ダーク / ライトの切り替えは設定画面内ではなく、ホーム画面とエディタ画面の右下にあるトグルから行います。
              選択はアプリ全体へ適用され、次回起動時にも引き継がれます。
            </p>
          </section>

          <section v-if="activePage === 'settings-support'" id="settings-support" class="doc-section">
            <p>
              Git操作と、本文・資料間の支援機能を個別に有効化します。
            </p>

            <h3 id="setting-git">Git 連携</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値</div><div class="table-head">設定の作用</div>
              <div><strong>Git 連携を有効にする</strong></div><div>ON</div><div>「記録」と「履歴」の操作欄を表示します。</div>
            </div>
            <p>
              無効にしても記録済みの履歴は削除しません。利用方法とGitの準備は<RouterLink to="/nightover/git">Git 記録と復元</RouterLink>で確認できます。
            </p>

            <h3 id="setting-link-support">リンクジャンプと初出チェック</h3>
            <div class="spec-table setting-options-table">
              <div class="table-head">項目</div><div class="table-head">初期値</div><div class="table-head">設定の作用</div>
              <div><strong>用語リンクハイライト / ジャンプ</strong></div><div>OFF</div><div>本文中の登場人物名・用語名を強調し、資料へ移動できるようにします。</div>
              <div><strong>初出チェック</strong></div><div>OFF</div><div>登場人物・用語が最初に現れる話を検出します。</div>
            </div>
            <p>一致条件と表示内容は<RouterLink to="/nightover/linking">本文リンクと初出</RouterLink>で確認できます。</p>
          </section>


          <section v-if="activePage === 'shortcuts'" id="shortcuts" class="doc-section">
            <p>
              プロジェクト画面で<kbd>Alt</kbd>を押している間、本文欄へ現在のモードで使える操作一覧を表示します。
              案内の表示・非表示で本文、選択、キャレット、スクロール位置は変わりません。
            </p>

            <h3 id="shortcut-list">編集モード</h3>
            <div class="spec-table shortcut-table">
              <div class="table-head">キー</div><div class="table-head">操作</div>
              <div><kbd>Ctrl</kbd> + <kbd>S</kbd></div><div>保存</div>
              <div><kbd>Ctrl</kbd> + <kbd>Z</kbd></div><div>元に戻す</div>
              <div><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd></div><div>やり直す</div>
              <div><kbd>Ctrl</kbd> + <kbd>A / C / X / V</kbd></div><div>全選択 / コピー / 切り取り / 貼り付け</div>
              <div><kbd>Ctrl</kbd> + <kbd>← / →</kbd></div><div>単語単位で移動</div>
              <div><kbd>Ctrl</kbd> + <kbd>Backspace / Delete</kbd></div><div>単語単位で削除</div>
              <div><kbd>Ctrl</kbd> + <kbd>Home / End</kbd></div><div>本文の先頭 / 末尾へ移動</div>
              <div><kbd>Shift</kbd> + 移動キー</div><div>選択範囲を拡張</div>
              <div><kbd>Ctrl</kbd> + <kbd>B</kbd></div><div>選択範囲へ傍点を適用</div>
              <div><kbd>F11</kbd></div><div>集中モードを切り替え</div>
              <div><kbd>F6</kbd></div><div>キーボード操作対象のペインを切り替え</div>
              <div><kbd>Ctrl</kbd> + <kbd>Tab</kbd></div><div>右ペインのメモ / 資料を切り替え</div>
              <div><kbd>Ctrl</kbd> + <kbd>1–3</kbd></div><div>資料カテゴリを切り替え</div>
            </div>

            <h3 id="preview-shortcuts">プレビューモード</h3>
            <div class="spec-table shortcut-table">
              <div class="table-head">キー</div><div class="table-head">操作</div>
              <div><kbd>Esc</kbd></div><div>本文編集へ戻る。縦書きプレビューでは横書き編集へ戻ります。</div>
              <div><kbd>↑ / ↓ / ← / →</kbd></div><div>プレビューを行または列単位で移動</div>
              <div><kbd>PageUp / PageDown</kbd></div><div>表示範囲単位で移動</div>
              <div><kbd>Home / End</kbd></div><div>プレビューの先頭 / 末尾へ移動</div>
              <div><kbd>F11</kbd></div><div>集中モードを切り替え</div>
            </div>
            <p>プレビュー中はコピー、切り取り、貼り付け、undo / redoなどの編集ショートカットを実行しません。</p>

            <h3 id="mouse-shortcuts">マウス操作</h3>
            <div class="spec-table two-cols">
              <div class="table-head">操作</div><div class="table-head">動作</div>
              <div>ダブルクリック</div><div>語と末尾の句読点を選択</div>
              <div><kbd>Ctrl</kbd> + ダブルクリック</div><div>文を選択</div>
              <div><kbd>Shift</kbd> + クリック</div><div>現在の選択範囲をクリック位置まで拡張</div>
              <div>中クリック</div><div>横書きは上下、縦書きは左右のオートスクロール</div>
            </div>
          </section>

          <section v-if="activePage === 'editions'" id="editions" class="doc-section">
            <p>
              体験版と製品版は同じ作品データ形式を使用します。
              体験版ではウィンドウタイトルの末尾に「体験版」と表示されます。
              製品版限定の操作は「有償版」と表示されるか、操作できない状態になります。
              作品データの取り込みなど、一部の入口は体験版では表示されません。
            </p>

            <h3 id="edition-comparison">機能比較</h3>
            <h4 class="comparison-group-title">執筆と作品管理</h4>
            <div class="spec-table edition-table">
              <div class="table-head">機能</div><div class="table-head">体験版</div><div class="table-head">製品版</div>
              <div>新規作品の作成</div><div class="limited">同じ親フォルダ内で3作品まで</div><div class="yes">制限なし</div>
              <div>既存作品を開く</div><div class="limited">親フォルダ内が3作品以下の場合に利用可能</div><div class="yes">利用可能</div>
              <div>既定保存場所の変更</div><div class="no">変更不可</div><div class="yes">変更可能</div>
              <div>本文編集・手動保存・自動保存</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>横書き編集・横書きプレビュー</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>縦書き編集・プレビュー</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>ルビ・傍点</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>検索・置換・本文整形</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>話・章・作品・共通メモ</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>資料・リンクジャンプ・初出チェック</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>締切・目標文字数・ステータス</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>Git記録・履歴・復元</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>集中モード・テーマ・本文フォント</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>統計</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>ダッシュ線を罫線文字へ置換</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div><code>...</code>を<code>…</code>へ自動変換</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>ダッシュ・三点リーダの二連化</div><div class="no">利用不可</div><div class="yes">利用可能</div>
            </div>

            <h4 id="edition-export-import" class="comparison-group-title">書き出しと取り込み</h4>
            <div class="spec-table edition-table">
              <div class="table-head">機能</div><div class="table-head">体験版</div><div class="table-head">製品版</div>
              <div>本文をコピー</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>話・章単位のtxt書き出し</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>作品全体txt書き出し</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>小説家になろうのZIP / TXTを取り込む</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>カクヨムのZIPを取り込む</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>通常のTXTから新しい作品を作る</div><div class="no">利用不可</div><div class="yes">利用可能</div>
            </div>

            <h4 id="edition-kakuriyo" class="comparison-group-title">KAKURIYO</h4>
            <div class="spec-table edition-table">
              <div class="table-head">機能</div><div class="table-head">体験版</div><div class="table-head">製品版</div>
              <div>現在話の基本解析</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>概要・要確認・傾向・反復</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>採用・見送り・ミュート</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>一般語・作品語の登録と解除</div><div class="yes">利用可能</div><div class="yes">利用可能</div>
              <div>更新ボタンの対象</div><div class="limited">現在話のみ</div><div class="yes">作品全体</div>
              <div>文体レーダーの章平均・作品平均比較</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>作品全体の解析・章をまたぐ比較</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>クリーン再解析</div><div class="no">利用不可</div><div class="yes">利用可能</div>
              <div>文体記憶の高度な蓄積・比較</div><div class="no">利用不可</div><div class="yes">利用可能</div>
            </div>

            <h3 id="trial-limits">体験版の作品数と保存場所</h3>
            <div class="admonition warning">
              <strong>同じ親フォルダ内で最大3作品</strong>
              <p>
                同じ親フォルダ内に作成できるNIGHTOVER作品は最大3件です。
                同じ親フォルダ内に4件以上ある場合、そのフォルダ内の作品の読み込みも制限されます。
              </p>
            </div>
            <p>
              作品数は同じ親フォルダ単位で判定します。
              体験版ではデフォルト保存場所を変更できないため、作品を作成する場所も初期の保存先を使用します。
            </p>

            <h3 id="trial-policy">期限・文字数・データ互換性</h3>
            <ul>
              <li>体験版に利用期限はありません。</li>
              <li>本文の保存を禁止する制限はありません。</li>
              <li>本文文字数による保存制限はありません。</li>
              <li>話・章・選択中の話のtxt書き出しは利用できます。</li>
              <li>体験版で作成した作品を製品版で開けます。</li>
              <li>製品版で作成した作品も、作品数制限に抵触しなければ体験版で開けます。</li>
              <li>Trial / Fullで本文や作品フォルダの形式を分けません。</li>
            </ul>
            <p>
              製品版で使った縦書き設定や解析データを含む作品を体験版で開いても、
              制限対象の設定やデータを削除・変換しません。製品版で開き直すと再び利用できます。
            </p>
          </section>

          <section v-if="activePage === 'terms'" id="terms" class="doc-section">
            <p>
              この利用規約は、ACMが提供するNIGHTOVERの利用条件を定めるものです。
              BOOTH、イベント会場、そのほか提供者が認めた方法で取得した体験版・製品版に適用されます。
            </p>
            <p>
              <strong>制定日:</strong> 2026年7月26日<br />
              <strong>提供者:</strong> ACM
            </p>

            <h3 id="terms-scope">第1条　適用</h3>
            <p>
              本規約は、ACM（以下「提供者」）が提供するWindows向け執筆ソフト「NIGHTOVER」
              （体験版、製品版および付属データを含み、以下「本ソフト」）の利用条件を定めるものです。
            </p>
            <p>
              本規約は、BOOTH、イベント会場、そのほか提供者が認めた方法で取得した本ソフトに適用されます。
              利用者は、本ソフトをインストールまたは使用した時点で、本規約に同意したものとします。
            </p>

            <h3 id="terms-license">第2条　ライセンス</h3>
            <p>本ソフトの製品版は、1人につき1ライセンスを必要とします。</p>
            <p>
              ライセンスを取得した本人は、本人が所有または管理する複数のWindows PCへ本ソフトをインストールできます。
              PCの台数による追加ライセンスは必要ありません。
            </p>

            <h3 id="terms-organization">第3条　法人・サークルでの利用</h3>
            <p>法人、団体、サークル、そのほか複数人で構成される組織でも、本ソフトを利用できます。</p>
            <p>
              ただし、実際に本ソフトを使用する人数と同数のライセンスが必要です。
              1つのライセンスを複数人で共用することはできません。
            </p>
            <p>
              ライセンスは、最初に使用した利用者本人に限って有効です。
              退職、担当者の交代、そのほかの理由を問わず、別の利用者への変更、引き継ぎ、再割り当てはできません。
              新しい利用者が使用する場合は、その利用者のための新しいライセンスが必要です。
            </p>

            <h3 id="terms-works">第4条　作品の利用</h3>
            <p>
              本ソフトを使用して作成した小説、文章、設定資料、そのほかの作品に関する権利は、
              利用者または正当な権利者に帰属します。
            </p>
            <p>利用者は、本ソフトで作成した作品を、次の用途を含め自由に利用できます。</p>
            <ul>
              <li>小説投稿サイトへの掲載</li>
              <li>同人誌や電子書籍の制作・販売</li>
              <li>商業出版</li>
              <li>コンテストへの応募</li>
              <li>法人または団体の業務</li>
              <li>そのほか営利・非営利を問わない創作活動</li>
            </ul>
            <p>作品へのクレジット表記や、提供者への利用報告は必要ありません。</p>

            <h3 id="terms-software-rights">第5条　本ソフトの権利</h3>
            <p>
              本ソフト、付属データ、アイコン、画面デザインおよびドキュメントに関する著作権その他の権利は、
              提供者または正当な権利者に帰属します。
              本ソフトの購入または取得によって、これらの権利が利用者へ譲渡されるものではありません。
            </p>

            <h3 id="terms-prohibited">第6条　禁止事項</h3>
            <p>利用者は、次の行為を行ってはいけません。</p>
            <ul>
              <li>本ソフトやインストーラーを第三者へ再配布、販売、貸与または譲渡する行為</li>
              <li>ライセンスを複数人で共用する行為</li>
              <li>第三者が自由にダウンロードまたは使用できる場所へ本ソフトを置く行為</li>
              <li>体験版の制限やライセンス管理を回避する行為</li>
              <li>不正利用や再配布を目的として本ソフトを解析、改変する行為</li>
              <li>本ソフトの著作権表示や識別情報を削除する行為</li>
              <li>法令または公序良俗に反する目的で本ソフトを使用する行為</li>
              <li>提供者または第三者の権利や利益を侵害する行為</li>
            </ul>

            <h3 id="terms-data">第7条　データと外部送信</h3>
            <p>
              本ソフトは、利用者が入力した本文、作品情報、設定、利用状況、そのほかのデータを、
              提供者または外部サーバーへ送信しません。
            </p>
            <p>
              作品データおよび設定データは利用者のPC内に保存されます。
              Gitによる記録も利用者のPC内で行われ、本ソフトが外部のGitサービスへ作品データを送信することはありません。
            </p>
            <p>
              利用者自身が外部リンクを開いた場合や、別のソフトウェアまたはサービスを利用した場合は、
              それぞれの提供者が定める規約やプライバシーポリシーが適用されます。
            </p>

            <h3 id="terms-support-information">第8条　執筆支援情報</h3>
            <p>
              KAKURIYO、統計、初出チェック、反復表現の検出、そのほかの執筆支援機能は、
              利用者が文章を確認するための参考情報を表示するものです。
            </p>
            <p>
              これらの機能は、文章の正解、品質、評価、権利関係または投稿先サービスの規則への適合を保証するものではありません。
              表示された情報を採用するかどうかは、利用者が判断するものとします。
            </p>

            <h3 id="terms-saving">第9条　保存とバックアップ</h3>
            <p>
              本ソフトには、自動保存やバックアップに関する機能が含まれますが、
              あらゆる状況でのデータ保存や復元を保証するものではありません。
            </p>
            <p>
              利用者は、重要な作品について、作品フォルダを別のストレージへコピーするなど、
              自身でも定期的にバックアップを作成するものとします。
            </p>

            <h3 id="terms-environment">第10条　動作環境</h3>
            <p>本ソフトは、提供者が案内する対応環境で使用するものとします。</p>
            <p>
              Git機能を使用するには、利用者のPCへGitがインストールされている必要があります。
              Windows、Git、フォント、そのほかの外部環境の変更により、一部機能が使用できなくなる場合があります。
            </p>

            <h3 id="terms-updates">第11条　更新と提供内容</h3>
            <p>提供者は、本ソフトの機能、仕様、動作環境または提供方法を変更することがあります。</p>
            <p>
              不具合修正、機能追加、アップデートおよび利用者サポートが、将来にわたって継続されることを保証するものではありません。
              大きな機能変更を伴う新しい製品版については、別の商品として提供する場合があります。
            </p>

            <h3 id="terms-refunds">第12条　返金</h3>
            <p>ダウンロード商品の性質上、購入者の都合による返品、交換および返金は原則として受け付けません。</p>
            <p>次の事情は、購入者の都合に含まれます。</p>
            <ul>
              <li>対応環境を確認せずに購入した場合</li>
              <li>期待していた機能と異なる場合</li>
              <li>購入後に本ソフトを使用しなくなった場合</li>
              <li>利用者のPC環境でのみ正常に動作しない場合</li>
              <li>本規約や機能説明を確認せずに購入した場合</li>
            </ul>
            <p>
              ただし、重複決済、配布ファイルの破損、製品版を正常に提供できない場合、
              そのほか提供者または販売サービス側に原因がある場合は、状況を確認したうえで交換または返金に対応します。
            </p>
            <p>BOOTHを通じて購入した場合、決済や返金手続きにはBOOTHの規約および手続きも適用されます。</p>

            <h3 id="terms-liability">第13条　保証と責任</h3>
            <p>
              提供者は、本ソフトに不具合が一切存在しないこと、すべての環境で動作すること、
              利用者の特定の目的へ適合することを保証しません。
            </p>
            <p>
              提供者の通常の過失によって利用者に損害が生じ、提供者が賠償責任を負う場合、
              その範囲は直接かつ通常の損害に限り、賠償額の上限は利用者が対象ライセンスの取得に支払った金額とします。
            </p>
            <p>この制限は、提供者の故意または重大な過失によって損害が発生した場合には適用しません。</p>

            <h3 id="terms-termination">第14条　利用停止</h3>
            <p>
              利用者が本規約へ重大な違反をした場合、提供者は当該利用者のライセンスを終了できます。
              ライセンスが終了した場合、利用者は本ソフトの使用を停止し、管理するPCから本ソフトおよびその複製を削除するものとします。
            </p>
            <p>本ソフトで作成した作品や作品データは、ライセンス終了後も利用者が保持できます。</p>

            <h3 id="terms-changes">第15条　規約の変更</h3>
            <p>
              提供者は、変更の必要性、変更内容の相当性、そのほかの事情に照らして合理的な場合、本規約を変更することがあります。
            </p>
            <p>
              変更する場合は、変更内容と適用開始日をNIGHTOVERのリファレンスサイト、
              BOOTHの商品ページ、そのほか適切な場所で案内します。
            </p>

            <h3 id="terms-law">第16条　準拠法</h3>
            <p>本規約は日本法に準拠します。</p>
            <p>
              本ソフトまたは本規約に関して問題が生じた場合、
              利用者と提供者は、まず誠実に話し合って解決を図るものとします。
            </p>

            <h3 id="terms-contact">第17条　提供者・お問い合わせ</h3>
            <ul>
              <li>提供者: ACM</li>
              <li>販売場所: BOOTHおよびイベント会場など</li>
              <li>お問い合わせ: BOOTHのメッセージ機能または提供者が別途案内する連絡先</li>
            </ul>
          </section>

          <nav class="doc-footer-nav" aria-label="ページ移動">
            <button v-if="previousPage" class="previous-link" type="button" @click="navigateTo(previousPage.id)">
              <span>前へ</span>
              <strong>{{ previousPage.label }}</strong>
            </button>
            <span v-else></span>
            <button v-if="nextPage" class="next-link" type="button" @click="navigateTo(nextPage.id)">
              <span>次へ</span>
              <strong>{{ nextPage.label }}</strong>
            </button>
          </nav>

          <footer class="docs-footer">
            <p>NIGHTOVER 機能リファレンス</p>
            <p>仕様基準日: 2026-06-28</p>
          </footer>
        </article>
      </main>

      <aside class="page-toc">
        <strong>このページの内容</strong>
        <nav aria-label="このページの内容">
          <button
            v-for="item in currentToc"
            :key="item.id"
            type="button"
            @click="jumpToHeading(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
        <button class="to-top" type="button" @click="scrollToTop">ページ先頭へ ↑</button>
      </aside>
    </div>

    <Teleport to="body">
      <Transition name="screenshot-lightbox">
        <div
          v-if="lightboxSrc"
          class="screenshot-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="スクリーンショットの拡大表示"
          @click.self="closeLightbox"
        >
          <button
            ref="lightboxCloseButton"
            class="screenshot-lightbox__close"
            type="button"
            aria-label="拡大表示を閉じる"
            @click="closeLightbox"
          >
            ×
          </button>
          <figure class="screenshot-lightbox__figure">
            <img :src="lightboxSrc" :alt="lightboxAlt" />
            <figcaption v-if="lightboxCaption">{{ lightboxCaption }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.docs-site {
  --doc-accent: #f2bc6c;
  --doc-accent-dark: #f6ca84;
  --doc-accent-soft: #342b1d;
  --doc-text: #ece9e3;
  --doc-muted: #b8b3aa;
  --doc-subtle: #817d75;
  --doc-line: #3c3a36;
  --doc-bg: #1f1f1f;
  --doc-sidebar: #1b1b1b;
  min-height: 100vh;
  background: var(--doc-bg);
  color: var(--doc-text);
  font-family: 'Yu Gothic UI', 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.8;
}

:global(html.nightover-docs-open),
:global(html.nightover-docs-open *) {
  scrollbar-width: thin;
  scrollbar-color: #8f6b3f #171717;
}

:global(html.nightover-docs-open::-webkit-scrollbar),
:global(html.nightover-docs-open *::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:global(html.nightover-docs-open::-webkit-scrollbar-track),
:global(html.nightover-docs-open *::-webkit-scrollbar-track) {
  background: #171717;
}

:global(html.nightover-docs-open::-webkit-scrollbar-thumb),
:global(html.nightover-docs-open *::-webkit-scrollbar-thumb) {
  border: 2px solid #171717;
  border-radius: 999px;
  background: #8f6b3f;
}

:global(html.nightover-docs-open::-webkit-scrollbar-thumb:hover),
:global(html.nightover-docs-open *::-webkit-scrollbar-thumb:hover) {
  background: #bd8f51;
}

button,
input {
  font: inherit;
}

button {
  color: inherit;
}

.docs-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--doc-line);
  background: rgba(31, 31, 31, 0.96);
  backdrop-filter: blur(12px);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.app-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.title-logo {
  width: 154px;
  height: auto;
  filter: invert(1);
}

.docs-label {
  padding-left: 12px;
  border-left: 1px solid var(--doc-line);
  color: var(--doc-muted);
  font-size: 0.75rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--doc-subtle);
  font-size: 0.72rem;
}

.mobile-menu {
  display: none;
}

.docs-layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 860px) 220px;
  justify-content: center;
  min-height: calc(100vh - 64px);
}

.docs-sidebar {
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  padding: 22px 18px 30px;
  border-right: 1px solid var(--doc-line);
  background: var(--doc-sidebar);
  overflow-y: auto;
}

.sidebar-search {
  height: 38px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 0 10px;
  border: 1px solid #48443e;
  border-radius: 6px;
  background: #242321;
  color: var(--doc-subtle);
}

.sidebar-search:focus-within {
  border-color: var(--doc-accent);
  box-shadow: 0 0 0 3px rgba(242, 188, 108, 0.12);
}

.sidebar-search input {
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--doc-text);
  font-size: 0.72rem;
}

.sidebar-search input::placeholder {
  color: #817d75;
}

.sidebar-search kbd {
  color: #817d75;
  font-size: 0.56rem;
}

.nav-group {
  margin-top: 24px;
}

.nav-group h2,
.sidebar-results > p {
  margin: 0 8px 7px;
  color: #ddd9d2;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.nav-group button,
.sidebar-results button {
  width: 100%;
  display: block;
  padding: 7px 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--doc-muted);
  text-align: left;
  font-size: 0.72rem;
  cursor: pointer;
}

.nav-group button:hover,
.sidebar-results button:hover {
  background: #282622;
  color: var(--doc-text);
}

.nav-group button.active {
  background: var(--doc-accent-soft);
  color: var(--doc-accent-dark);
  font-weight: 600;
}

.sidebar-results {
  margin-top: 20px;
}

.sidebar-results button {
  display: grid;
  gap: 2px;
  margin-bottom: 2px;
  padding-top: 9px;
  padding-bottom: 9px;
}

.sidebar-results button strong {
  color: var(--doc-text);
  font-size: 0.7rem;
  font-weight: 600;
}

.sidebar-results button small {
  color: var(--doc-subtle);
  font-size: 0.58rem;
}

.sidebar-results > span {
  display: block;
  padding: 8px;
  color: var(--doc-subtle);
  font-size: 0.68rem;
}

.sidebar-version {
  display: flex;
  justify-content: space-between;
  margin-top: 28px;
  padding: 15px 8px 0;
  border-top: 1px solid var(--doc-line);
  color: var(--doc-subtle);
  font-size: 0.6rem;
}

.sidebar-version strong {
  color: var(--doc-muted);
  font-weight: 500;
}

.docs-content {
  min-width: 0;
  padding: 48px clamp(34px, 4vw, 64px) 60px;
}

.docs-content > article {
  max-width: 760px;
  margin: 0 auto;
}

.page-heading {
  margin-bottom: 28px;
}

.doc-section {
  scroll-margin-top: 88px;
  padding-bottom: 58px;
}

.doc-section + .doc-section {
  padding-top: 6px;
  border-top: 1px solid var(--doc-line);
}

.intro-section {
  padding-top: 4px;
}

.breadcrumbs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  color: var(--doc-subtle);
  font-size: 0.68rem;
}

.breadcrumbs i {
  font-style: normal;
}

.docs-content h1 {
  margin: 0 0 18px;
  color: #f4f1eb;
  font-size: clamp(2rem, 3vw, 2.55rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.docs-content h2 {
  margin: 48px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--doc-line);
  color: #f1eee8;
  font-size: 1.65rem;
  font-weight: 650;
  line-height: 1.4;
}

.doc-section > h2:first-child,
.section-title-with-icon h2 {
  margin-top: 0;
}

.docs-content h3 {
  margin: 34px 0 10px;
  color: #e4e0d8;
  font-size: 1.15rem;
  font-weight: 650;
  line-height: 1.5;
}

.docs-content h2[id],
.docs-content h3[id] {
  scroll-margin-top: 84px;
}

.docs-content h4 {
  margin: 0;
  font-size: 0.87rem;
  font-weight: 650;
}

.docs-content p {
  margin: 0 0 15px;
  color: var(--doc-muted);
}

.docs-content p a {
  color: var(--doc-accent-dark);
  text-decoration-color: rgb(246 202 132 / 42%);
  text-underline-offset: 3px;
}

.docs-content p a:hover {
  text-decoration-color: currentColor;
}

.lead {
  max-width: 720px;
  color: #d0cbc2 !important;
  font-size: 1.03rem;
  line-height: 1.9;
}

.docs-content ul,
.docs-content ol {
  margin: 10px 0 20px;
  padding-left: 1.55rem;
  color: var(--doc-muted);
}

.docs-content li {
  margin: 5px 0;
  padding-left: 0.2rem;
}

.docs-content strong {
  color: #e7e3dc;
}

.docs-content code {
  padding: 0.13em 0.35em;
  border-radius: 4px;
  background: #2d2922;
  color: #f2c984;
  font-family: Consolas, 'Cascadia Mono', monospace;
  font-size: 0.86em;
}

.docs-content code.accent-color-code {
  background: #f2bc6c;
  color: #251b0d;
  font-weight: 700;
}

.docs-content pre {
  margin: 16px 0 22px;
  padding: 18px 20px;
  border: 1px solid #45413b;
  border-radius: 6px;
  background: #1a1a1a;
  overflow-x: auto;
}

.docs-content pre code {
  padding: 0;
  background: transparent;
  color: #d7d3cb;
  font-size: 0.82rem;
  line-height: 1.7;
}

.docs-content kbd {
  display: inline-block;
  min-width: 1.8em;
  padding: 0.08em 0.42em;
  border: 1px solid #4d4942;
  border-bottom-width: 2px;
  border-radius: 4px;
  background: #292722;
  color: #d8d3ca;
  font-family: inherit;
  font-size: 0.78em;
  line-height: 1.6;
  text-align: center;
}

.admonition {
  margin: 24px 0;
  padding: 16px 18px;
  border-left: 4px solid;
  border-radius: 4px;
}

.admonition strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.79rem;
}

.admonition p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.75;
}

.app-screenshot {
  margin: 22px 0 30px;
}

.app-screenshot a {
  display: block;
  overflow: hidden;
  border: 1px solid var(--doc-line);
  border-radius: 8px;
  background: #0d0c10;
  box-shadow: 0 12px 28px rgb(0 0 0 / 18%);
  cursor: zoom-in;
  transition: border-color 0.16s ease;
}

.app-screenshot a:hover {
  border-color: #786348;
}

.app-screenshot img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: inherit;
  transition: transform 0.22s ease;
}

@media (hover: hover) and (pointer: fine) {
  .app-screenshot a:hover img {
    transform: scale(1.018);
  }
}

.app-screenshot figcaption {
  margin-top: 9px;
  color: var(--doc-subtle);
  font-size: 0.67rem;
  line-height: 1.65;
}

.app-screenshot--dialog {
  max-width: 560px;
  margin-right: auto;
  margin-left: auto;
}

.app-screenshot--indicator {
  max-width: 640px;
  margin-right: auto;
  margin-left: auto;
}

.app-screenshot--accent-comparison {
  max-width: 810px;
  margin-right: auto;
  margin-left: auto;
}

.screenshot-lightbox {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 54px 24px 24px;
  background: rgb(7 7 8 / 92%);
  backdrop-filter: blur(5px);
}

.screenshot-lightbox__figure {
  display: grid;
  max-width: min(96vw, 1500px);
  max-height: calc(100vh - 78px);
  margin: 0;
  place-items: center;
}

.screenshot-lightbox__figure img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 112px);
  border: 1px solid #514a40;
  border-radius: 10px;
  background: #111;
  box-shadow: 0 24px 80px rgb(0 0 0 / 55%);
  object-fit: contain;
}

.screenshot-lightbox__figure figcaption {
  margin-top: 10px;
  color: #b8b0a4;
  font-size: 0.72rem;
  line-height: 1.6;
  text-align: center;
}

.screenshot-lightbox__close {
  position: fixed;
  top: 14px;
  right: 18px;
  display: grid;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #655d52;
  border-radius: 50%;
  background: #211f1d;
  color: #f5f1eb;
  cursor: pointer;
  font: 400 1.45rem/1 sans-serif;
  place-items: center;
}

.screenshot-lightbox__close:hover,
.screenshot-lightbox__close:focus-visible {
  border-color: var(--doc-accent);
  outline: none;
}

.screenshot-lightbox-enter-active,
.screenshot-lightbox-leave-active {
  transition: opacity 0.18s ease;
}

.screenshot-lightbox-enter-active .screenshot-lightbox__figure,
.screenshot-lightbox-leave-active .screenshot-lightbox__figure {
  transition: transform 0.18s ease;
}

.screenshot-lightbox-enter-from,
.screenshot-lightbox-leave-to {
  opacity: 0;
}

.screenshot-lightbox-enter-from .screenshot-lightbox__figure,
.screenshot-lightbox-leave-to .screenshot-lightbox__figure {
  transform: scale(0.975);
}

@media (prefers-reduced-motion: reduce) {
  .app-screenshot img,
  .screenshot-lightbox,
  .screenshot-lightbox__figure {
    transition: none;
  }
}

.screenshot-pair {
  display: grid;
  gap: 24px;
  margin: 22px 0 30px;
}

.screenshot-pair .app-screenshot {
  margin: 0;
}

.admonition.info {
  border-color: #8190e3;
  background: #20243a;
}

.admonition.note {
  border-color: var(--doc-accent);
  background: var(--doc-accent-soft);
}

.admonition.warning {
  border-color: #d09a32;
  background: #322916;
}

.spec-table {
  display: grid;
  margin: 18px 0 28px;
  border: 1px solid var(--doc-line);
  border-radius: 5px;
  overflow: hidden;
}

.spec-table.two-cols,
.shortcut-table,
.file-map-table,
.radar-axis-table {
  grid-template-columns: minmax(150px, 0.58fr) minmax(260px, 1.42fr);
}

.workspace-table,
.editor-modes,
.edition-table {
  grid-template-columns: minmax(110px, 0.5fr) minmax(260px, 1.2fr) minmax(90px, 0.42fr);
}

.editor-modes {
  grid-template-columns: minmax(155px, 0.7fr) minmax(72px, 0.28fr) minmax(260px, 1.1fr);
}

.edition-table {
  grid-template-columns: minmax(240px, 1.2fr) repeat(2, minmax(110px, 0.5fr));
}

.spec-table > div {
  min-width: 0;
  padding: 10px 13px;
  border-right: 1px solid var(--doc-line);
  border-bottom: 1px solid var(--doc-line);
  color: var(--doc-muted);
  font-size: 0.73rem;
}

.spec-table.two-cols > div:nth-child(2n),
.shortcut-table > div:nth-child(2n),
.file-map-table > div:nth-child(2n),
.radar-axis-table > div:nth-child(2n) {
  border-right: 0;
}

.workspace-table > div:nth-child(3n),
.editor-modes > div:nth-child(3n),
.edition-table > div:nth-child(3n),
.setting-options-table > div:nth-child(3n) {
  border-right: 0;
}

.punctuation-settings-table > div:nth-child(4n) {
  border-right: 0;
}

.spec-table.two-cols > div:nth-last-child(-n+2),
.shortcut-table > div:nth-last-child(-n+2),
.file-map-table > div:nth-last-child(-n+2),
.radar-axis-table > div:nth-last-child(-n+2) {
  border-bottom: 0;
}

.workspace-table > div:nth-last-child(-n+3),
.editor-modes > div:nth-last-child(-n+3),
.edition-table > div:nth-last-child(-n+3),
.setting-options-table > div:nth-last-child(-n+3) {
  border-bottom: 0;
}

.punctuation-settings-table > div:nth-last-child(-n+4) {
  border-bottom: 0;
}

.spec-table .table-head {
  background: #242321;
  color: #e1ddd5;
  font-weight: 650;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 18px;
}

.status {
  padding: 4px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 0.66rem;
}

.status.draft { border-color: #69809e; background: #202934; color: #b3c7df; }
.status.revision { border-color: #a97d43; background: #302619; color: #e6bd83; }
.status.done { border-color: #56896a; background: #1c2c22; color: #a5d4b7; }
.status.custom { border-color: #a97d43; background: #302619; color: #e6bd83; }

.section-title-with-icon {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 28px;
  padding: 0 0 22px;
  border-bottom: 1px solid var(--doc-line);
}

.section-title-with-icon h2 {
  margin-bottom: 10px;
}

.section-title-with-icon p {
  margin: 0;
}

.kakuriyo-main-icon {
  width: 38px;
  height: 38px;
  padding: 0;
  background: transparent;
  object-fit: contain;
  opacity: 0.82;
  transform: translateY(-4px);
}

.kakuriyo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 16px 0 28px;
  border-top: 1px solid var(--doc-line);
}

.kakuriyo-grid article {
  display: grid;
  grid-template-columns: 34px minmax(120px, 160px) minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  padding: 15px 6px;
  border-bottom: 1px solid var(--doc-line);
}

.kakuriyo-grid img {
  width: 27px;
  height: 27px;
  padding: 0;
  background: transparent;
  filter: invert(1);
  object-fit: contain;
  opacity: 0.72;
}

.kakuriyo-grid p {
  margin: 0;
  font-size: 0.72rem;
  line-height: 1.65;
}

.term-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 14px 0 25px;
}

.term-list code {
  padding: 5px 9px;
}

.setting-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 16px;
}

.setting-meta span {
  padding: 4px 9px;
  border: 1px solid var(--doc-line);
  border-radius: 4px;
  color: var(--doc-subtle);
  font-size: 0.66rem;
}

.setting-example {
  margin: 18px 0 22px;
  padding: 11px 0 11px 15px;
  border-left: 2px solid #786348;
}

.setting-example > strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.76rem;
}

.setting-example p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.8;
}

.setting-options-table {
  grid-template-columns: minmax(180px, 0.8fr) minmax(120px, 0.55fr) minmax(260px, 1.35fr);
}

.punctuation-settings-table {
  grid-template-columns: minmax(185px, 1fr) minmax(140px, 0.75fr) minmax(70px, 0.35fr) minmax(105px, 0.55fr);
}

.yes {
  color: #8dceaa !important;
}

.no {
  color: #817d75 !important;
}

.limited {
  color: #e6bd83 !important;
}

.comparison-group-title {
  margin: 26px 0 10px !important;
  color: #ded9d0;
  font-size: 0.9rem !important;
  font-weight: 650;
}

.indicator-warning {
  color: #ff5f67 !important;
}

.doc-footer-nav {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 18px;
  padding-top: 30px;
  border-top: 1px solid var(--doc-line);
}

.doc-footer-nav button {
  display: grid;
  gap: 2px;
  padding: 14px 16px;
  border: 1px solid var(--doc-line);
  border-radius: 6px;
  background: #1c1c1c;
  text-align: left;
  cursor: pointer;
}

.doc-footer-nav .next-link {
  text-align: right;
}

.doc-footer-nav button:hover {
  border-color: var(--doc-accent);
}

.doc-footer-nav span {
  color: var(--doc-subtle);
  font-size: 0.62rem;
}

.doc-footer-nav strong {
  color: var(--doc-accent-dark);
  font-size: 0.76rem;
}

.docs-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 42px;
  padding-top: 20px;
  border-top: 1px solid var(--doc-line);
}

.docs-footer p {
  color: var(--doc-subtle);
  font-size: 0.62rem;
}

.page-toc {
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  padding: 50px 20px 30px;
  overflow-y: auto;
}

.page-toc > strong {
  display: block;
  margin-bottom: 10px;
  color: #d7d3cb;
  font-size: 0.66rem;
}

.page-toc nav {
  display: grid;
  border-left: 1px solid var(--doc-line);
}

.page-toc nav button {
  padding: 5px 0 5px 14px;
  border: 0;
  background: transparent;
  color: var(--doc-subtle);
  text-align: left;
  font-size: 0.63rem;
  line-height: 1.5;
  cursor: pointer;
}

.page-toc nav button:hover {
  color: var(--doc-accent-dark);
}

.to-top {
  margin-top: 18px;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: var(--doc-subtle);
  font-size: 0.6rem;
  cursor: pointer;
}

.to-top:hover {
  color: var(--doc-accent-dark);
}

@media (max-width: 1180px) {
  .docs-layout {
    grid-template-columns: 250px minmax(0, 860px);
  }

  .page-toc {
    display: none;
  }
}

@media (max-width: 820px) {
  .docs-header {
    padding: 0 16px;
  }

  .header-right > span {
    display: none;
  }

  .mobile-menu {
    position: relative;
    width: 42px;
    height: 38px;
    display: grid;
    align-content: center;
    gap: 4px;
    padding: 9px;
    border: 1px solid var(--doc-line);
    border-radius: 5px;
    background: #242321;
    cursor: pointer;
  }

  .mobile-menu span {
    width: 100%;
    height: 1px;
    background: #ddd8cf;
  }

  .mobile-menu i {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  .docs-layout {
    display: block;
  }

  .docs-sidebar {
    position: fixed;
    top: 64px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    height: auto;
    border-right: 0;
    transform: translateX(-102%);
    transition: transform 0.2s ease;
  }

  .docs-sidebar.open {
    transform: translateX(0);
  }

  .docs-content {
    padding-top: 34px;
  }
}

@media (max-width: 600px) {
  .app-icon {
    width: 27px;
    height: 27px;
  }

  .title-logo {
    width: 125px;
  }

  .docs-label {
    display: none;
  }

  .docs-content {
    padding: 30px 18px 46px;
  }

  .docs-content h1 {
    font-size: 2.2rem;
  }

  .docs-content h2 {
    font-size: 1.4rem;
  }

  .spec-table {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-inline: contain;
  }

  .workspace-table {
    grid-template-columns: minmax(120px, 0.55fr) minmax(250px, 1.2fr) minmax(100px, 0.45fr);
  }

  .editor-modes {
    grid-template-columns: minmax(126px, 0.72fr) minmax(58px, 0.34fr) minmax(168px, 1fr);
  }

  .editor-modes > div {
    padding-inline: 10px;
  }

  .edition-table {
    grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(88px, 0.72fr));
  }

  .edition-table .yes,
  .edition-table .no {
    white-space: nowrap;
  }

  .spec-table.two-cols,
  .shortcut-table,
  .file-map-table,
  .radar-axis-table {
    grid-template-columns: minmax(130px, 0.55fr) minmax(250px, 1.45fr);
  }

  .kakuriyo-grid {
    grid-template-columns: minmax(130px, 0.8fr) minmax(200px, 1.2fr);
  }

  .setting-options-table {
    grid-template-columns: minmax(160px, 0.8fr) minmax(105px, 0.55fr) minmax(250px, 1.35fr);
  }

  .punctuation-settings-table {
    grid-template-columns: minmax(175px, 1fr) minmax(135px, 0.75fr) minmax(60px, 0.35fr) minmax(95px, 0.55fr);
  }

  .kakuriyo-grid article {
    grid-template-columns: 30px 1fr;
    gap: 3px 12px;
  }

  .kakuriyo-grid img {
    grid-row: 1 / span 2;
  }

  .kakuriyo-grid p {
    grid-column: 2;
  }

  .doc-footer-nav {
    grid-template-columns: 1fr;
  }

  .doc-footer-nav .next-link {
    text-align: left;
  }

  .docs-footer {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
