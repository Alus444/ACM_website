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
const mobileSearchOpen = ref(false)
const isMobileLayout = ref(false)
const isCompactHeader = ref(false)
const desktopSearchInput = ref<HTMLInputElement | null>(null)
const mobileSearchInput = ref<HTMLInputElement | null>(null)
const mobileSearchButton = ref<HTMLButtonElement | null>(null)
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
  {
    id: 'dsc1265',
    comparisonFile: 'preset-comparison-dsc1265.webp',
    sourceFile: 'preset-source-dsc1265.webp',
    alt: '青空と白い雲に6種類の内蔵プリセットを適用した比較',
    sourceAlt: '青空と白い雲、電線、樹木を写した加工前の元画像',
    caption: '青空と白い雲、細い電線で、色の変化、輪郭の崩れ、CRT表示を比較できます。',
  },
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

  return [...pageResults, ...glossaryResults, ...parameterResults, ...presetResults, ...issueResults].slice(0, 12)
})

const pageIndex = computed(() => allVhsNavItems.findIndex((item) => item.id === activePage.value))
const previousPage = computed(() => pageIndex.value > 0 ? allVhsNavItems[pageIndex.value - 1] : undefined)
const nextPage = computed(() => pageIndex.value < allVhsNavItems.length - 1 ? allVhsNavItems[pageIndex.value + 1] : undefined)

function pagePath(id: string) {
  return id === 'overview' ? '/vhs-simulator' : `/vhs-simulator/${id}`
}

function resultPath(result: SearchResult) {
  return `${pagePath(result.page)}${result.hash ?? ''}`
}

function closeTransientUi() {
  mobileNavOpen.value = false
  mobileSearchOpen.value = false
  searchQuery.value = ''
}

function toggleMobileNavigation() {
  const nextState = !mobileNavOpen.value
  mobileNavOpen.value = nextState
  mobileSearchOpen.value = false
  if (nextState) nextTick(() => sidebarNav.value?.querySelector<HTMLElement>('a')?.focus())
}

function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value
  mobileNavOpen.value = false
  if (mobileSearchOpen.value) nextTick(() => mobileSearchInput.value?.focus())
}

function closeMobileSearch() {
  mobileSearchOpen.value = false
  searchQuery.value = ''
  nextTick(() => mobileSearchButton.value?.focus())
}

function closeMobileNavigation() {
  mobileNavOpen.value = false
  nextTick(() => menuButton.value?.focus())
}

function focusSearch() {
  if (isCompactHeader.value) {
    mobileSearchOpen.value = true
    mobileNavOpen.value = false
    nextTick(() => mobileSearchInput.value?.focus())
    return
  }
  desktopSearchInput.value?.focus()
}

function syncViewport() {
  isMobileLayout.value = window.matchMedia('(max-width: 960px)').matches
  isCompactHeader.value = window.matchMedia('(max-width: 600px)').matches
  if (!isMobileLayout.value) mobileNavOpen.value = false
  if (!isCompactHeader.value) mobileSearchOpen.value = false
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
    mobileSearchOpen.value = false
    if (returnFocus) nextTick(() => menuButton.value?.focus())
  }
}

