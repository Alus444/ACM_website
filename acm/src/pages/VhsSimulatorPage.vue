<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  allVhsGlossaryTerms,
  allVhsNavItems,
  vhsCurrentVersion,
  vhsGlossaryGroups,
  vhsIssues,
  vhsNavGroups,
  vhsParameterGroups,
  vhsPresetSummaries,
} from '../data/vhs-simulator'

type SearchResult = {
  page: string
  hash?: string
  eyebrow: string
  title: string
  description: string
}

type PageTocItem = {
  id: string
  label: string
  nested?: boolean
}

type ParameterRangeVisual = {
  kind: 'meter' | 'choices'
  labels: string[]
  position: number
  initialLabel: string
}

const parameterRangeVisuals = new Map<string, ParameterRangeVisual>()

function formatRangeValue(value: number, unit: string) {
  const formatted = Number.isInteger(value) ? String(value) : String(value)
  if (!unit) return formatted
  return unit === '%' ? `${formatted}%` : `${formatted} ${unit}`
}

function parameterRangeVisual(parameter: { id: string; range: string; defaultValue: string }): ParameterRangeVisual {
  const cached = parameterRangeVisuals.get(parameter.id)
  if (cached) return cached

  let visual: ParameterRangeVisual

  if (parameter.range === '未選択＋6種類') {
    visual = { kind: 'choices', labels: ['未選択', '6種類'], position: 0, initialLabel: parameter.defaultValue }
  } else if (parameter.range === '第1–第5世代') {
    const initial = Number(parameter.defaultValue.match(/\d+/)?.[0] ?? 1)
    visual = {
      kind: 'choices',
      labels: ['第1世代', '第2世代', '第3世代', '第4世代', '第5世代'],
      position: ((initial - 1) / 4) * 100,
      initialLabel: parameter.defaultValue,
    }
  } else if (parameter.range.includes('／')) {
    const labels = parameter.range.split('／')
    const initialIndex = Math.max(0, labels.indexOf(parameter.defaultValue))
    visual = {
      kind: 'choices',
      labels,
      position: labels.length > 1 ? (initialIndex / (labels.length - 1)) * 100 : 0,
      initialLabel: parameter.defaultValue,
    }
  } else {
    const rangeMatch = parameter.range.match(/^(-?\d+(?:\.\d+)?)\s*–\s*(-?\d+(?:\.\d+)?)(.*)$/)
    const initialMatch = parameter.defaultValue.match(/-?\d+(?:\.\d+)?/)

    if (rangeMatch && initialMatch) {
      const minimum = Number(rangeMatch[1])
      const maximum = Number(rangeMatch[2])
      const initial = Number(initialMatch[0])
      const unit = (rangeMatch[3] ?? '').trim()
      const position = maximum === minimum ? 0 : ((initial - minimum) / (maximum - minimum)) * 100
      const initialHasUnit = /[^\d.\-\s]/.test(parameter.defaultValue)

      visual = {
        kind: 'meter',
        labels: [formatRangeValue(minimum, unit), formatRangeValue(maximum, unit)],
        position: Math.min(100, Math.max(0, position)),
        initialLabel: initialHasUnit ? parameter.defaultValue : formatRangeValue(initial, unit),
      }
    } else {
      visual = { kind: 'choices', labels: [parameter.range], position: 0, initialLabel: parameter.defaultValue }
    }
  }

  parameterRangeVisuals.set(parameter.id, visual)
  return visual
}

function meterInitialAlignment(position: number) {
  if (position <= 15) return 'start'
  if (position >= 85) return 'end'
  return 'center'
}

const route = useRoute()
const searchQuery = ref('')
const mobileNavOpen = ref(false)
const isMobileLayout = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const sidebarNav = ref<HTMLElement | null>(null)
const comparisonPosition = ref(50)
const comparisonSourceVideo = ref<HTMLVideoElement | null>(null)
const comparisonProcessedVideo = ref<HTMLVideoElement | null>(null)
const comparisonPlaying = ref(false)
const comparisonRefreshing = ref(false)
const prefersReducedMotion = ref(true)
const lightboxSrc = ref('')
const lightboxAlt = ref('')
const lightboxCaption = ref('')
const lightboxCloseButton = ref<HTMLButtonElement | null>(null)
let comparisonPlaybackSyncing = false
let comparisonSyncFrame: number | undefined
let comparisonAutoplayRequested = false
let comparisonLastHardSync = 0
let reducedMotionQuery: MediaQueryList | undefined
let previousBodyOverflow = ''
let lightboxTrigger: HTMLElement | null = null

const comparisonVideoVersion = '20260825-custom-r1'

const vhsPresetSamples = [
  {
    id: 'steps',
    comparisonFile: 'preset-comparison.webp?v=20260824-current-labels',
    sourceFile: 'preset-source-steps.webp',
    alt: '階段と植栽の映像に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '階段と植栽を写した加工前の元画像',
    caption: '輪郭、色、走行の乱れ、CRT表示の違いを比較できます。',
  },
  {
    id: 'parking',
    comparisonFile: 'preset-comparison-parking.webp',
    sourceFile: 'preset-source-parking.webp',
    alt: '雪の残る濡れた駐車場に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '雪の残る濡れた駐車場の加工前画像',
    caption: '濡れた路面と黄色い区画線で、色にじみ、暗部、反射の変化を比較できます。',
  },
  {
    id: 'street',
    comparisonFile: 'preset-comparison-street.webp',
    sourceFile: 'preset-source-street.webp?v=test4',
    alt: '日なたと影のある街路に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '日なたと影のある街路の加工前画像',
    caption: '街路の細い線と日なた・影で、輪郭、色、走行の乱れを比較できます。',
  },
  {
    id: 'dsc1386',
    comparisonFile: 'preset-comparison-dsc1386.webp',
    sourceFile: 'preset-source-dsc1386.webp',
    alt: '夜の駅通路に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '夜の駅通路を写した加工前の元画像',
    caption: '夜の駅通路で、暗部の残り方、点光源のにじみ、床面の解像感を比較できます。',
  },
  {
    id: 'dsc1373',
    comparisonFile: 'preset-comparison-dsc1373.webp',
    sourceFile: 'preset-source-dsc1373.webp',
    alt: '高架下の通路に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '高架下の通路を写した加工前の元画像',
    caption: '高架下の深い影と明るい出口で、階調、輪郭、走行の乱れを比較できます。',
  },
  {
    id: 'dsc1361',
    comparisonFile: 'preset-comparison-dsc1361.webp',
    sourceFile: 'preset-source-dsc1361.webp',
    alt: '蛍光灯と金属壁に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '蛍光灯と金属壁を写した加工前の元画像',
    caption: '蛍光灯と金属壁で、ハイライトのにじみ、面のノイズ、細い配管の変化を比較できます。',
  },
  {
    id: 'dsc1265',
    comparisonFile: 'preset-comparison-dsc1265.webp',
    sourceFile: 'preset-source-dsc1265.webp',
    alt: '青空と白い雲に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '青空と白い雲、電線、樹木を写した加工前の元画像',
    caption: '青空と白い雲、細い電線で、色の変化、輪郭の崩れ、CRT表示を比較できます。',
  },
  {
    id: 'dsc0804',
    comparisonFile: 'preset-comparison-dsc0804.webp',
    sourceFile: 'preset-source-dsc0804.webp',
    alt: '夜の路地に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '夜の路地を写した加工前の元画像',
    caption: '夜の路地で、暗部ノイズ、白線のにじみ、街灯周辺の階調を比較できます。',
  },
  {
    id: 'dsc0735',
    comparisonFile: 'preset-comparison-dsc0735.webp',
    sourceFile: 'preset-source-dsc0735.webp',
    alt: '夕景と電線に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '夕景と電線を写した加工前の元画像',
    caption: '夕空のグラデーションと電線で、色の変化、細線の崩れ、CRT表示を比較できます。',
  },
] as const

const termsSearchEntries = [
  { id: 'terms-license', title: 'ライセンス', description: '1人につき1ライセンス。本人が所有または管理する複数のWindows PCで使用できます。', keywords: 'ライセンス 1人 複数 pc windows' },
  { id: 'terms-organization', title: '法人・サークルでの利用', description: '法人、団体、サークルでは、実際に使用する人数と同数のライセンスが必要です。', keywords: '法人 団体 サークル 組織 複数人 共用 担当者' },
  { id: 'terms-works', title: '完成映像とプロジェクトファイル', description: '完成映像は商用・非商用を問わず利用でき、プラグイン本体を含まないプロジェクトファイルも納品できます。', keywords: '商用 非商用 映像 静止画 aep プロジェクト 納品 販売 クレジット' },
  { id: 'terms-prohibited', title: '禁止事項', description: 'プラグイン本体、付属データ、ライセンスの再配布や共用は禁止です。', keywords: '禁止 再配布 販売 貸与 譲渡 共用 解析 改変' },
  { id: 'terms-environment', title: '動作環境', description: '対応環境、Adobe製品、Windows、GPUドライバーなどの変更に関する条件です。', keywords: '動作環境 after effects adobe windows gpu 互換性' },
  { id: 'terms-refunds', title: '返品・交換・返金', description: 'ダウンロード商品の返品、交換、返金と、配布ファイルに問題がある場合の対応です。', keywords: '返品 交換 返金 重複決済 破損 ダウンロード booth' },
  { id: 'terms-liability', title: '保証と責任', description: '不具合、目的適合性、出力確認、損害賠償の範囲に関する条件です。', keywords: '保証 責任 損害 賠償 不具合 免責 出力 確認' },
] as const

const comparisonRevealStyle = computed(() => {
  const position = Math.min(100, Math.max(0, comparisonPosition.value))
  if (position <= 0) {
    const mask = 'linear-gradient(to right, transparent, transparent)'
    return { maskImage: mask, WebkitMaskImage: mask }
  }
  if (position >= 100) return { maskImage: 'none', WebkitMaskImage: 'none' }

  const mask = `linear-gradient(to right, #000 0, #000 calc(${position}% - 5px), transparent calc(${position}% + 5px), transparent 100%)`
  return { maskImage: mask, WebkitMaskImage: mask }
})

function comparisonVideos() {
  return [comparisonSourceVideo.value, comparisonProcessedVideo.value].filter((video): video is HTMLVideoElement => Boolean(video))
}

function stopComparisonSync() {
  if (comparisonSyncFrame !== undefined) {
    window.cancelAnimationFrame(comparisonSyncFrame)
    comparisonSyncFrame = undefined
  }
}

