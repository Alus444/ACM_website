<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productDocConfig, productDocPages } from '../data/product-documentation'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const mobileNavOpen = ref(false)
const isMobileLayout = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const sidebarNav = ref<HTMLElement | null>(null)
const lightboxSrc = ref('')
const lightboxAlt = ref('')
const lightboxCaption = ref('')
const lightboxCloseButton = ref<HTMLButtonElement | null>(null)
let previousBodyOverflow = ''
let lightboxTrigger: HTMLElement | null = null

const rootPath = `/${productDocConfig.slug}`
const allItems = productDocPages
const activePage = computed(() => {
  const requested = typeof route.params.page === 'string' ? route.params.page : productDocConfig.overviewPage
  const resolved = productDocConfig.legacyPageAliases[requested] ?? requested
  return allItems.some((page) => page.id === resolved) ? resolved : productDocConfig.overviewPage
})
const currentPage = computed(() => allItems.find((page) => page.id === activePage.value) ?? allItems[0])
const currentPageIndex = computed(() => allItems.findIndex((page) => page.id === activePage.value))
const previousPage = computed(() => allItems[currentPageIndex.value - 1])
const nextPage = computed(() => allItems[currentPageIndex.value + 1])
const currentToc = computed(() => currentPage.value?.sections.map((section) => ({ id: section.id, label: section.label })) ?? [])

const navGroups = computed(() => {
  const groups = new Map<string, typeof productDocPages>()
  for (const page of productDocPages) {
    const items = groups.get(page.group) ?? []
    items.push(page)
    groups.set(page.group, items)
  }
  return [...groups].map(([label, items]) => ({ label, items }))
})

const searchEntries = computed(() => productDocPages.flatMap((page) => [
  {
    page: page.id,
    hash: '',
    eyebrow: page.group,
    title: page.label,
    description: page.description,
    text: [page.label, page.description, ...page.keywords].join(' '),
  },
  ...page.sections.map((section) => ({
    page: page.id,
    hash: `#${section.id}`,
    eyebrow: page.label,
    title: section.label,
    description: section.paragraphs?.[0] ?? section.callout?.body ?? '',
    text: [
      section.label,
      section.eyebrow ?? '',
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      section.callout?.title ?? '',
      section.callout?.body ?? '',
    ].join(' '),
  })),
]))

const searchResults = computed(() => {
  const tokens = searchQuery.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (!tokens.length) return []
  return searchEntries.value.filter((entry) => {
    const haystack = `${entry.title} ${entry.description} ${entry.text}`.toLocaleLowerCase()
    return tokens.every((token) => haystack.includes(token))
  }).slice(0, 20)
})

const themeStyle = computed(() => ({
  '--docs-bg': productDocConfig.theme.background,
  '--docs-panel': productDocConfig.theme.panel,
  '--docs-line': productDocConfig.theme.line,
  '--docs-line-bright': productDocConfig.theme.lineBright,
  '--docs-accent': productDocConfig.theme.accent,
  '--docs-text': productDocConfig.theme.text,
  '--docs-muted': productDocConfig.theme.muted,
  '--docs-subtle': productDocConfig.theme.subtle,
}))

function pagePath(id: string) {
  return id === productDocConfig.overviewPage ? rootPath : `${rootPath}/${id}`
}