watch(activePage, (page) => {
  document.title = `${currentPage.value.label} | ACM VHS Simulator`
  if (page === 'overview') {
    comparisonAutoplayRequested = false
    nextTick(maybeAutoplayComparison)
  } else {
    pauseComparison()
  }
})

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
      </RouterLink>

      <div class="header-tools">
        <label class="search-box desktop-search">
          <span aria-hidden="true">⌕</span>
          <input ref="desktopSearchInput" v-model="searchQuery" type="search" placeholder="検索" aria-label="リファレンスを検索" aria-controls="vhs-search-results" />
          <kbd>/</kbd>
        </label>
        <button ref="mobileSearchButton" class="mobile-search-button" type="button" :aria-expanded="mobileSearchOpen" aria-controls="vhs-mobile-search" :aria-label="mobileSearchOpen ? '検索を閉じる' : '検索を開く'" @click="toggleMobileSearch">⌕</button>
        <button ref="menuButton" class="mobile-menu" type="button" :aria-expanded="mobileNavOpen" aria-controls="vhs-docs-sidebar" :aria-label="mobileNavOpen ? 'メニューを閉じる' : 'メニューを開く'" @click="toggleMobileNavigation">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div v-if="mobileSearchOpen && isCompactHeader" id="vhs-mobile-search" class="mobile-search-drawer">
        <label class="search-box">
          <span aria-hidden="true">⌕</span>
          <input ref="mobileSearchInput" v-model="searchQuery" type="search" placeholder="検索" aria-label="リファレンスを検索" aria-controls="vhs-search-results" />
        </label>
        <button type="button" aria-label="検索を閉じる" @click="closeMobileSearch">閉じる</button>
      </div>

      <div v-if="searchQuery" id="vhs-search-results" class="search-panel" role="region" aria-label="検索結果">
        <div v-if="searchResults.length" class="search-results">
          <RouterLink v-for="result in searchResults" :key="`${result.page}-${result.hash ?? result.title}`" :to="resultPath(result)" @click="closeTransientUi">
            <span>{{ result.eyebrow }}</span>
            <strong>{{ result.title }}</strong>
            <small>{{ result.description }}</small>
          </RouterLink>
        </div>
        <p v-else>該当する項目がありません。</p>
      </div>
    </header>

    <div class="docs-layout">
      <button v-if="mobileNavOpen && isMobileLayout" class="nav-backdrop" type="button" aria-label="メニューを閉じる" @click="closeMobileNavigation"></button>
      <aside id="vhs-docs-sidebar" :class="['docs-sidebar', { open: mobileNavOpen }]" :aria-hidden="isMobileLayout && !mobileNavOpen ? 'true' : undefined" :inert="isMobileLayout && !mobileNavOpen ? true : undefined">
        <nav ref="sidebarNav" aria-label="ACM VHS Simulator ドキュメント">
          <section v-for="group in vhsNavGroups" :key="group.label" class="nav-group">
            <p>{{ group.label }}</p>
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
      </aside>

      <main class="docs-content" @click="handleScreenshotClick">
        <template v-if="activePage === 'overview'">
          <section class="hero-section">
            <div class="hero-copy">
              <h1>ACM VHS Simulator</h1>
              <p class="hero-lead">家庭用ビデオカメラ、VHSテープ、ブラウン管テレビの質感を再現するAfter Effectsプラグイン。</p>
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
          <section class="page-intro"><p>INSTALLATION</p><h1>インストール、更新、削除</h1><span>After Effectsを終了し、配布フォルダーごと配置します。</span></section>
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
          <section class="page-intro"><p>PRESETS</p><h1>内蔵プリセット</h1><span>用意されている6種類の仕上がり。</span></section>
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
          <section class="page-intro"><p>GLOSSARY</p><h1>用語集</h1><span>CRT、TVL、RFなどの用語。</span></section>
          <section v-for="group in vhsGlossaryGroups" :key="group.label" class="doc-section glossary-section">
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
          <section class="page-intro"><p>PARAMETER INDEX</p><h1>全パラメータ早見表</h1><span>各項目の範囲と初期値。</span></section>
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
          <section class="page-intro"><p>{{ activeParameterEyebrow }}</p><h1>{{ currentPage.label }}</h1><span>{{ currentPage.description }}</span></section>
          <section v-if="activePage === 'preview'" class="doc-section">
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
          <section class="page-intro"><p>DIAGNOSIS</p><h1>診断・トラブルシューティング</h1><span>症状ごとの確認事項と対処方法。</span></section>
          <section class="doc-section issue-list"><h2 class="issue-heading">想定される問題</h2><details v-for="issue in vhsIssues" :id="issue.id" :key="issue.id"><summary>{{ issue.question }}</summary><p>{{ issue.answer }}</p></details></section>
          <section class="doc-section"><div class="callout warning"><strong>クラッシュした場合</strong><p>作業中のプロジェクトを別名で保存し、同じフレームをCPUで確認します。直らない場合は配布フォルダーを入れ直してください。問い合わせ時はAEのバージョン、解像度、GPU名、問題が起きるフレームを控えてください。</p></div></section>
        </template>

        <nav class="footer-nav" aria-label="前後のページ">
          <RouterLink v-if="previousPage" :to="pagePath(previousPage.id)"><span>← 前のページ</span><strong>{{ previousPage.label }}</strong></RouterLink><span v-else></span>
          <RouterLink v-if="nextPage" :to="pagePath(nextPage.id)" class="next"><span>次のページ →</span><strong>{{ nextPage.label }}</strong></RouterLink>
        </nav>
        <footer class="docs-footer"><p>ACM VHS Simulator Reference Manual</p><p>Ver.{{ vhsCurrentVersion }}</p></footer>
      </main>

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
:global(html.vhs-docs-open) { background: #05070a; scroll-padding-top: 90px; }
:global(html.vhs-docs-open body) { background: #05070a; color: #d8e1e8; }
:global(html.vhs-docs-open *) { scrollbar-color: #2a6470 #0a0e12; }
:global(html.vhs-nav-open body) { overflow: hidden; }

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
  position: fixed;
  z-index: 60;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--vhs-line);
  background: rgb(10 14 17 / 96%);
  backdrop-filter: blur(10px);
}

.brand { padding: 0; border: 0; background: none; text-align: left; text-decoration: none; }
.brand-copy strong { color: #eef3f4; font-size: .92rem; font-weight: 650; letter-spacing: .01em; }

.header-tools { display: flex; align-items: center; gap: 12px; }
.search-box { display: flex; width: min(34vw, 360px); height: 38px; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--vhs-line); border-radius: 5px; background: #090d11; color: var(--vhs-subtle); }
.search-box:focus-within { border-color: var(--vhs-line-bright); box-shadow: 0 0 0 2px rgb(111 229 231 / 6%); }
.search-box input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--vhs-text); font-size: .72rem; }
.search-box input::placeholder { color: #506068; }
.search-box kbd { padding: 1px 6px; border: 1px solid #26343a; border-radius: 3px; color: #5e6b72; font-size: .58rem; }
.mobile-menu, .mobile-search-button { display: none; }
.mobile-search-drawer { display: none; }

.search-panel { position: absolute; top: 57px; right: 24px; width: min(520px, calc(100vw - 32px)); padding: 8px; border: 1px solid var(--vhs-line-bright); border-radius: 7px; background: #090d11; box-shadow: 0 22px 70px rgb(0 0 0 / 55%); }
.search-results { display: grid; max-height: min(72vh, 560px); overflow-y: auto; }
.search-results a { display: grid; gap: 2px; padding: 11px 12px; border: 0; border-bottom: 1px solid #14232a; background: transparent; text-align: left; text-decoration: none; }
.search-results a:hover, .search-results a:focus-visible { background: #10191e; outline: 1px solid var(--vhs-line-bright); outline-offset: -1px; }
.search-results span { color: var(--vhs-cyan); font-size: .52rem; letter-spacing: .13em; }
.search-results strong { color: #e2e9ed; font-size: .76rem; }
.search-results small { display: -webkit-box; overflow: hidden; color: var(--vhs-muted); font-size: .62rem; line-height: 1.55; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.search-panel > p { padding: 24px; color: var(--vhs-muted); font-size: .72rem; text-align: center; }

.docs-layout { display: grid; max-width: 1110px; min-height: 100vh; margin: 0 auto; padding-top: 60px; grid-template-columns: 250px minmax(0, 860px); justify-content: center; }
.docs-sidebar { position: sticky; top: 60px; height: calc(100vh - 60px); padding: 32px 18px 24px; border-right: 1px solid var(--vhs-line); background: #0a0e11; overflow-y: auto; }
.nav-group { margin-bottom: 22px; }
.nav-group > p { margin: 0 0 7px 10px; color: #52666f; font-size: .55rem; font-weight: 700; letter-spacing: .16em; }
.nav-group a { display: grid; width: 100%; padding: 8px 10px; border: 0; border-left: 2px solid transparent; background: transparent; text-align: left; text-decoration: none; }
.nav-group a:hover, .nav-group a:focus-visible { background: rgb(111 229 231 / 5%); outline: 1px solid var(--vhs-line-bright); outline-offset: -1px; }
.nav-group a.active { border-left-color: var(--vhs-cyan); background: rgb(111 229 231 / 5%); }
.nav-group a span { color: #aebdc4; font-size: .72rem; }
.nav-group a.active span { color: #e8f6f6; }
.nav-group a small { display: none; }
.docs-content { min-width: 0; padding: 48px clamp(34px, 4vw, 64px) 60px; }
.hero-section { max-width: 720px; min-height: 360px; padding: 56px 0 72px; }
.kicker, .page-intro > p { color: var(--vhs-cyan); font-size: .58rem; font-weight: 700; letter-spacing: .22em; }
.hero-copy h1 { margin: 0 0 24px; color: #eff5f5; font-size: clamp(2.3rem, 3.6vw, 3.35rem); font-weight: 700; letter-spacing: -.045em; line-height: 1.05; }
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
.page-intro { max-width: 720px; margin-bottom: 52px; padding: 32px 0 34px; border-bottom: 1px solid var(--vhs-line); }
.page-intro > p { display: none; }
.page-intro h1 { margin: 0 0 14px; color: #edf3f4; font-size: clamp(2.1rem, 4vw, 3rem); letter-spacing: -.035em; line-height: 1.12; }
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
/* Readability baseline for the reference pages. */
.search-box input { font-size: .82rem; }
.search-box input::placeholder { color: #91a2a9; }
.search-results span { font-size: .66rem; }
.search-results strong { font-size: .9rem; }
.search-results small, .search-panel > p { color: #aebdc3; font-size: .78rem; }

.nav-group > p { color: #82969e; font-size: .68rem; }
.nav-group a { gap: 4px; padding: 10px 12px; }
.nav-group a span { color: #d0dade; font-size: .88rem; font-weight: 600; }
.nav-group a small { color: #91a3aa; font-size: .72rem; line-height: 1.45; }
.kicker, .page-intro > p { font-size: .7rem; }
.hero-copy h1 {
  max-width: none;
  font-family: 'Arial Black', 'Arial Narrow', system-ui, sans-serif;
  font-size: clamp(2.3rem, 3.6vw, 3.35rem);
  letter-spacing: -.045em;
  line-height: 1;
  white-space: nowrap;
  text-shadow: none;
}
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
@media (max-width: 960px) {
  .docs-header { padding: 0 14px; }
  .search-box { width: min(48vw, 360px); }
  .mobile-menu { display: grid; width: 38px; height: 34px; align-content: center; gap: 4px; padding: 8px; border: 1px solid var(--vhs-line); border-radius: 4px; background: #091015; cursor: pointer; }
  .mobile-menu span { height: 1px; background: #8aa0a8; }
  .docs-layout { display: block; }
  .nav-backdrop { position: fixed; z-index: 40; inset: 60px 0 0; border: 0; background: rgb(2 5 7 / 72%); cursor: pointer; }
  .docs-sidebar { position: fixed; z-index: 50; top: 60px; right: auto; bottom: 0; left: 0; width: min(320px, 88vw); height: auto; border-right: 1px solid var(--vhs-line-bright); box-shadow: 18px 0 56px rgb(0 0 0 / 42%); transform: translateX(-102%); transition: transform .2s ease; }
  .docs-sidebar.open { transform: translateX(0); }
  .docs-content { padding: 42px 28px 60px; }
  .hero-section { min-height: 0; }
}

@media (max-width: 600px) {
  .brand-copy strong { font-size: .78rem; white-space: nowrap; }
  .header-tools { gap: 7px; }
  .desktop-search { display: none; }
  .mobile-search-button { display: grid; width: 38px; height: 34px; padding: 0; border: 1px solid var(--vhs-line); border-radius: 4px; background: #091015; color: #a9bcc3; cursor: pointer; font-size: 1.1rem; place-items: center; }
  .mobile-search-drawer { position: absolute; top: 59px; right: 0; left: 0; display: flex; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--vhs-line); background: #0a0e11; }
  .mobile-search-drawer .search-box { width: auto; flex: 1; }
  .mobile-search-drawer > button { padding: 0 6px; border: 0; background: transparent; color: var(--vhs-cyan); cursor: pointer; font-size: .75rem; }
  .search-panel { top: 116px; right: 12px; width: calc(100vw - 24px); }
  .docs-content { padding: 32px 17px 46px; }
  .hero-section { padding: 44px 0 58px; }
  .hero-copy h1 { font-size: clamp(2rem, 12vw, 2.5rem); line-height: 1.08; white-space: normal; }
  .quality-comparison { grid-template-columns: 1fr; }
  .page-intro h1 { font-size: 2.15rem; }
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