function syncComparisonFrame() {
  const source = comparisonSourceVideo.value
  const processed = comparisonProcessedVideo.value

  if (!source || !processed || source.paused || processed.paused) {
    comparisonPlaying.value = false
    stopComparisonSync()
    return
  }

  if (source.readyState >= HTMLMediaElement.HAVE_METADATA && processed.readyState >= HTMLMediaElement.HAVE_METADATA) {
    const period = Math.min(source.duration, processed.duration)
    const rawDrift = processed.currentTime - source.currentTime
    const circularDrift = Number.isFinite(period) && period > 0
      ? ((rawDrift + period / 2) % period + period) % period - period / 2
      : rawDrift
    const now = performance.now()

    // 2フレームを超えた場合だけ補正する。loop境界を通常の5秒差としてseekし続けない。
    if (Math.abs(circularDrift) > 2 / 24 && !processed.seeking && now - comparisonLastHardSync > 250) {
      comparisonLastHardSync = now
      processed.currentTime = source.currentTime
    }
  }

  comparisonPlaying.value = true
  comparisonSyncFrame = window.requestAnimationFrame(syncComparisonFrame)
}

function startComparisonSync() {
  stopComparisonSync()
  comparisonSyncFrame = window.requestAnimationFrame(syncComparisonFrame)
}

async function playComparison() {
  const source = comparisonSourceVideo.value
  const processed = comparisonProcessedVideo.value
  if (!source || !processed) return

  comparisonPlaybackSyncing = true
  processed.currentTime = source.currentTime
  const results = await Promise.allSettled([source.play(), processed.play()])
  const failed = results.some((result) => result.status === 'rejected')

  if (failed) {
    source.pause()
    processed.pause()
  }

  comparisonPlaybackSyncing = false
  comparisonPlaying.value = !failed && !source.paused && !processed.paused
  if (comparisonPlaying.value) startComparisonSync()
}

function pauseComparison() {
  comparisonPlaybackSyncing = true
  for (const video of comparisonVideos()) video.pause()
  if (comparisonSourceVideo.value && comparisonProcessedVideo.value) {
    comparisonProcessedVideo.value.currentTime = comparisonSourceVideo.value.currentTime
  }
  comparisonPlaybackSyncing = false
  comparisonPlaying.value = false
  stopComparisonSync()
}

function toggleComparisonPlayback() {
  if (comparisonPlaying.value) pauseComparison()
  else void playComparison()
}

function waitForComparisonMetadata(video: HTMLVideoElement) {
  return new Promise<void>((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', finish)
      video.removeEventListener('error', finish)
      resolve()
    }

    const timeout = window.setTimeout(finish, 8000)
    video.addEventListener('loadedmetadata', finish, { once: true })
    video.addEventListener('error', finish, { once: true })
  })
}

async function refreshComparisonVideos() {
  const source = comparisonSourceVideo.value
  const processed = comparisonProcessedVideo.value
  if (!source || !processed || comparisonRefreshing.value) return

  const resumeAfterRefresh = comparisonPlaying.value
  const resumeTime = Number.isFinite(source.currentTime) ? source.currentTime : 0

  comparisonRefreshing.value = true
  pauseComparison()
  comparisonPlaybackSyncing = true

  const sourceReady = waitForComparisonMetadata(source)
  const processedReady = waitForComparisonMetadata(processed)
  source.load()
  processed.load()
  await Promise.all([sourceReady, processedReady])

  const availableDuration = Math.min(source.duration, processed.duration)
  const restoredTime = Number.isFinite(availableDuration) && availableDuration > 0
    ? Math.min(resumeTime, Math.max(0, availableDuration - 1 / 24))
    : 0
  source.currentTime = restoredTime
  processed.currentTime = restoredTime

  comparisonPlaybackSyncing = false
  comparisonRefreshing.value = false
  if (resumeAfterRefresh) await playComparison()
}

function onComparisonPlay(event: Event) {
  if (comparisonPlaybackSyncing) return

  const leader = event.currentTarget as HTMLVideoElement
  const follower = leader === comparisonSourceVideo.value ? comparisonProcessedVideo.value : comparisonSourceVideo.value
  if (!follower) return

  comparisonPlaybackSyncing = true
  follower.currentTime = leader.currentTime
  void follower.play().catch(() => {
    leader.pause()
    follower.pause()
  }).finally(() => {
    comparisonPlaybackSyncing = false
    comparisonPlaying.value = !leader.paused && !follower.paused
    if (comparisonPlaying.value) startComparisonSync()
  })
}

function onComparisonPause() {
  if (comparisonPlaybackSyncing) return
  pauseComparison()
}

function maybeAutoplayComparison() {
  if (prefersReducedMotion.value || comparisonAutoplayRequested || comparisonRefreshing.value) return
  const videos = comparisonVideos()
  if (videos.length !== 2 || videos.some((video) => video.readyState < HTMLMediaElement.HAVE_METADATA)) return

  comparisonAutoplayRequested = true
  void playComparison()
}

function onReducedMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches
  if (event.matches) {
    pauseComparison()
  } else {
    comparisonAutoplayRequested = false
    maybeAutoplayComparison()
  }
}

function handleScreenshotClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return

  const link = target.closest<HTMLAnchorElement>('.doc-shot a')
  if (!link) return
  const image = link?.querySelector<HTMLImageElement>('img')
  const textLightbox = link.dataset.lightbox === 'image'
  if (!image && !textLightbox) return

  const figure = link.closest('figure')
  const caption = figure?.querySelector<HTMLElement>('[data-caption-text]')
    ?? figure?.querySelector<HTMLElement>('figcaption')

  event.preventDefault()
  lightboxTrigger = link
  lightboxSrc.value = link.href
  lightboxAlt.value = image?.alt ?? link.dataset.lightboxAlt ?? ''
  lightboxCaption.value = link.dataset.lightboxCaption ?? caption?.textContent?.trim() ?? ''
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

const activePage = computed(() => {
  const requested = typeof route.params.page === 'string' ? route.params.page : 'overview'
  return allVhsNavItems.some((item) => item.id === requested) ? requested : 'overview'
})

const currentPage = computed(() =>
  allVhsNavItems.find((item) => item.id === activePage.value)!
)

const activeParameterGroups = computed(() =>
  vhsParameterGroups.filter((group) => group.page === activePage.value)
)

const activeParameterEyebrow = computed(() => activeParameterGroups.value[0]?.eyebrow ?? 'PARAMETERS')

const searchResults = computed<SearchResult[]>(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('ja-JP')
  if (!query) return []

  const pageResults = allVhsNavItems
    .filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLocaleLowerCase('ja-JP').includes(query))
    .map((item) => ({
      page: item.id,
      eyebrow: 'PAGE',
      title: item.label,
      description: item.description,
    }))

  const glossaryResults = allVhsGlossaryTerms
    .filter((term) => `${term.term} ${term.termEn} ${term.description} ${term.keywords}`.toLocaleLowerCase('ja-JP').includes(query))
    .map((term) => ({
      page: 'glossary',
      hash: `#${term.id}`,
      eyebrow: '用語集',
      title: term.term,
      description: term.description,
    }))

  const parameterResults = vhsParameterGroups.flatMap((group) =>
    group.parameters
      .filter((parameter) =>
        `${parameter.label} ${parameter.labelEn} ${parameter.role} ${parameter.related ?? ''} ${parameter.guide ?? ''} ${parameter.note ?? ''}`
          .toLocaleLowerCase('ja-JP')
          .includes(query)
      )
      .map((parameter) => ({
        page: group.page,
        hash: `#${parameter.id}`,
        eyebrow: group.label,
        title: parameter.label,
        description: parameter.role,
      }))
  )

  const presetResults = vhsPresetSummaries
    .filter((preset) => `${preset.name} ${preset.appearance} ${preset.use}`.toLocaleLowerCase('ja-JP').includes(query))
    .map((preset) => ({
      page: 'quick-start',
      hash: `#preset-${preset.id}`,
      eyebrow: 'プリセット',
      title: preset.name,
      description: preset.appearance,
    }))

  const issueResults = vhsIssues
    .filter((issue) => `${issue.question} ${issue.answer} ${issue.keywords}`.toLocaleLowerCase('ja-JP').includes(query))
    .map((issue) => ({ page: 'troubleshooting', hash: `#${issue.id}`, eyebrow: 'TROUBLESHOOTING', title: issue.question, description: issue.answer }))

  const termsResults = termsSearchEntries
    .filter((entry) => `${entry.title} ${entry.description} ${entry.keywords}`.toLocaleLowerCase('ja-JP').includes(query))
    .map((entry) => ({ page: 'terms', hash: `#${entry.id}`, eyebrow: '利用規約', title: entry.title, description: entry.description }))

  return [...pageResults, ...glossaryResults, ...parameterResults, ...presetResults, ...issueResults, ...termsResults].slice(0, 12)
})

const pageIndex = computed(() => allVhsNavItems.findIndex((item) => item.id === activePage.value))
const previousPage = computed(() => pageIndex.value > 0 ? allVhsNavItems[pageIndex.value - 1] : undefined)
const nextPage = computed(() => pageIndex.value < allVhsNavItems.length - 1 ? allVhsNavItems[pageIndex.value + 1] : undefined)

function glossaryGroupId(index: number) {
  return `glossary-group-${index + 1}`
}

const currentToc = computed<PageTocItem[]>(() => {
  if (activePage.value === 'overview') {
    return [
      { id: 'positioning', label: '概要' },
      { id: 'support', label: '対応状況' },
      { id: 'pipeline', label: '効果の重なり' },
    ]
  }

  if (activePage.value === 'install') {
    return [
      { id: 'manual-install', label: '手動インストール' },
      { id: 'update', label: '更新' },
      { id: 'uninstall', label: '削除' },
    ]
  }

  if (activePage.value === 'quick-start') {
    return [
      { id: 'built-in-presets', label: 'プリセット一覧' },
      { id: 'preset-samples', label: '画像で比較' },
    ]
  }

  if (activePage.value === 'glossary') {
    return vhsGlossaryGroups.map((group, index) => ({ id: glossaryGroupId(index), label: group.label }))
  }

  if (activePage.value === 'parameters') {
    return vhsParameterGroups.map((group) => ({ id: `table-${group.id}`, label: group.label }))
  }

  if (activePage.value === 'troubleshooting') {
    return [
      { id: 'known-issues', label: '想定される問題' },
      ...vhsIssues.map((issue) => ({ id: issue.id, label: issue.question, nested: true })),
      { id: 'crash-recovery', label: 'クラッシュした場合' },
    ]
  }

  if (activePage.value === 'terms') {
    return [
      { id: 'terms-scope', label: '適用' },
      { id: 'terms-license', label: 'ライセンス' },
      { id: 'terms-organization', label: '法人・サークルでの利用' },
      { id: 'terms-works', label: '完成映像とプロジェクト' },
      { id: 'terms-software-rights', label: '本ソフトの権利' },
      { id: 'terms-prohibited', label: '禁止事項' },
      { id: 'terms-environment', label: '動作環境' },
      { id: 'terms-updates', label: '更新とサポート' },
      { id: 'terms-refunds', label: '返品・交換・返金' },
      { id: 'terms-liability', label: '保証と責任' },
      { id: 'terms-termination', label: '利用停止' },
      { id: 'terms-changes', label: '規約の変更' },
      { id: 'terms-law', label: '準拠法' },
      { id: 'terms-contact', label: '提供者・お問い合わせ' },
    ]
  }

  const items: PageTocItem[] = []
  if (activePage.value === 'preview') items.push({ id: 'quality-overview', label: '軽量・高精度' })
  for (const group of activeParameterGroups.value) {
    items.push({ id: group.id, label: group.label })
    items.push(...group.parameters.map((parameter) => ({ id: parameter.id, label: parameter.label, nested: true })))
  }
  return items
})