function resultPath(result: { page: string; hash: string }) {
  return `${pagePath(result.page)}${result.hash}`
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

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function jumpToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function revealRouteTarget() {
  if (!route.hash) return
  await nextTick()
  const target = document.querySelector(route.hash)
  if (target instanceof HTMLDetailsElement) target.open = true
}

function handleScreenshotClick(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest<HTMLAnchorElement>('.doc-shot a[data-lightbox]')
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

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && lightboxSrc.value) {
    event.preventDefault()
    closeLightbox()
    return
  }

  const target = event.target as HTMLElement | null
  const isEditing = target?.matches('input, textarea, select, [contenteditable="true"]')
  if (((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') || (event.key === '/' && !isEditing)) {
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

watch(activePage, () => {
  if (!route.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}, { immediate: true, flush: 'sync' })

watch(() => route.fullPath, async () => {
  const requested = typeof route.params.page === 'string' ? route.params.page : productDocConfig.overviewPage
  if (requested !== activePage.value) {
    await router.replace(pagePath(activePage.value))
    return
  }
  closeTransientUi()
  await nextTick()
  document.title = `${currentPage.value.label} | ${productDocConfig.titleSuffix}`
  await revealRouteTarget()
}, { immediate: true, flush: 'post' })

watch(mobileNavOpen, (open) => {
  document.documentElement.classList.toggle('product-docs-nav-open', open && isMobileLayout.value)
})

onMounted(() => {
  document.documentElement.classList.add('product-docs-open')
  syncViewport()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', syncViewport)
})

onUnmounted(() => {
  document.documentElement.classList.remove('product-docs-open', 'product-docs-nav-open')
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', syncViewport)
})
</script>

<template>
  <div class="product-docs-shell" :style="themeStyle">
    <header class="docs-header">
      <RouterLink class="brand" :to="rootPath" :aria-label="`${productDocConfig.productName} ドキュメントトップへ`" @click="closeTransientUi">
        <img v-if="productDocConfig.logoSrc" :src="productDocConfig.logoSrc" alt="" />
        <strong>{{ productDocConfig.productName }}</strong>
        <span>{{ productDocConfig.documentLabel }}</span>
      </RouterLink>
      <button ref="menuButton" class="mobile-menu" type="button" :aria-expanded="mobileNavOpen" aria-controls="product-docs-sidebar" :aria-label="mobileNavOpen ? 'メニューを閉じる' : 'メニューを開く'" @click="toggleMobileNavigation">
        <i></i><i></i><i></i>
      </button>
    </header>

    <div class="docs-layout">
      <button v-if="mobileNavOpen && isMobileLayout" class="nav-backdrop" type="button" aria-label="メニューを閉じる" @click="closeMobileNavigation"></button>
      <aside id="product-docs-sidebar" :class="['docs-sidebar', { open: mobileNavOpen }]" :aria-hidden="isMobileLayout && !mobileNavOpen ? 'true' : undefined" :inert="isMobileLayout && !mobileNavOpen ? true : undefined">
        <label class="sidebar-search">
          <span aria-hidden="true">⌕</span>
          <input ref="searchInput" v-model="searchQuery" type="search" placeholder="ドキュメントを検索" aria-label="ドキュメントを検索" aria-controls="product-docs-search-results" />
          <kbd>/</kbd>
        </label>

        <div v-if="searchQuery" id="product-docs-search-results" class="search-results" role="region" aria-label="検索結果">
          <p>検索結果</p>
          <RouterLink v-for="result in searchResults" :key="`${result.page}-${result.hash || result.title}`" :to="resultPath(result)" @click="closeTransientUi">
            <span>{{ result.eyebrow }}</span>
            <strong>{{ result.title }}</strong>
            <small>{{ result.description }}</small>
          </RouterLink>
          <span v-if="searchResults.length === 0" class="search-empty">該当する項目がありません。</span>
        </div>

        <nav v-else ref="sidebarNav" :aria-label="`${productDocConfig.productName} ドキュメント`">
          <section v-for="group in navGroups" :key="group.label" class="nav-group">
            <h2>{{ group.label }}</h2>
            <RouterLink v-for="item in group.items" :key="item.id" :to="pagePath(item.id)" :class="{ active: activePage === item.id }" :aria-current="activePage === item.id ? 'page' : undefined" @click="closeTransientUi">
              {{ item.label }}
            </RouterLink>
          </section>
        </nav>

        <div class="sidebar-version">
          <span>対応バージョン</span>
          <strong>Ver.{{ productDocConfig.currentVersion }}</strong>
        </div>
      </aside>

      <main class="docs-content" @click="handleScreenshotClick">
        <article>
          <header class="page-heading">
            <div class="breadcrumbs"><span>ドキュメント</span><i>/</i><span>{{ activePage === productDocConfig.overviewPage ? 'はじめに' : currentPage.label }}</span></div>
            <h1>{{ activePage === productDocConfig.overviewPage ? productDocConfig.productName : currentPage.label }}</h1>
          </header>

          <p v-if="currentPage.lead" class="page-lead">{{ currentPage.lead }}</p>

          <section v-for="section in currentPage.sections" :id="section.id" :key="section.id" class="doc-section">
            <p v-if="section.eyebrow" class="eyebrow">{{ section.eyebrow }}</p>
            <h2>{{ section.label }}</h2>
            <p v-for="paragraph in section.paragraphs ?? []" :key="paragraph">{{ paragraph }}</p>
            <ul v-if="section.bullets?.length">
              <li v-for="item in section.bullets" :key="item">{{ item }}</li>
            </ul>
            <div v-if="section.callout" :class="['callout', section.callout.tone ?? 'info']">
              <strong>{{ section.callout.title }}</strong>
              <p>{{ section.callout.body }}</p>
            </div>
            <figure v-if="section.image" class="doc-shot">
              <a :href="section.image.src" target="_blank" rel="noopener" data-lightbox>
                <img :src="section.image.src" :alt="section.image.alt" loading="lazy" />
              </a>
              <figcaption v-if="section.image.caption">{{ section.image.caption }}</figcaption>
            </figure>
          </section>

          <nav class="footer-nav" aria-label="前後のページ">
            <RouterLink v-if="previousPage" :to="pagePath(previousPage.id)"><span>前のページ</span><strong>◁ {{ previousPage.label }}</strong></RouterLink>
            <span v-else></span>
            <RouterLink v-if="nextPage" class="next" :to="pagePath(nextPage.id)"><span>次のページ</span><strong>{{ nextPage.label }} ▷</strong></RouterLink>
          </nav>

          <footer class="docs-footer">
            <p>{{ productDocConfig.productName }} Documentation</p>
            <p>Ver.{{ productDocConfig.currentVersion }}</p>
          </footer>
        </article>
      </main>

      <aside class="page-toc">
        <p>このページの内容</p>
        <nav>
          <button v-for="item in currentToc" :key="item.id" type="button" @click="jumpToHeading(item.id)">{{ item.label }}</button>
        </nav>
        <button class="to-top" type="button" @click="scrollToTop">ページ先頭へ △</button>
      </aside>
    </div>

    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div v-if="lightboxSrc" class="screenshot-lightbox" :style="themeStyle" role="dialog" aria-modal="true" :aria-label="lightboxAlt || '画像の拡大表示'" @click.self="closeLightbox">
          <button ref="lightboxCloseButton" type="button" aria-label="拡大表示を閉じる" @click="closeLightbox">×</button>
          <figure>
            <img :src="lightboxSrc" :alt="lightboxAlt" />
            <figcaption v-if="lightboxCaption">{{ lightboxCaption }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:global(html.product-docs-open) { background: var(--docs-bg, #0a0e11); scroll-padding-top: 90px; scrollbar-gutter: stable; }
:global(html.product-docs-open body) { background: var(--docs-bg, #0a0e11); color: var(--docs-text, #eef4f6); }
:global(html.product-docs-nav-open body) { overflow: hidden; }

.product-docs-shell { min-height: 100vh; background: var(--docs-bg); color: var(--docs-text); font-family: 'Yu Gothic UI', 'Hiragino Sans', 'Noto Sans JP', system-ui, sans-serif; }
button, input { color: inherit; font: inherit; }
.docs-header { position: sticky; z-index: 60; top: 0; display: flex; height: 64px; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid var(--docs-line); background: color-mix(in srgb, var(--docs-bg) 96%, transparent); backdrop-filter: blur(10px); }
.brand { display: flex; align-items: center; gap: 12px; color: var(--docs-text); text-decoration: none; }
.brand img { width: 30px; height: 30px; object-fit: contain; }
.brand strong { font-size: .92rem; }
.brand span { padding-left: 12px; border-left: 1px solid var(--docs-line); color: var(--docs-subtle); font-size: .72rem; }
.mobile-menu { display: none; }
.docs-layout { display: grid; width: 100%; max-width: 1350px; min-height: calc(100vh - 64px); margin: 0 auto; grid-template-columns: 270px minmax(0, 860px) 220px; }
.docs-sidebar { position: sticky; top: 64px; height: calc(100vh - 64px); padding: 22px 18px 30px; border-right: 1px solid var(--docs-line); background: var(--docs-bg); overflow-y: auto; }
.sidebar-search { display: grid; height: 38px; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--docs-line); border-radius: 5px; background: var(--docs-panel); color: var(--docs-subtle); grid-template-columns: auto 1fr auto; }
.sidebar-search:focus-within { border-color: var(--docs-line-bright); box-shadow: 0 0 0 2px color-mix(in srgb, var(--docs-accent) 12%, transparent); }
.sidebar-search input { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--docs-text); font-size: .72rem; }
.sidebar-search kbd { color: var(--docs-subtle); font-size: .58rem; }
.nav-group { margin-top: 24px; }
.nav-group h2, .search-results > p { margin: 0 8px 7px; color: var(--docs-subtle); font-size: .58rem; letter-spacing: .12em; }
.nav-group a { display: block; padding: 8px 10px; border-left: 2px solid transparent; color: var(--docs-muted); font-size: .72rem; text-decoration: none; }
.nav-group a:hover, .nav-group a:focus-visible, .nav-group a.active { border-left-color: var(--docs-accent); background: color-mix(in srgb, var(--docs-accent) 6%, transparent); color: var(--docs-text); outline: none; }
.search-results { display: grid; margin-top: 18px; }
.search-results a { display: grid; gap: 2px; padding: 9px 10px; border-bottom: 1px solid var(--docs-line); text-decoration: none; }
.search-results a span { color: var(--docs-accent); font-size: .58rem; }
.search-results a strong { color: var(--docs-text); font-size: .76rem; }
.search-results a small { display: -webkit-box; overflow: hidden; color: var(--docs-muted); font-size: .65rem; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.search-empty { padding: 20px 10px; color: var(--docs-muted); font-size: .72rem; text-align: center; }
.sidebar-version { display: flex; justify-content: space-between; align-items: baseline; margin-top: 28px; padding: 15px 8px 0; border-top: 1px solid var(--docs-line); color: var(--docs-subtle); font-size: .6rem; }
.sidebar-version strong { color: var(--docs-muted); font-weight: 500; }
.docs-content { min-width: 0; padding: 48px clamp(34px, 4vw, 64px) 60px; }
.docs-content > article { width: 100%; max-width: 760px; margin: 0 auto; }
.page-heading { margin-bottom: 28px; }
.breadcrumbs { display: flex; gap: 8px; margin-bottom: 18px; color: var(--docs-subtle); font-size: .68rem; }
.breadcrumbs i { font-style: normal; }
.page-heading h1 { margin: 0; font-size: clamp(2rem, 3vw, 2.55rem); line-height: 1.25; }
.page-lead { margin: 0 0 54px; color: var(--docs-muted); font-size: .92rem; line-height: 1.9; }
.doc-section { scroll-margin-top: 90px; padding-bottom: 58px; }
.doc-section + .doc-section { padding-top: 46px; border-top: 1px solid var(--docs-line); }
.eyebrow { margin: 0 0 7px; color: var(--docs-accent); font-size: .58rem; font-weight: 700; letter-spacing: .16em; }
.doc-section h2 { margin: 0 0 22px; font-size: 1.55rem; }
.doc-section p, .doc-section li { color: var(--docs-muted); font-size: .86rem; line-height: 1.9; }
.callout { margin-top: 22px; padding: 16px 18px; border-left: 2px solid var(--docs-accent); background: color-mix(in srgb, var(--docs-accent) 5%, transparent); }
.callout.warning { border-left-color: #f5da76; }
.callout p { margin: 6px 0 0; }
.doc-shot { margin: 28px 0 0; }
.doc-shot a { display: block; border: 1px solid var(--docs-line); background: #05070a; cursor: zoom-in; overflow: hidden; }
.doc-shot img { display: block; width: 100%; height: auto; }
.doc-shot figcaption { margin-top: 9px; color: var(--docs-subtle); font-size: .68rem; line-height: 1.75; }
.footer-nav { display: grid; margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--docs-line); gap: 12px; grid-template-columns: repeat(2, 1fr); }
.footer-nav a { display: grid; gap: 4px; padding: 14px 0; text-decoration: none; }
.footer-nav a.next { text-align: right; }
.footer-nav span { color: var(--docs-subtle); font-size: .6rem; }
.footer-nav strong { color: var(--docs-muted); font-size: .78rem; }
.docs-footer { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--docs-line); color: var(--docs-subtle); font-size: .65rem; }
.page-toc { position: sticky; top: 64px; height: calc(100vh - 64px); padding: 48px 18px; }
.page-toc > p { color: var(--docs-muted); font-size: .65rem; font-weight: 700; }
.page-toc nav { display: grid; }
.page-toc nav button, .to-top { padding: 5px 0 5px 14px; border: 0; background: transparent; color: var(--docs-subtle); text-align: left; font-size: .63rem; cursor: pointer; }
.page-toc nav button:hover, .to-top:hover { color: var(--docs-accent); }
.to-top { margin-top: 18px; }
.nav-backdrop { display: none; }
.screenshot-lightbox { position: fixed; z-index: 1000; display: grid; padding: 48px; background: rgb(0 0 0 / 88%); place-items: center; inset: 0; }
.screenshot-lightbox > button { position: fixed; top: 18px; right: 22px; width: 42px; height: 42px; border: 1px solid var(--docs-line-bright); background: var(--docs-bg); color: var(--docs-text); font-size: 1.4rem; cursor: pointer; }
.screenshot-lightbox figure { max-width: min(1500px, 94vw); max-height: 88vh; margin: 0; }
.screenshot-lightbox img { display: block; max-width: 100%; max-height: 82vh; object-fit: contain; }
.screenshot-lightbox figcaption { margin-top: 10px; color: #d9e1e4; font-size: .72rem; text-align: center; }
.lightbox-fade-enter-active, .lightbox-fade-leave-active { transition: opacity .16s ease; }
.lightbox-fade-enter-from, .lightbox-fade-leave-to { opacity: 0; }

@media (max-width: 1180px) {
  .docs-layout { max-width: 1110px; grid-template-columns: 250px minmax(0, 860px); }
  .page-toc { display: none; }
}

@media (max-width: 820px) {
  .docs-header { padding: 0 14px; }
  .mobile-menu { display: grid; width: 38px; height: 34px; align-content: center; gap: 4px; padding: 8px; border: 1px solid var(--docs-line); border-radius: 4px; background: var(--docs-panel); cursor: pointer; }
  .mobile-menu i { height: 1px; background: var(--docs-muted); }
  .docs-layout { display: block; max-width: none; }
  .nav-backdrop { position: fixed; z-index: 40; display: block; border: 0; background: rgb(2 5 7 / 72%); inset: 64px 0 0; }
  .docs-sidebar { position: fixed; z-index: 50; top: 64px; bottom: 0; left: 0; width: min(320px, 88vw); height: auto; border-right: 1px solid var(--docs-line-bright); box-shadow: 18px 0 56px rgb(0 0 0 / 42%); transform: translateX(-102%); transition: transform .2s ease; }
  .docs-sidebar.open { transform: translateX(0); }
  .docs-content { padding: 34px 28px 60px; }
}

@media (max-width: 600px) {
  .brand strong { font-size: .78rem; white-space: nowrap; }
  .brand span { display: none; }
  .docs-content { padding: 30px 18px 46px; }
  .page-heading h1 { font-size: 2.15rem; }
  .footer-nav { grid-template-columns: 1fr; }
  .footer-nav a.next { text-align: left; }
  .docs-footer { flex-direction: column; }
  .screenshot-lightbox { padding: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
}
</style>
