<script setup lang="ts">
import { ref, computed } from 'vue'
import { boothItems } from '../data/booth'

const activeCategory = ref('すべて')

const SPECIAL_TAGS = ['監修', 'コラボ']

const ownItems = computed(() => boothItems.filter(item => !SPECIAL_TAGS.some(t => item.tags?.includes(t))))
const supervisedItems = computed(() => boothItems.filter(item => item.tags?.includes('監修')))
const collaboItems = computed(() => boothItems.filter(item => item.tags?.includes('コラボ')))

const ownCategories = computed(() => {
  const cats = [...new Set(ownItems.value.map(item => item.category))]
  return ['すべて', ...cats]
})

const showSupervised = computed(() => activeCategory.value === '監修')
const showCollab = computed(() => activeCategory.value === 'コラボ')
const showOwn = computed(() => !showSupervised.value && !showCollab.value)

const filtered = computed(() =>
  activeCategory.value === 'すべて'
    ? ownItems.value
    : ownItems.value.filter(item => item.category === activeCategory.value)
)

function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`
}
</script>

<template>
  <main class="booth-page">
    <div class="page-inner">
      <div class="page-header">
        <p class="page-label">BOOTH</p>
        <h1 class="page-title">販売中の商品</h1>
        <a href="https://alushop.booth.pm/" target="_blank" rel="noopener" class="shop-link">
          ショップを見る &rarr;
        </a>
      </div>

      <!-- フィルターバー -->
      <div class="filter-area">
        <!-- カテゴリ行 -->
        <div class="filter-bar">
          <button
            v-for="cat in ownCategories"
            :key="cat"
            :class="['filter-btn', { active: activeCategory === cat }]"
            @click="activeCategory = cat"
          >
            {{ cat }}
            <span class="filter-count">
              {{ cat === 'すべて' ? ownItems.length : ownItems.filter(i => i.category === cat).length }}
            </span>
          </button>
        </div>

        <!-- 監修・コラボ行（あるときだけ表示） -->
        <div v-if="supervisedItems.length > 0 || collaboItems.length > 0" class="filter-bar filter-bar--supervised">
          <button
            v-if="supervisedItems.length > 0"
            :class="['filter-btn', 'filter-btn--supervised', { active: showSupervised }]"
            @click="activeCategory = '監修'"
          >
            監修作品
            <span class="filter-count">{{ supervisedItems.length }}</span>
          </button>
          <button
            v-if="collaboItems.length > 0"
            :class="['filter-btn', 'filter-btn--supervised', { active: showCollab }]"
            @click="activeCategory = 'コラボ'"
          >
            コラボ
            <span class="filter-count">{{ collaboItems.length }}</span>
          </button>
        </div>
      </div>

      <!-- 自分の商品グリッド -->
      <template v-if="showOwn">
        <div class="booth-grid">
          <a
            v-for="item in filtered"
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
        <p v-if="filtered.length === 0" class="empty">該当する作品がありません</p>
      </template>

      <!-- 監修グリッド -->
      <template v-else-if="showSupervised">
        <div class="booth-grid">
          <a
            v-for="item in supervisedItems"
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
      </template>

      <!-- コラボグリッド -->
      <template v-else-if="showCollab">
        <div class="booth-grid">
          <a
            v-for="item in collaboItems"
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
      </template>
    </div>
  </main>
</template>

<style scoped>
.booth-page {
  min-height: 100vh;
  padding: 8rem 2rem 6rem;
}

.page-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2.5rem;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0;
  width: 100%;
}

.page-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.shop-link {
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
  margin-left: auto;
}

.shop-link:hover {
  opacity: 1;
}

/* --- Filter --- */
.filter-area {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 2.5rem;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 0;
}

.filter-bar--supervised {
  border-top: 1px solid var(--border);
  align-items: center;
}

.supervised-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-secondary);
  opacity: 0.6;
  margin-right: 0.25rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: rgba(0, 200, 255, 0.4);
  color: var(--text-primary);
}

.filter-btn.active {
  background: rgba(0, 200, 255, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}

/* 監修タブは点線ボーダーで差別化 */
.filter-btn--supervised {
  border-style: dashed;
}

.filter-count {
  font-size: 0.75rem;
  opacity: 0.7;
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
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  background: rgba(8, 11, 18, 0.75);
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 4px;
  color: var(--accent);
}

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
}

.booth-cta {
  font-size: 0.78rem;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.booth-card:hover .booth-cta {
  color: var(--accent);
}

.empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 4rem 0;
}
</style>