function pagePath(id: string) {
  return id === 'overview' ? '/vhs-simulator' : `/vhs-simulator/${id}`
}

function resultPath(result: SearchResult) {
  return `${pagePath(result.page)}${result.hash ?? ''}`
}

function jumpToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeTransientUi() {
  mobileNavOpen.value = false
  searchQuery.value = ''
}

function toggleMobileNavigation() {
  const nextState = !mobileNavOpen.value
  mobileNavOpen.value = nextState
  if (nextState) nextTick(() => sidebarNav.value?.querySelector<HTMLElement>('a')?.focus())
}

function closeMobileNavigation() {
  mobileNavOpen.value = false
  nextTick(() => menuButton.value?.focus())
}

function focusSearch() {
  if (isMobileLayout.value) mobileNavOpen.value = true
  nextTick(() => searchInput.value?.focus())
}

function syncViewport() {
  isMobileLayout.value = window.matchMedia('(max-width: 820px)').matches
  if (!isMobileLayout.value) mobileNavOpen.value = false
}

async function revealRouteTarget() {
  if (!route.hash) return
  await nextTick()
  const target = document.querySelector(route.hash)
  if (target instanceof HTMLDetailsElement) target.open = true
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && lightboxSrc.value) {
    event.preventDefault()
    closeLightbox()
    return
  }

  const target = event.target as HTMLElement | null
  const isEditing = target?.matches('input, textarea, select, [contenteditable="true"]')

  if (event.key === '/' && !isEditing) {
    event.preventDefault()
    focusSearch()
    return
  }

  if (event.key === 'Escape') {
    const returnFocus = mobileNavOpen.value
    searchQuery.value = ''
    mobileNavOpen.value = false
    if (returnFocus) nextTick(() => menuButton.value?.focus())
  }
}

