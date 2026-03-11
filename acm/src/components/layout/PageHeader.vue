<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  label: string
  title: string
}>()

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 80
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- 通常ヘッダー -->
  <div class="page-header">
    <div class="page-header-main">
      <p class="page-label">{{ label }}</p>
      <h1 class="page-title">{{ title }}</h1>
    </div>
    <div v-if="$slots.default" class="page-header-extra">
      <slot />
    </div>
  </div>

  <!-- スクロール時の固定ミニバー -->
  <Teleport to="body">
    <div class="page-mini-bar" :class="{ visible: scrolled }">
      <div class="page-mini-inner">
        <span class="page-mini-label">{{ label }}</span>
        <span class="page-mini-title">{{ title }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* --- 通常ヘッダー --- */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding: 1.25rem 0;
}

.page-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.5rem;
}

.page-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-header-extra {
  padding-bottom: 0.25rem;
}

/* --- ミニバー (fixed, 全幅) --- */
.page-mini-bar {
  position: fixed;
  top: 4.5rem;
  left: 0;
  right: 0;
  z-index: 90;
  background: rgba(8, 11, 18, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0.6rem 2rem;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
}

.page-mini-bar.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.page-mini-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.page-mini-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
}

.page-mini-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
