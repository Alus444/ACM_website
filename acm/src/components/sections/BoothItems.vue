<script setup lang="ts">
import { computed } from 'vue'
import { boothItems } from '../../data/booth'

const preview = computed(() => boothItems.slice(0, 3))

function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`
}
</script>

<template>
  <section id="booth" class="booth-section">
    <div class="section-inner">
      <div class="section-header">
        <p class="section-label">BOOTH</p>
        <h2 class="section-title">販売中の商品</h2>
        <RouterLink to="/booth" class="more-link">すべて見る &rarr;</RouterLink>
      </div>

      <div class="booth-grid">
        <a
          v-for="item in preview"
          :key="item.id"
          :href="item.boothUrl"
          target="_blank"
          rel="noopener"
          class="booth-card"
        >
          <div class="booth-image">
            <div class="booth-image-placeholder">
              <span class="placeholder-icon">&#9635;</span>
            </div>
            <img
              :src="item.imageUrl"
              :alt="item.title"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span class="booth-category">{{ item.category }}</span>
          </div>

          <div class="booth-body">
            <h3 class="booth-title">{{ item.title }}</h3>
            <p class="booth-desc">{{ item.description }}</p>
            <div class="booth-footer">
              <span class="booth-price">{{ formatPrice(item.price) }}</span>
              <span class="booth-cta">BOOTH で見る &rarr;</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booth-section {
  padding: 6rem 2rem;
  background: var(--bg-secondary);
  position: relative;
}

.booth-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.3;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 3rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem 1.5rem;
}

.more-link {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
  align-self: flex-end;
}

.more-link:hover {
  opacity: 1;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.5rem;
  width: 100%;
}

.section-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* --- Grid --- */
.booth-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* --- Card --- */
.booth-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.booth-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 200, 255, 0.1);
}

/* --- Image --- */
.booth-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--bg-primary);
  overflow: hidden;
}

.booth-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.booth-card:hover .booth-image img {
  transform: scale(1.04);
}

.booth-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d1117, #0d1f33);
}

.placeholder-icon {
  font-size: 3rem;
  color: var(--border);
}

.booth-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  background: rgba(8, 11, 18, 0.75);
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 4px;
  color: var(--accent);
}

/* --- Body --- */
.booth-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
}

.booth-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.booth-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 1rem;
  flex: 1;
}

.booth-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.booth-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.booth-cta {
  font-size: 0.78rem;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.booth-card:hover .booth-cta {
  color: var(--accent);
}
</style>