watch(activePage, (page) => {
  document.title = `${currentPage.value.label} | ACM VHS Simulator`
  if (!route.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  if (page === 'overview') {
    comparisonAutoplayRequested = false
    nextTick(maybeAutoplayComparison)
  } else {
    pauseComparison()
  }
}, { immediate: true, flush: 'sync' })

watch(() => route.fullPath, () => {
  closeTransientUi()
  revealRouteTarget()
})

watch(mobileNavOpen, (open) => {
  document.documentElement.classList.toggle('vhs-nav-open', open && isMobileLayout.value)
})

onMounted(() => {
  document.documentElement.classList.add('vhs-docs-open')
  document.title = `${currentPage.value.label} | ACM VHS Simulator`
  syncViewport()
  revealRouteTarget()
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = reducedMotionQuery.matches
  reducedMotionQuery.addEventListener('change', onReducedMotionChange)
  nextTick(maybeAutoplayComparison)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', syncViewport)
})

onUnmounted(() => {
  document.documentElement.classList.remove('vhs-docs-open')
  document.documentElement.classList.remove('vhs-nav-open')
  pauseComparison()
  document.body.style.overflow = previousBodyOverflow
  reducedMotionQuery?.removeEventListener('change', onReducedMotionChange)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', syncViewport)
})
</script>

<template>
  <div class="vhs-docs-shell">
    <header class="docs-header">
      <RouterLink class="brand" :to="pagePath('overview')" aria-label="ACM VHS Simulator リファレンストップへ" @click="closeTransientUi">
        <span class="brand-copy">
          <strong>ACM VHS Simulator</strong>
        </span>
        <span class="docs-label">Documentation</span>
      </RouterLink>

      <div class="header-tools">
        <button ref="menuButton" class="mobile-menu" type="button" :aria-expanded="mobileNavOpen" aria-controls="vhs-docs-sidebar" :aria-label="mobileNavOpen ? 'メニューを閉じる' : 'メニューを開く'" @click="toggleMobileNavigation">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <div class="docs-layout">
      <button v-if="mobileNavOpen && isMobileLayout" class="nav-backdrop" type="button" aria-label="メニューを閉じる" @click="closeMobileNavigation"></button>
      <aside id="vhs-docs-sidebar" :class="['docs-sidebar', { open: mobileNavOpen }]" :aria-hidden="isMobileLayout && !mobileNavOpen ? 'true' : undefined" :inert="isMobileLayout && !mobileNavOpen ? true : undefined">
        <label class="sidebar-search">
          <span aria-hidden="true">⌕</span>
          <input ref="searchInput" v-model="searchQuery" type="search" placeholder="ドキュメントを検索" aria-label="ドキュメントを検索" aria-controls="vhs-search-results" />
          <kbd>/</kbd>
        </label>

        <div v-if="searchQuery" id="vhs-search-results" class="sidebar-search-results" role="region" aria-label="検索結果">
          <p>検索結果</p>
          <RouterLink v-for="result in searchResults" :key="`${result.page}-${result.hash ?? result.title}`" :to="resultPath(result)" @click="closeTransientUi">
            <span>{{ result.eyebrow }}</span>
            <strong>{{ result.title }}</strong>
            <small>{{ result.description }}</small>
          </RouterLink>
          <span v-if="searchResults.length === 0" class="search-empty">該当する項目がありません。</span>
        </div>

        <nav v-else ref="sidebarNav" aria-label="ACM VHS Simulator ドキュメント">
          <section v-for="group in vhsNavGroups" :key="group.label" class="nav-group">
            <h2>{{ group.label }}</h2>
            <RouterLink
              v-for="item in group.items"
              :key="item.id"
              :to="pagePath(item.id)"
              :class="{ active: activePage === item.id }"
              :aria-current="activePage === item.id ? 'page' : undefined"
              @click="closeTransientUi"
            >
              <span>{{ item.label }}</span>
              <small>{{ item.description }}</small>
            </RouterLink>
          </section>
        </nav>

        <div class="sidebar-version">
          <span>対応バージョン</span>
          <strong>Ver.{{ vhsCurrentVersion }}</strong>
        </div>
      </aside>

      <main class="docs-content" @click="handleScreenshotClick">
        <header class="page-heading">
          <div class="breadcrumbs"><span>ドキュメント</span><i>/</i><span>{{ activePage === 'overview' ? 'はじめに' : currentPage.label }}</span></div>
          <h1>{{ activePage === 'overview' ? 'ACM VHS Simulator' : currentPage.label }}</h1>
        </header>

        <template v-if="activePage === 'overview'">
          <section class="hero-section">
            <div class="hero-copy">
              <p class="hero-lead">家庭用ビデオカメラ、VHSテープ、ブラウン管テレビの質感を再現するAfter Effectsプラグインです。</p>
              <div class="hero-actions">
                <RouterLink :to="pagePath('quick-start')">内蔵プリセット</RouterLink>
                <RouterLink :to="pagePath('parameters')" class="secondary">全項目を見る</RouterLink>
              </div>
              <figure class="doc-shot hero-shot video-comparison-figure">
                <div class="video-comparison" role="group" aria-label="元映像とカスタム設定の動画比較">
                  <video
                    ref="comparisonProcessedVideo"
                    class="video-comparison__video"
                    :src="`/videos/vhs-simulator/overview-custom.mp4?v=${comparisonVideoVersion}`"
                    poster="/images/vhs-simulator/screenshots/overview-video-poster.webp"
                    preload="metadata"
                    muted
                    loop
                    playsinline
                    aria-label="カスタム設定"
                    @loadedmetadata="maybeAutoplayComparison"
                    @play="onComparisonPlay"
                    @pause="onComparisonPause"
                  ></video>
                  <div class="video-comparison__source" :style="comparisonRevealStyle">
                    <video
                      ref="comparisonSourceVideo"
                      class="video-comparison__video"
                      :src="`/videos/vhs-simulator/overview-source.mp4?v=${comparisonVideoVersion}`"
                      poster="/images/vhs-simulator/screenshots/overview-video-poster.webp"
                      preload="metadata"
                      muted
                      loop
                      playsinline
                      aria-label="元映像"
                      @loadedmetadata="maybeAutoplayComparison"
                      @play="onComparisonPlay"
                      @pause="onComparisonPause"
                    ></video>
                  </div>
                  <span class="video-comparison__divider" :style="{ left: `${comparisonPosition}%` }" aria-hidden="true">
                    <i>↔</i>
                  </span>
                  <input
                    v-model.number="comparisonPosition"
                    class="video-comparison__range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    aria-label="元映像とカスタム設定の比較位置"
                    :aria-valuetext="`元映像 ${comparisonPosition}%、カスタム設定 ${100 - comparisonPosition}%`"
                  />
                </div>
                <div class="video-comparison__toolbar">
                  <span>スライダーを左右に動かして比較</span>
                  <div class="video-comparison__actions">
                    <button type="button" :aria-label="comparisonPlaying ? '比較動画を一時停止' : '比較動画を再生'" :disabled="comparisonRefreshing" @click="toggleComparisonPlayback">
                      {{ comparisonPlaying ? '一時停止' : '再生' }}
                    </button>
                    <button type="button" aria-label="比較動画を再読み込み" :disabled="comparisonRefreshing" @click="refreshComparisonVideos">
                      {{ comparisonRefreshing ? '読み込み中' : '再読み込み' }}
                    </button>
                  </div>
                </div>
                <figcaption>左：元映像／右：カスタム設定。中央のハンドルを動かして、輪郭、色にじみ、テープ摩耗とCRT表示の変化を比較できます。</figcaption>
                <RouterLink class="video-comparison__more" :to="`${pagePath('quick-start')}#preset-samples`">その他のサンプル画像を見る →</RouterLink>
              </figure>
            </div>
          </section>

          <section id="positioning" class="doc-section">
          <div class="section-heading"><span>01</span><div><p>POSITIONING</p><h2>概要</h2></div></div>
            <p>ACM VHS Simulatorは、カメラ撮像、テープ記録・再生、CRT表示を順に処理し、一般的なNTSC-J VHSの映像を作ります。特定のカメラやデッキの個体差は再現しません。</p>
            <div class="callout info"><strong>カメラ・VHS・CRTは個別設定</strong><p>カメラ撮像、VHS信号、CRT表示はそれぞれ個別に有効／無効を設定できます。軽量／高精度とは別の項目です。</p></div>
          </section>

          <section id="support" class="doc-section">
            <div class="section-heading"><span>02</span><div><p>SUPPORT</p><h2>対応状況</h2></div></div>
            <div class="status-row"><span class="status ok">AE 2025 / 2026 対応・動作確認済み</span><span class="status">Windows x64</span></div>
            <div class="callout info"><strong>macOS版について</strong><p>macOS版は現在提供していません。署名・公証を含む開発・配布環境の維持費を、現在の販売規模では賄いにくいためです。利用希望が増えた場合は対応を検討します。</p></div>
          </section>

          <section id="pipeline" class="doc-section">
            <div class="section-heading"><span>03</span><div><p>VISUAL BREAKDOWN</p><h2>効果の重なり</h2></div></div>
            <p>カメラ撮像、VHS信号、CRT表示を組み合わせて使います。下の画像では、変化が分かるように各効果を順に有効にしています。</p>
            <figure class="doc-shot">
              <a href="/images/vhs-simulator/screenshots/pipeline-camera-vhs-crt.webp?v=20260825-ja-flow" target="_blank" rel="noopener" aria-label="カメラ撮像、VHS記録・再生、CRT表示の処理段階比較を原寸で開く">
                <img src="/images/vhs-simulator/screenshots/pipeline-camera-vhs-crt.webp?v=20260825-ja-flow" alt="元画像、カメラ撮像後、VHS記録・再生後、CRT表示後の4段階比較" width="1280" height="720" loading="lazy" />
              </a>
              <figcaption>カメラ撮像、VHS記録・再生、CRT表示を追加したときの比較。細線、色境界、画面下端でそれぞれの違いを確認できます。</figcaption>
            </figure>
          </section>

        </template>

        <template v-else-if="activePage === 'install'">
          <section class="page-intro"><p>INSTALLATION</p><span>After Effectsを終了し、配布フォルダーごと配置します。</span></section>
          <section id="manual-install" class="doc-section">
            <h2>手動インストール</h2>
            <ol class="steps">
              <li><b>1</b><div><strong>Adobeアプリを終了</strong><p>After EffectsとDynamic Linkを利用しているAdobeアプリを終了します。</p></div></li>
              <li><b>2</b><div><strong>フォルダー全体をコピー</strong><p>AEXだけを取り出さず、配布フォルダーごとAdobe共通MediaCoreのプラグインフォルダーへ配置します。</p></div></li>
              <li><b>3</b><div><strong>After Effectsで確認</strong><p>エフェクト＆プリセットから「ACM VHS Simulator」を検索します。カテゴリは「ACM」です。</p></div></li>
            </ol>
            <code class="path-block">C:\Program Files\Adobe\Common\Plug-ins\7.0\MediaCore\</code>
          </section>
          <section id="update" class="doc-section"><h2>更新</h2><p>After Effectsを終了してから、ACM VHS Simulatorフォルダー全体を新しい配布物で置き換えます。旧版が残っている場合は、新しい配置を確認した後に削除します。</p></section>
          <section id="uninstall" class="doc-section"><h2>削除</h2><p>After Effectsを終了し、インストールしたACM VHS Simulatorフォルダーを削除します。既存プロジェクト内にエフェクトが残っている場合、次回オープン時に欠落エフェクトとして表示されます。</p></section>
        </template>

        <template v-else-if="activePage === 'quick-start'">
          <section class="page-intro"><p>PRESETS</p><span>用意されている6種類の仕上がり。</span></section>
          <section id="built-in-presets" class="doc-section">
            <h2>プリセット一覧</h2>
            <p>仕上がりに近いものを選び、必要な項目だけ調整します。</p>
            <div id="preset" class="preset-grid">
              <article v-for="preset in vhsPresetSummaries" :id="`preset-${preset.id}`" :key="preset.id">
                <h3>{{ preset.name }}</h3>
                <p>{{ preset.appearance }}</p>
                <span class="preset-use"><b>向いている映像</b>{{ preset.use }}</span>
              </article>
            </div>
            <div class="callout info"><strong>適用後も調整できます</strong><p>プリセットを選ぶと各項目へ値が入ります。適用後はすべて個別に変更でき、表示中のプリセット名自体はレンダー結果に影響しません。</p></div>
            <h2 id="preset-samples" class="preset-samples-heading">画像で比較</h2>
            <p>同じ写真へ6種類の内蔵プリセットを適用しています。</p>
            <figure v-for="sample in vhsPresetSamples" :key="sample.id" class="doc-shot doc-shot--presets">
              <a :href="`/images/vhs-simulator/screenshots/${sample.comparisonFile}`" target="_blank" rel="noopener" :aria-label="`${sample.alt}を原寸で開く`">
                <img :src="`/images/vhs-simulator/screenshots/${sample.comparisonFile}`" :alt="sample.alt" width="1920" height="720" loading="lazy" />
              </a>
              <figcaption class="preset-comparison-caption">
                <span data-caption-text>{{ sample.caption }}</span>
                <a class="preset-source-link" :href="`/images/vhs-simulator/screenshots/${sample.sourceFile}`" target="_blank" rel="noopener" data-lightbox="image" :data-lightbox-alt="sample.sourceAlt" data-lightbox-caption="加工前の元画像">元画像を見る</a>
              </figcaption>
            </figure>
          </section>
        </template>

        <template v-else-if="activePage === 'glossary'">
          <section class="page-intro"><p>GLOSSARY</p><span>CRT、TVL、RFなどの用語。</span></section>
          <section v-for="(group, groupIndex) in vhsGlossaryGroups" :id="glossaryGroupId(groupIndex)" :key="group.label" class="doc-section glossary-section">
            <h2>{{ group.label }}</h2>
            <div class="glossary-list">
              <article v-for="term in group.terms" :id="term.id" :key="term.id" class="glossary-entry">
                <div><h3>{{ term.term }}</h3><p>{{ term.termEn }}</p></div>
                <p>{{ term.description }}</p>
              </article>
            </div>
          </section>
        </template>

        <template v-else-if="activePage === 'parameters'">
          <section class="page-intro"><p>PARAMETER INDEX</p><span>各項目の範囲と初期値。</span></section>
          <section v-for="group in vhsParameterGroups" :id="`table-${group.id}`" :key="group.id" class="doc-section table-section">
            <div class="table-title"><h2>{{ group.label }}</h2><RouterLink :to="`${pagePath(group.page)}#${group.id}`">詳細を見る →</RouterLink></div>
            <div class="parameter-table">
              <div class="table-head"><span>項目</span><span>範囲／初期値</span></div>
              <div v-for="parameter in group.parameters" :key="parameter.id" class="table-row">
                <span><strong>{{ parameter.label }}</strong><small>{{ parameter.labelEn }}</small></span>
                <span data-label="範囲／初期値"><span class="cell-value">{{ parameter.range }}<small>初期値 {{ parameter.defaultValue }}</small></span></span>
              </div>
            </div>
          </section>
        </template>

        <template v-else-if="activeParameterGroups.length">
          <section class="page-intro"><p>{{ activeParameterEyebrow }}</p><span>{{ currentPage.description }}</span></section>
          <section v-if="activePage === 'preview'" id="quality-overview" class="doc-section">
            <div class="quality-comparison">
              <article><span>軽量</span><h2>軽量プレビュー</h2><p>再生負荷を抑えたい編集作業向け。一部の細かな表現を簡略化します。</p></article>
              <article><span>高精度</span><h2>高精度処理</h2><p>細かなノイズや信号の崩れまで表示します。質感の確認と最終出力向けです。</p></article>
            </div>
            <div class="callout info"><strong>Render Queueは常に高精度</strong><p>Render Queueでは、プレビュー品質の設定に関係なく高精度で出力されます。</p></div>
          </section>
          <section v-for="group in activeParameterGroups" :id="group.id" :key="group.id" class="doc-section parameter-group">
            <div class="section-heading"><span>{{ String(vhsParameterGroups.indexOf(group) + 1).padStart(2, '0') }}</span><div><p>{{ group.eyebrow }}</p><h2>{{ group.label }}</h2></div></div>
            <p class="group-description">{{ group.description }}</p>
            <p v-if="group.condition" class="group-condition"><strong>有効になる条件</strong><span>{{ group.condition }}</span></p>
            <div class="parameter-cards">
              <article v-for="parameter in group.parameters" :id="parameter.id" :key="parameter.id" class="parameter-card">
                <div class="parameter-identity">
                  <h3>{{ parameter.label }}</h3>
                  <p>{{ parameter.labelEn }}</p>
                  <div v-if="parameter.scopeLabel || parameter.mode === '軽量時'" class="parameter-flags">
                    <span v-if="parameter.scopeLabel" class="scope-label">{{ parameter.scopeLabel }}</span>
                    <span v-if="parameter.mode === '軽量時'" class="mode">軽量時のみ</span>
                  </div>
                </div>
                <div class="parameter-content">
                    <p class="parameter-role">{{ parameter.role }}<template v-if="parameter.related"> {{ parameter.related }}</template><template v-if="parameter.guide"> {{ parameter.guide }}</template></p>
                  <div
                    class="parameter-range"
                    role="img"
                    :aria-label="`範囲 ${parameter.range}、初期値 ${parameterRangeVisual(parameter).initialLabel}`"
                  >
                    <div class="range-summary"><span>{{ parameterRangeVisual(parameter).kind === 'meter' ? '範囲' : '選択肢' }}</span></div>
                    <template v-if="parameterRangeVisual(parameter).kind === 'meter'">
                      <div class="range-meter-wrap" aria-hidden="true">
                        <strong
                          class="range-initial"
                          :class="`align-${meterInitialAlignment(parameterRangeVisual(parameter).position)}`"
                          :style="{ left: `${parameterRangeVisual(parameter).position}%` }"
                        >初期値 {{ parameterRangeVisual(parameter).initialLabel }}</strong>
                        <div class="range-meter">
                          <span class="range-fill" :style="{ width: `${parameterRangeVisual(parameter).position}%` }"></span>
                        </div>
                        <i class="range-initial-line" :style="{ left: `${parameterRangeVisual(parameter).position}%` }"></i>
                      </div>
                      <div class="range-labels">
                        <span v-for="label in parameterRangeVisual(parameter).labels" :key="label">{{ label }}</span>
                      </div>
                    </template>
                    <div v-else class="range-choice-line">
                      <p class="range-choices">{{ parameterRangeVisual(parameter).labels.join('・') }}</p>
                      <strong>初期値 {{ parameterRangeVisual(parameter).initialLabel }}</strong>
                    </div>
                  </div>
                    <p v-if="parameter.note" class="parameter-note"><strong>補足</strong><span>{{ parameter.note }}</span></p>
                </div>
              </article>
            </div>
          </section>
        </template>

        <template v-else-if="activePage === 'troubleshooting'">
          <section class="page-intro"><p>DIAGNOSIS</p><span>症状ごとの確認事項と対処方法。</span></section>
          <section id="known-issues" class="doc-section issue-list"><h2 class="issue-heading">想定される問題</h2><details v-for="issue in vhsIssues" :id="issue.id" :key="issue.id"><summary>{{ issue.question }}</summary><p>{{ issue.answer }}</p></details></section>
          <section id="crash-recovery" class="doc-section"><div class="callout warning"><strong>クラッシュした場合</strong><p>作業中のプロジェクトを別名で保存し、同じフレームをCPUで確認します。直らない場合は配布フォルダーを入れ直してください。問い合わせ時はAEのバージョン、解像度、GPU名、問題が起きるフレームを控えてください。</p></div></section>
        </template>

        <template v-else-if="activePage === 'terms'">
          <section id="terms" class="doc-section terms-section">
            <p>
              この利用規約は、ACMが提供するAfter Effectsプラグイン「ACM VHS Simulator」の利用条件を定めるものです。
              BOOTH、そのほか提供者が認めた方法で取得した本ソフトに適用されます。
            </p>
            <p class="terms-meta">
              <strong>制定日:</strong> <time datetime="2026-08-26">2026年8月26日</time><br />
              <strong>提供者:</strong> ACM
            </p>

            <h3 id="terms-scope">第1条　適用</h3>
            <p>
              本規約は、ACM（以下「提供者」）が提供するWindows向けAfter Effectsプラグイン「ACM VHS Simulator」
              （プラグイン本体、内蔵プリセット、付属データ、ドキュメントおよび更新版を含み、以下「本ソフト」）の利用条件を定めるものです。
            </p>
            <p>
              利用者は、本ソフトを購入または取得し、インストールもしくは使用した時点で、本規約に同意したものとします。
            </p>

            <h3 id="terms-license">第2条　ライセンス</h3>
            <p>本ソフトは、実際に使用する1人につき1ライセンスを必要とします。</p>
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
              組織が購入したライセンスも、最初に割り当てた利用者本人に限って有効です。
              退職、担当者の交代、そのほかの理由を問わず、別の利用者への変更、引き継ぎ、再割り当てはできません。
              新しい利用者が使用する場合は、その利用者のための新しいライセンスが必要です。
            </p>

            <h3 id="terms-works">第4条　完成映像とプロジェクトファイル</h3>
            <p>
              本ソフトを使用して作成した映像、静止画、そのほかの作品に関する権利は、利用者または正当な権利者に帰属します。
            </p>
            <p>利用者は、本ソフトを使用した作品を、営利・非営利を問わず自由に公開、上映、放送、配信、納品または販売できます。</p>
            <p>作品へのクレジット表記や、提供者への利用報告は必要ありません。</p>
            <p>
              本ソフトのプラグイン本体や付属データを含めない場合、利用者は、本ソフトの設定値を含むAfter Effectsプロジェクトファイルを第三者へ納品、共有または販売できます。
              受領者が自身の環境で本ソフトを使用して編集またはレンダーする場合、受領者本人のライセンスが必要です。
            </p>

            <h3 id="terms-software-rights">第5条　本ソフトの権利</h3>
            <p>
              本ソフト、付属データ、画面表示およびドキュメントに関する著作権その他の権利は、提供者または正当な権利者に帰属します。
              本ソフトの購入または取得によって、これらの権利が利用者へ譲渡されるものではありません。
            </p>

            <h3 id="terms-prohibited">第6条　禁止事項</h3>
            <p>利用者は、次の行為を行ってはいけません。</p>
            <ul>
              <li>本ソフト、配布フォルダー内のファイルまたは付属データを第三者へ再配布、販売、貸与または譲渡する行為</li>
              <li>1つのライセンスを複数人で共用する行為</li>
              <li>第三者が自由にダウンロードまたは使用できる場所へ本ソフトを置く行為</li>
              <li>本ソフトをAfter Effectsプロジェクト、テンプレート、素材集、そのほかの配布物へ同梱する行為</li>
              <li>購入やライセンスに関する制限を回避する行為</li>
              <li>不正利用や再配布を目的として本ソフトを解析、改変する行為</li>
              <li>本ソフトの著作権表示や識別情報を削除する行為</li>
              <li>法令または公序良俗に反する目的で本ソフトを使用する行為</li>
              <li>提供者または第三者の権利や利益を侵害する行為</li>
            </ul>

            <h3 id="terms-environment">第7条　動作環境</h3>
            <p>本ソフトは、提供者がドキュメントまたは商品ページで案内する対応環境で使用するものとします。</p>
            <p>
              After Effects、Windows、GPUドライバー、そのほかの外部環境の変更により、一部または全部の機能が使用できなくなる場合があります。
              提供者は、案内していない環境や将来の環境における動作を保証しません。
            </p>
            <p>
              出力結果は、素材、解像度、色管理、プロジェクト設定および本ソフトの設定値によって変わります。
              利用者は、公開、納品または販売の前に、完成した出力を自身で確認するものとします。
            </p>
            <p>重要なAfter Effectsプロジェクトや素材については、本ソフトの導入または更新前にバックアップを作成してください。</p>

            <h3 id="terms-updates">第8条　更新とサポート</h3>
            <p>提供者は、本ソフトの機能、仕様、動作環境、価格または提供方法を変更することがあります。</p>
            <p>
              不具合修正、機能追加、アップデートおよび利用者サポートが、将来にわたって継続されることを保証するものではありません。
              大きな機能変更を伴う新しい製品版については、別の商品として提供する場合があります。
            </p>

            <h3 id="terms-refunds">第9条　返品・交換・返金</h3>
            <p>
              ダウンロード商品の性質上、注文確定後の返品、交換、キャンセルおよび購入者の都合による返金は原則として受け付けません。
              BOOTHを通じて購入した場合は、決済、キャンセルおよび返金に関するBOOTHの規約と手続きも適用されます。
            </p>
            <p>次の事情は、購入者の都合に含まれます。</p>
            <ul>
              <li>対応環境を確認せずに購入した場合</li>
              <li>期待していた機能や出力結果と異なる場合</li>
              <li>購入後に本ソフトを使用しなくなった場合</li>
              <li>案内していないOS、After Effectsのバージョン、仮想環境または第三者製ソフトウェアとの組み合わせでのみ正常に動作しない場合</li>
              <li>本規約や商品説明を確認せずに購入した場合</li>
            </ul>
            <p>
              配布ファイルの破損、内容物の不足、対応環境で本ソフトを使用できない重大な不具合など、提供者側に原因がある場合は、状況を確認したうえで修正版、交換データまたは更新版の提供を行います。
              これらの方法で正常な商品を提供できない場合は、販売サービスの規約と手続きに従って対応します。
            </p>

            <h3 id="terms-liability">第10条　保証と責任</h3>
            <p>
              提供者は、本ソフトに不具合が一切存在しないこと、すべての環境で動作すること、利用者の特定の目的に適合すること、
              または特定のカメラ、テープ、再生機もしくはブラウン管テレビの出力を完全に再現することを保証しません。
            </p>
            <p>
              提供者の通常の過失によって利用者に損害が生じ、提供者が賠償責任を負う場合、
              その範囲は直接かつ通常の損害に限り、賠償額の上限は利用者が対象ライセンスの取得に支払った金額とします。
            </p>
            <p>この制限は、提供者の故意または重大な過失によって損害が発生した場合には適用しません。</p>

            <h3 id="terms-termination">第11条　利用停止</h3>
            <p>
              利用者が本規約へ重大な違反をした場合、提供者は当該利用者のライセンスを終了できます。
              ライセンスが終了した場合、利用者は本ソフトの使用を停止し、管理するPCから本ソフトおよびその複製を削除するものとします。
            </p>
            <p>本ソフトを使用して作成した完成映像、静止画およびプロジェクトファイルは、ライセンス終了後も利用者が保持できます。</p>

            <h3 id="terms-changes">第12条　規約の変更</h3>
            <p>
              提供者は、変更の必要性、変更内容の相当性、そのほかの事情に照らして合理的な場合、本規約を変更することがあります。
            </p>
            <p>
              変更する場合は、変更内容と適用開始日をACM VHS Simulatorのドキュメント、BOOTHの商品ページ、
              そのほか適切な場所で、適用開始日までに案内します。
            </p>

            <h3 id="terms-law">第13条　準拠法</h3>
            <p>本規約は日本法に準拠します。</p>
            <p>
              本ソフトまたは本規約に関して問題が生じた場合、利用者と提供者は、まず誠実に話し合って解決を図るものとします。
            </p>

            <h3 id="terms-contact">第14条　提供者・お問い合わせ</h3>
            <ul>
              <li>提供者: ACM</li>
              <li>販売場所: BOOTH、そのほか提供者が認めた販売場所</li>
              <li>お問い合わせ: BOOTHのメッセージ機能または提供者が案内する連絡先</li>
            </ul>
          </section>
        </template>

        <nav class="footer-nav" aria-label="前後のページ">
          <RouterLink v-if="previousPage" :to="pagePath(previousPage.id)"><span>← 前のページ</span><strong>{{ previousPage.label }}</strong></RouterLink><span v-else></span>
          <RouterLink v-if="nextPage" :to="pagePath(nextPage.id)" class="next"><span>次のページ →</span><strong>{{ nextPage.label }}</strong></RouterLink>
        </nav>
        <footer class="docs-footer"><p>ACM VHS Simulator Reference Manual</p><p>Ver.{{ vhsCurrentVersion }}</p></footer>
      </main>

      <aside class="page-toc">
        <strong>このページの内容</strong>
        <nav aria-label="このページの内容">
          <button
            v-for="item in currentToc"
            :key="item.id"
            :class="{ nested: item.nested }"
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
:global(html.vhs-docs-open) { background: #05070a; scroll-padding-top: 90px; scrollbar-gutter: stable; }
:global(html.vhs-docs-open body) { background: #05070a; color: #d8e1e8; }
:global(html.vhs-docs-open *) { scrollbar-width: thin; scrollbar-color: #2a6470 #0a0e12; }
:global(html.vhs-nav-open body) { overflow: hidden; }
:global(html.vhs-docs-open::-webkit-scrollbar),
:global(html.vhs-docs-open *::-webkit-scrollbar) { width: 8px; height: 8px; }

.vhs-docs-shell {
  --vhs-bg: #080c0f;
  --vhs-panel: #10171c;
  --vhs-panel-2: #151f25;
  --vhs-line: #29424c;
  --vhs-line-bright: #43818d;
  --vhs-cyan: #6fe5e7;
  --vhs-blue: #8fb8ff;
  --vhs-pink: #ff7fb0;
  --vhs-yellow: #f5da76;
  --vhs-text: #eef4f6;
  --vhs-muted: #afbec4;
  --vhs-subtle: #83969e;
  min-height: 100vh;
  background: #0a0e11;
  color: var(--vhs-text);
  font-family: 'Yu Gothic UI', 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif;
}

.vhs-docs-shell::before {
  display: none;
}

button, input { font: inherit; }
button { color: inherit; }

.docs-header {
  position: sticky;
  z-index: 60;
  top: 0;
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--vhs-line);
  background: rgb(10 14 17 / 96%);
  backdrop-filter: blur(10px);
}

.brand { display: flex; align-items: center; gap: 12px; padding: 0; border: 0; background: none; text-align: left; text-decoration: none; }
.brand-copy strong { color: #eef3f4; font-size: .92rem; font-weight: 650; letter-spacing: .01em; }
.docs-label { padding-left: 12px; border-left: 1px solid var(--vhs-line); color: var(--vhs-subtle); font-size: .72rem; }

.header-tools { display: flex; align-items: center; gap: 12px; }
.mobile-menu { display: none; }

.docs-layout { display: grid; width: 100%; max-width: 1350px; min-height: calc(100vh - 64px); margin: 0 auto; grid-template-columns: 270px minmax(0, 860px) 220px; }
.docs-sidebar { position: sticky; top: 64px; height: calc(100vh - 64px); padding: 22px 18px 30px; border-right: 1px solid var(--vhs-line); background: #0a0e11; overflow-y: auto; }
.sidebar-search { display: grid; height: 38px; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--vhs-line); border-radius: 5px; background: #090d11; color: var(--vhs-subtle); grid-template-columns: auto 1fr auto; }
.sidebar-search:focus-within { border-color: var(--vhs-line-bright); box-shadow: 0 0 0 2px rgb(111 229 231 / 8%); }
.sidebar-search input { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--vhs-text); font-size: .72rem; }
.sidebar-search input::placeholder { color: #83969e; }
.sidebar-search kbd { color: #71858d; font-size: .58rem; }
.sidebar-search-results { display: grid; margin-top: 18px; }
.sidebar-search-results > p { margin: 0 8px 7px; color: #d6e0e3; font-size: .68rem; font-weight: 700; }
.sidebar-search-results a { display: grid; gap: 2px; padding: 9px 10px; border-bottom: 1px solid #14232a; text-decoration: none; }
.sidebar-search-results a:hover, .sidebar-search-results a:focus-visible { background: #10191e; outline: 1px solid var(--vhs-line-bright); outline-offset: -1px; }
.sidebar-search-results a span { color: var(--vhs-cyan); font-size: .58rem; letter-spacing: .1em; }
.sidebar-search-results a strong { color: #e2e9ed; font-size: .76rem; }
.sidebar-search-results a small { display: -webkit-box; overflow: hidden; color: #91a3aa; font-size: .65rem; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.search-empty { padding: 20px 10px; color: var(--vhs-muted); font-size: .72rem; text-align: center; }
.nav-group { margin-top: 24px; }
.nav-group > h2 { margin: 0 0 7px 10px; color: #52666f; font-size: .55rem; font-weight: 700; letter-spacing: .16em; }
.nav-group a { display: grid; width: 100%; padding: 8px 10px; border: 0; border-left: 2px solid transparent; background: transparent; text-align: left; text-decoration: none; }
.nav-group a:hover, .nav-group a:focus-visible { background: rgb(111 229 231 / 5%); outline: 1px solid var(--vhs-line-bright); outline-offset: -1px; }
.nav-group a.active { border-left-color: var(--vhs-cyan); background: rgb(111 229 231 / 5%); }
.nav-group a span { color: #aebdc4; font-size: .72rem; }
.nav-group a.active span { color: #e8f6f6; }
.nav-group a small { display: none; }
.sidebar-version { display: flex; justify-content: space-between; align-items: baseline; margin-top: 28px; padding: 15px 8px 0; border-top: 1px solid var(--vhs-line); color: var(--vhs-subtle); font-size: .6rem; }
.sidebar-version span { color: inherit; font-size: inherit; }
.sidebar-version strong { color: #d8e3e6; font-size: inherit; font-weight: 500; }
.docs-content { min-width: 0; padding: 48px clamp(34px, 4vw, 64px) 60px; }
.docs-content > .page-heading,
.docs-content > .hero-section,
.docs-content > .page-intro,
.docs-content > .doc-section,
.docs-content > .footer-nav,
.docs-content > .docs-footer { width: 100%; max-width: 760px; margin-right: auto; margin-left: auto; }
.page-heading { margin-bottom: 28px; }
.breadcrumbs { display: flex; gap: 8px; margin-bottom: 18px; color: var(--vhs-subtle); font-size: .68rem; }
.breadcrumbs i { font-style: normal; }
.page-heading h1 { margin: 0; color: #eff5f5; font-size: clamp(2rem, 3vw, 2.55rem); font-weight: 700; letter-spacing: -.025em; line-height: 1.25; }
.hero-section { min-height: 360px; padding: 0 0 72px; }
.kicker, .page-intro > p { color: var(--vhs-cyan); font-size: .58rem; font-weight: 700; letter-spacing: .22em; }
.hero-lead { max-width: 580px; color: #9dafb7; font-size: .9rem; line-height: 1.9; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.hero-actions a { padding: 11px 16px; border: 1px solid var(--vhs-cyan); border-radius: 4px; background: var(--vhs-cyan); color: #061014; font-size: .68rem; font-weight: 700; letter-spacing: .05em; text-decoration: none; }
.hero-actions a:hover, .hero-actions a:focus-visible { box-shadow: 0 0 0 3px rgb(111 229 231 / 14%); outline: 0; }
.hero-actions a.secondary { background: transparent; color: var(--vhs-cyan); }
.doc-shot { margin: 28px 0 0; }
.doc-shot a { display: block; border: 1px solid var(--vhs-line); background: #05090c; cursor: zoom-in; overflow: hidden; transition: border-color .16s ease; }
.doc-shot a:hover, .doc-shot a:focus-visible { border-color: var(--vhs-line-bright); outline: 0; }
.doc-shot img { display: block; width: 100%; height: auto; transition: transform .22s ease; }
@media (hover: hover) and (pointer: fine) {
  .doc-shot a:hover img { transform: scale(1.018); }
}
.doc-shot figcaption { margin-top: 9px; color: #7f929a; font-size: .68rem; line-height: 1.75; }
.preset-comparison-caption { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; }
.doc-shot .preset-source-link { display: inline-flex; flex: none; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--vhs-cyan); cursor: zoom-in; font-weight: 700; overflow: visible; text-decoration: none; }
.doc-shot .preset-source-link::after { color: currentcolor; content: '▷'; font-size: .72em; }
.doc-shot .preset-source-link:hover, .doc-shot .preset-source-link:focus-visible { border: 0; color: #b9ffff; outline: 1px solid rgb(111 229 231 / 48%); outline-offset: 3px; }
.hero-shot { margin-top: 38px; }
.video-comparison { position: relative; aspect-ratio: 16 / 9; border: 1px solid var(--vhs-line); background: #05090c; overflow: hidden; }
.video-comparison:focus-within { border-color: var(--vhs-cyan); box-shadow: 0 0 0 3px rgb(111 229 231 / 14%); }
.video-comparison__video, .video-comparison__source { position: absolute; width: 100%; height: 100%; inset: 0; }
.video-comparison__video { display: block; object-fit: cover; }
.video-comparison__source { z-index: 1; overflow: hidden; }
.video-comparison__divider { position: absolute; z-index: 3; top: 0; bottom: 0; width: 2px; background: #eef9fa; box-shadow: 0 0 0 1px rgb(4 10 13 / 40%), 0 0 14px rgb(0 0 0 / 55%); pointer-events: none; transform: translateX(-1px); user-select: none; }
.video-comparison__divider i { position: absolute; top: 50%; left: 50%; display: grid; width: 38px; height: 38px; border: 2px solid #f3fbfb; border-radius: 50%; background: #102027; box-shadow: 0 4px 18px rgb(0 0 0 / 45%); color: var(--vhs-cyan); font-size: 1rem; font-style: normal; place-items: center; transform: translate(-50%, -50%); }
.video-comparison__range { position: absolute; z-index: 4; width: 100%; height: 100%; margin: 0; inset: 0; appearance: none; background: transparent; cursor: ew-resize; opacity: 0; touch-action: pan-y; }
.video-comparison__range::-webkit-slider-runnable-track { height: 100%; background: transparent; }
.video-comparison__range::-webkit-slider-thumb { width: 44px; height: 100%; border: 0; appearance: none; background: transparent; cursor: ew-resize; }
.video-comparison__range::-moz-range-track { height: 100%; border: 0; background: transparent; }
.video-comparison__range::-moz-range-thumb { width: 44px; height: 100%; border: 0; border-radius: 0; background: transparent; cursor: ew-resize; }
.video-comparison__toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0 0; }
.video-comparison__toolbar span { color: #7f929a; font-size: .65rem; }
.video-comparison__actions { display: flex; flex: none; gap: 7px; }
.video-comparison__toolbar button { padding: 5px 11px; border: 1px solid var(--vhs-line-bright); border-radius: 3px; background: #0b151a; color: var(--vhs-cyan); cursor: pointer; font-size: .68rem; font-weight: 700; }
.video-comparison__toolbar button:hover, .video-comparison__toolbar button:focus-visible { border-color: var(--vhs-cyan); outline: 2px solid rgb(111 229 231 / 18%); outline-offset: 2px; }
.video-comparison__toolbar button:disabled { border-color: var(--vhs-line); color: #61737a; cursor: wait; }
.doc-shot .video-comparison__more { display: inline-flex; margin-top: 12px; border: 0; background: transparent; color: var(--vhs-cyan); cursor: pointer; font-size: .68rem; font-weight: 700; overflow: visible; text-decoration: none; }
.doc-shot .video-comparison__more:hover, .doc-shot .video-comparison__more:focus-visible { border: 0; color: #b9ffff; outline: 1px solid rgb(111 229 231 / 48%); outline-offset: 3px; }
.screenshot-lightbox { position: fixed; z-index: 1000; display: grid; padding: 54px 24px 24px; background: rgb(7 7 8 / 92%); backdrop-filter: blur(5px); inset: 0; place-items: center; }
.screenshot-lightbox__figure { display: grid; max-width: min(96vw, 1500px); max-height: calc(100vh - 78px); margin: 0; place-items: center; }
.screenshot-lightbox__figure img { display: block; max-width: 100%; max-height: calc(100vh - 112px); border: 1px solid #514a40; border-radius: 10px; background: #111; box-shadow: 0 24px 80px rgb(0 0 0 / 55%); object-fit: contain; }
.screenshot-lightbox__figure figcaption { margin-top: 10px; color: #b8b0a4; font-size: .72rem; line-height: 1.6; text-align: center; }
.screenshot-lightbox__close { position: fixed; top: 14px; right: 18px; display: grid; width: 40px; height: 40px; padding: 0; border: 1px solid #655d52; border-radius: 50%; background: #211f1d; color: #f5f1eb; cursor: pointer; font: 400 1.45rem/1 sans-serif; place-items: center; }
.screenshot-lightbox__close:hover, .screenshot-lightbox__close:focus-visible { border-color: #6fe5e7; outline: none; }
.screenshot-lightbox-enter-active, .screenshot-lightbox-leave-active { transition: opacity .18s ease; }
.screenshot-lightbox-enter-active .screenshot-lightbox__figure, .screenshot-lightbox-leave-active .screenshot-lightbox__figure { transition: transform .18s ease; }
.screenshot-lightbox-enter-from, .screenshot-lightbox-leave-to { opacity: 0; }
.screenshot-lightbox-enter-from .screenshot-lightbox__figure, .screenshot-lightbox-leave-to .screenshot-lightbox__figure { transform: scale(.975); }
.doc-section > .preset-samples-heading { margin-top: 48px; scroll-margin-top: 84px; }
.doc-shot--presets { margin-bottom: 28px; scroll-margin-top: 84px; }
.doc-section { margin: 0 0 60px; scroll-margin-top: 84px; }
.doc-section > h2 { margin: 0 0 20px; color: #e0e9ed; font-family: 'Arial Narrow', sans-serif; font-size: 1.55rem; letter-spacing: -.02em; }
.doc-section > p, .group-description { margin: 0 0 18px; color: #96a6ae; font-size: .8rem; line-height: 2; }
.doc-section.terms-section > p { margin: 0 0 15px; color: #c5d0d4; font-size: .9375rem; line-height: 1.8; }
.terms-meta strong { color: #e4ecee; }
.terms-section > h3 { margin: 34px 0 10px; color: #dce6e9; font-size: 1.15rem; font-weight: 650; line-height: 1.5; }
.terms-section > h3[id] { scroll-margin-top: 84px; }
.terms-section > ul { margin: 10px 0 20px; padding-left: 1.55rem; color: #c5d0d4; font-size: .9375rem; line-height: 1.8; }
.terms-section > ul li { margin: 5px 0; padding-left: .2rem; }
.section-heading { margin-bottom: 20px; }
.section-heading > span, .section-heading p { display: none; }
.section-heading h2 { margin: 0; color: #e5ecee; font-size: 1.55rem; letter-spacing: -.02em; }

.callout { margin: 24px 0; padding: 16px 18px; border-left: 3px solid; background: #0c1216; }
.callout strong { display: block; margin-bottom: 4px; color: #dbe7ea; font-size: .72rem; }
.callout p { margin: 0; color: #8fa0a8; font-size: .72rem; line-height: 1.85; }
.callout.info { border-color: var(--vhs-cyan); background: rgb(111 229 231 / 4%); }
.callout.warning { border-color: var(--vhs-yellow); background: rgb(245 218 118 / 5%); }
.status-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 18px; }
.status { padding: 5px 10px; border: 1px solid #30444d; border-radius: 999px; color: #8799a1; font-size: .6rem; }
.status.ok { border-color: #397667; color: #80c6b0; }
.status.caution { border-color: #786a39; color: #d1bb68; }
.page-intro { margin-bottom: 52px; padding: 0 0 34px; border-bottom: 1px solid var(--vhs-line); }
.page-intro > p { display: none; }
.page-intro > span { color: #7e9199; font-size: .75rem; }
.steps { display: grid; margin: 20px 0; list-style: none; }
.steps li { display: grid; align-items: start; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--vhs-line); background: transparent; grid-template-columns: 34px 1fr; }
.steps li > b { color: #3f6873; font-family: ui-monospace, monospace; font-size: .65rem; }
.steps strong { color: #d9e5e8; font-size: .76rem; }
.steps p { margin-top: 5px; color: #7f9098; font-size: .68rem; line-height: 1.7; }
.path-block { display: block; padding: 14px 16px; border: 1px solid #233941; background: #05090c; color: #9bd6d8; font-size: .69rem; overflow-x: auto; }
.preset-grid { display: grid; gap: 10px; margin-top: 20px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.preset-grid article { display: grid; align-content: start; gap: 8px; padding: 18px; border: 1px solid var(--vhs-line); background: #091015; scroll-margin-top: 92px; }
.preset-grid h3 { color: #dce6e9; font-size: .9rem; line-height: 1.45; }
.preset-grid p { color: #b8c5ca; font-size: .72rem; line-height: 1.75; }
.preset-grid span { padding-top: 8px; border-top: 1px solid #17282f; color: #879ba3; font-size: .66rem; line-height: 1.7; }
.preset-use { display: grid; gap: 4px; }
.preset-use b { color: var(--vhs-cyan); font-size: .58rem; font-weight: 700; }

.table-section { scroll-margin-top: 92px; }
.table-title { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.table-title h2 { color: #dce6e9; font-size: 1.3rem; }
.table-title a { padding: 4px 0; color: var(--vhs-cyan); font-size: .62rem; text-decoration: none; }
.table-title a:hover, .table-title a:focus-visible { text-decoration: underline; text-underline-offset: 4px; }
.parameter-table { min-width: 460px; border: 1px solid var(--vhs-line); }
.table-section { overflow-x: auto; }
.table-head, .table-row { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(180px, .65fr); }
.table-head { background: #132028; }
.table-head span { color: #9bb0b8; font-size: .58rem; font-weight: 700; }
.table-head span, .table-row > span { padding: 10px 12px; border-right: 1px solid var(--vhs-line); border-bottom: 1px solid var(--vhs-line); }
.table-head span:last-child, .table-row > span:last-child { border-right: 0; }
.table-row { background: #091015; }
.table-row:nth-child(odd) { background: #0c151a; }
.table-row > span { color: #93a4ab; font-size: .62rem; line-height: 1.55; }
.table-row strong { display: block; color: #d2dde1; font-size: .66rem; }
.table-row small { display: block; margin-top: 2px; color: #5f737c; font-size: .53rem; }
.mode { display: inline-block; padding: 3px 7px; border: 1px solid #31515b; border-radius: 999px; color: #84b7bf; font-size: .52rem; font-style: normal; white-space: nowrap; }

.quality-comparison { display: grid; gap: 12px; grid-template-columns: repeat(2, 1fr); }
.quality-comparison article { padding: 22px; border: 1px solid var(--vhs-line); background: #091015; }
.quality-comparison span { color: var(--vhs-cyan); font-size: .52rem; letter-spacing: .16em; }
.quality-comparison h2 { margin: 7px 0 10px; color: #dbe6e9; font-size: 1rem; }
.quality-comparison p { color: #81939b; font-size: .68rem; line-height: 1.8; }
.parameter-group { scroll-margin-top: 92px; }
.group-description { margin: -4px 0 22px; }
.group-condition { display: grid; gap: 14px; margin: -6px 0 22px; padding: 12px 0; border-top: 1px solid #1d3038; border-bottom: 1px solid #1d3038; grid-template-columns: 108px minmax(0, 1fr); }
.group-condition strong { color: var(--vhs-cyan); font-size: .7rem; line-height: 1.7; }
.group-condition span { color: #aebdc3; font-size: .82rem; line-height: 1.7; }
.parameter-cards { display: grid; border-top: 1px solid var(--vhs-line); }
.parameter-card { display: grid; scroll-margin-top: 84px; gap: 30px; padding: 25px 0; border-bottom: 1px solid var(--vhs-line); background: transparent; grid-template-columns: minmax(180px, .64fr) minmax(0, 1.7fr); }
.parameter-identity { min-width: 0; }
.parameter-identity h3 { color: #dbe6e9; font-size: .9rem; line-height: 1.45; }
.parameter-identity p { margin-top: 4px; color: #69808a; font-size: .6rem; line-height: 1.5; overflow-wrap: anywhere; }
.parameter-flags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.scope-label { display: inline-block; padding: 3px 7px; border: 1px solid #3b6068; border-radius: 999px; color: #9bd3d7; font-size: .68rem; white-space: nowrap; }
.parameter-content { display: grid; min-width: 0; align-content: start; }
.parameter-role { color: #c4d0d4; font-size: .7rem; line-height: 1.8; }
.parameter-range { margin-top: 15px; padding-top: 13px; border-top: 1px solid #17282f; }
.range-summary { display: flex; align-items: baseline; gap: 16px; }
.range-summary span { color: #71858d; font-size: .58rem; }
.range-meter-wrap { position: relative; padding-top: 24px; }
.range-initial { position: absolute; top: 4px; color: #c7d4d8; font-family: ui-monospace, monospace; font-size: .68rem; font-weight: 600; line-height: 1; white-space: nowrap; }
.range-initial.align-start { transform: translateX(0); }
.range-initial.align-center { transform: translateX(-50%); }
.range-initial.align-end { transform: translateX(-100%); }
.range-meter { position: relative; height: 7px; background: #20343c; }
.range-fill { position: absolute; top: 0; bottom: 0; left: 0; background: #3c8991; }
.range-initial-line { position: absolute; bottom: -3px; width: 1px; height: 13px; background: #b6d9dc; transform: translateX(-.5px); }
.range-labels { display: grid; gap: 4px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.range-labels span { min-width: 0; color: #71858d; font-family: ui-monospace, monospace; font-size: .58rem; line-height: 1.4; text-align: center; overflow-wrap: anywhere; }
.range-labels span:first-child { text-align: left; }
.range-labels span:last-child { text-align: right; }
.range-choice-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 5px 18px; margin-top: 7px; }
.range-choices { color: #91a4ab; font-size: .7rem; line-height: 1.7; }
.range-choice-line strong { color: #c7d4d8; font-family: ui-monospace, monospace; font-size: .68rem; font-weight: 600; }
.parameter-note { display: grid; gap: 12px; margin-top: 10px; padding: 0 0 0 11px; border-top: 0; border-left: 2px solid #43565d; grid-template-columns: 92px minmax(0, 1fr); }
.parameter-note strong { color: #8fa0a6; font-size: .58rem; font-weight: 700; line-height: 1.8; }
.parameter-note span { color: #91a2aa; font-size: .7rem; line-height: 1.8; }

.glossary-section { scroll-margin-top: 92px; }
.glossary-list { display: grid; border-top: 1px solid var(--vhs-line); }
.glossary-entry { display: grid; scroll-margin-top: 84px; gap: 30px; padding: 22px 0; border-bottom: 1px solid var(--vhs-line); grid-template-columns: minmax(180px, .64fr) minmax(0, 1.7fr); }
.glossary-entry h3 { color: #dbe6e9; font-size: 1.05rem; line-height: 1.45; }
.glossary-entry > div p { margin-top: 4px; color: #9cafb6; font-size: .8rem; line-height: 1.5; overflow-wrap: anywhere; }
.glossary-entry > p { color: #c1ccd0; font-size: .94rem; line-height: 1.85; }

.issue-list { display: grid; gap: 1px; background: var(--vhs-line); }
.issue-list .issue-heading { margin: 0; padding: 0 0 18px; background: #0a0e11; }
.issue-list details { background: #091015; scroll-margin-top: 92px; }
.issue-list summary { position: relative; padding: 18px 54px 18px 20px; color: #d4e1e4; cursor: pointer; font-size: .88rem; font-weight: 700; list-style: none; }
.issue-list summary::-webkit-details-marker { display: none; }
.issue-list summary::after { position: absolute; top: 50%; right: 20px; color: var(--vhs-cyan); content: '＋'; font-size: 1rem; transform: translateY(-50%); }
.issue-list details[open] summary::after { content: '−'; }
.issue-list summary:hover, .issue-list summary:focus-visible { background: #10191e; outline: 1px solid var(--vhs-line-bright); outline-offset: -1px; }
.issue-list p { margin: 0; padding: 0 54px 20px 20px; color: #84969e; font-size: .69rem; line-height: 1.85; }
.footer-nav { display: grid; gap: 12px; margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--vhs-line); grid-template-columns: repeat(2, 1fr); }
.footer-nav a { display: grid; gap: 4px; padding: 14px 0; text-align: left; text-decoration: none; }
.footer-nav a:hover strong, .footer-nav a:focus-visible strong { color: var(--vhs-cyan); }
.footer-nav a:focus-visible { outline: 1px solid var(--vhs-line-bright); outline-offset: 4px; }
.footer-nav a.next { text-align: right; }
.footer-nav span { color: #52666f; font-size: .5rem; letter-spacing: .13em; }
.footer-nav strong { color: #b8c8cd; font-size: .68rem; }
.docs-footer { display: flex; justify-content: space-between; gap: 18px; margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--vhs-line); }
.docs-footer p { color: #4f6068; font-size: .54rem; }
.page-toc { position: sticky; top: 64px; height: calc(100vh - 64px); padding: 50px 20px 30px; overflow-y: auto; }
.page-toc > strong { display: block; margin-bottom: 10px; color: #d4dfe2; font-size: .66rem; }
.page-toc nav { display: grid; border-left: 1px solid var(--vhs-line); }
.page-toc nav button { padding: 5px 0 5px 14px; border: 0; background: transparent; color: var(--vhs-subtle); cursor: pointer; font-size: .63rem; line-height: 1.5; text-align: left; }
.page-toc nav button.nested { padding-left: 24px; color: #71858d; font-size: .59rem; }
.page-toc nav button:hover, .page-toc nav button:focus-visible { color: var(--vhs-cyan); outline: 0; }
.to-top { margin-top: 18px; padding: 5px 0; border: 0; background: transparent; color: var(--vhs-subtle); cursor: pointer; font-size: .6rem; }
.to-top:hover, .to-top:focus-visible { color: var(--vhs-cyan); outline: 0; }
/* Readability baseline for the reference pages. */
.sidebar-search input { font-size: .82rem; }
.sidebar-search-results a span { font-size: .62rem; }
.sidebar-search-results a strong { font-size: .82rem; }
.sidebar-search-results a small { color: #aebdc3; font-size: .7rem; }

.nav-group > h2 { color: #82969e; font-size: .68rem; }
.nav-group a { gap: 4px; padding: 10px 12px; }
.nav-group a span { color: #d0dade; font-size: .88rem; font-weight: 600; }
.nav-group a small { color: #91a3aa; font-size: .72rem; line-height: 1.45; }
.kicker, .page-intro > p { font-size: .7rem; }
.hero-lead { color: #c4d0d4; font-size: 1rem; line-height: 1.85; }
.hero-actions a { padding: 12px 18px; font-size: .86rem; }
.doc-section > p, .group-description { color: #c5d0d4; font-size: 1rem; line-height: 1.9; }
.section-heading > span { color: #77919a; font-size: .78rem; }
.section-heading p { font-size: .68rem; }
.section-heading h2, .doc-section > h2 { line-height: 1.35; }
.callout { padding: 18px 20px; }
.callout strong { font-size: .9rem; }
.callout p { color: #bdc9cd; font-size: .88rem; line-height: 1.8; }
.status { color: #bac7cb; font-size: .76rem; }
.page-intro > span { color: #b7c5ca; font-size: .94rem; line-height: 1.7; }
.steps li > b { color: #78929b; font-size: .78rem; }
.steps strong { font-size: .95rem; }
.steps p { color: #b6c3c8; font-size: .88rem; line-height: 1.75; }
.path-block { font-size: .86rem; }
.preset-grid h3 { font-size: 1.05rem; }
.preset-grid p { font-size: .9rem; }
.preset-grid span { color: #aebdc2; font-size: .8rem; }
.preset-use b { font-size: .7rem; }

.table-title a { font-size: .78rem; }
.table-head span { font-size: .75rem; }
.table-row > span { color: #bdc9ce; font-size: .82rem; line-height: 1.65; }
.table-row strong { color: #edf3f4; font-size: .88rem; }
.table-row small { color: #98aab1; font-size: .72rem; }
.mode { font-size: .68rem; }

.quality-comparison span { font-size: .66rem; }
.quality-comparison h2 { font-size: 1.15rem; }
.quality-comparison p { color: #b9c6ca; font-size: .9rem; line-height: 1.8; }
.parameter-identity h3 { font-size: 1.05rem; }
.parameter-identity p { color: #9cafb6; font-size: .8rem; }
.parameter-role { font-size: .94rem; line-height: 1.85; }
.range-summary span { color: #96a8af; font-size: .72rem; }
.range-initial, .range-choice-line strong { font-size: .84rem; }
.range-labels span { color: #91a4ab; font-size: .72rem; }
.range-choices { font-size: .9rem; }
.parameter-note strong { font-size: .76rem; }
.parameter-note span { color: #c1ccd0; font-size: .9rem; line-height: 1.8; }

.issue-list summary { font-size: 1.05rem; }
.issue-list p { color: #bdc9cd; font-size: .92rem; line-height: 1.85; }
.footer-nav span { color: #899ba2; font-size: .65rem; }
.footer-nav strong { color: #d1dbde; font-size: .86rem; }
.docs-footer p { color: #87989f; font-size: .7rem; }
@media (max-width: 1180px) {
  .docs-layout { max-width: 1110px; grid-template-columns: 250px minmax(0, 860px); }
  .page-toc { display: none; }
}

@media (max-width: 820px) {
  .docs-header { padding: 0 14px; }
  .mobile-menu { display: grid; width: 38px; height: 34px; align-content: center; gap: 4px; padding: 8px; border: 1px solid var(--vhs-line); border-radius: 4px; background: #091015; cursor: pointer; }
  .mobile-menu span { height: 1px; background: #8aa0a8; }
  .docs-layout { display: block; max-width: none; }
  .nav-backdrop { position: fixed; z-index: 40; inset: 64px 0 0; border: 0; background: rgb(2 5 7 / 72%); cursor: pointer; }
  .docs-sidebar { position: fixed; z-index: 50; top: 64px; right: auto; bottom: 0; left: 0; width: min(320px, 88vw); height: auto; border-right: 1px solid var(--vhs-line-bright); box-shadow: 18px 0 56px rgb(0 0 0 / 42%); transform: translateX(-102%); transition: transform .2s ease; }
  .docs-sidebar.open { transform: translateX(0); }
  .docs-content { padding: 42px 28px 60px; }
  .hero-section { min-height: 0; }
}

@media (max-width: 600px) {
  .brand-copy strong { font-size: .78rem; white-space: nowrap; }
  .docs-label { display: none; }
  .header-tools { gap: 7px; }
  .docs-content { padding: 32px 17px 46px; }
  .hero-section { padding: 0 0 58px; }
  .quality-comparison { grid-template-columns: 1fr; }
  .page-heading h1 { font-size: 2.15rem; }
  .preset-grid { grid-template-columns: 1fr; }
  .parameter-card { gap: 14px; grid-template-columns: 1fr; }
  .glossary-entry { gap: 8px; grid-template-columns: 1fr; }
  .parameter-flags { margin-top: 9px; }
  .group-condition { gap: 4px; grid-template-columns: 1fr; }
  .footer-nav { grid-template-columns: 1fr; }
  .footer-nav a.next { text-align: left; }
  .docs-footer { flex-direction: column; }
  .table-section { overflow: visible; }
  .parameter-table { display: grid; min-width: 0; gap: 10px; border: 0; }
  .table-head { display: none; }
  .table-row { display: grid; padding: 16px; border: 1px solid var(--vhs-line); grid-template-columns: 1fr; }
  .table-row > span { min-width: 0; padding: 0; border: 0; overflow-wrap: anywhere; }
  .table-row > span + span { display: block; margin-top: 11px; padding-top: 11px; border-top: 1px solid var(--vhs-line); }
  .table-row > span + span::before { display: block; margin-bottom: 4px; color: #8fa3aa; content: attr(data-label); font-size: .72rem; font-weight: 700; }
  .table-row .cell-value { display: block; min-width: 0; }
}

@media (max-width: 420px) {
  .table-title { align-items: flex-start; flex-direction: column; gap: 7px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
}
</style>
