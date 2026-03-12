<template>
  <main class="pricing-page">
    <div class="form-section">
      <div class="page-inner">
        <div class="form-header">
          <p class="form-label">COMMISSION</p>
          <div class="form-title-row">
            <h1 class="form-title">依頼フォーム</h1>
            <a href="#pricing" class="to-pricing-btn">料金表を見る ↓</a>
          </div>
        </div>
        <div class="form-wrap">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSevT6QxVV6c3iWibZK8_5dfAWEUBa7B2gsd9xUiuPiDXcvIIg/viewform?embedded=true"
            width="100%"
            height="900"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
          >読み込んでいます…</iframe>
        </div>
      </div>
    </div>
    <div id="pricing">
      <Pricing />
    </div>
  </main>

  <Teleport to="body">
    <div class="page-mini-bar" :class="{ visible: scrolled }">
      <div class="page-mini-inner">
        <span class="page-mini-label">COMMISSION</span>
        <span class="page-mini-title">依頼フォーム</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Pricing from '../components/sections/Pricing.vue'

const scrolled = ref(false)
function onScroll() { scrolled.value = window.scrollY > 80 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
}

.form-section {
  padding: 6rem 2rem 6rem;
}

.page-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 2.5rem;
  padding: 1.25rem 0;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.5rem;
}

.form-title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.to-pricing-btn {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.to-pricing-btn:hover {
  background: var(--accent);
  color: #080b12;
}

.form-wrap {
  max-width: 800px;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-card);
}

.form-wrap iframe {
  display: block;
  width: 100%;
}

.page-mini-bar {
  position: fixed;
  top: 5.2rem;
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
