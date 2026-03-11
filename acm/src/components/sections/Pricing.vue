<script setup lang="ts">
import { priceCategories, commissionNotes } from '../../data/commission'
</script>

<template>
  <section id="pricing" class="pricing-section">
    <div class="section-inner">
      <div class="section-header">
        <p class="section-label">Commission</p>
        <h2 class="section-title">料金表</h2>
      </div>

      <!-- 料金カード -->
      <div class="price-grid">
        <div v-for="cat in priceCategories" :key="cat.name" class="price-card">
          <h3 class="price-cat-name">{{ cat.name }}</h3>
          <ul class="price-list">
            <template v-for="(opt, i) in cat.options" :key="opt.label">
              <li v-if="cat.name === '3DCG' && i === 3 && cat.options[i].note" class="notes-inline">
                <p class="price-note">{{ cat.options[i].note }}</p>
              </li>
              <li class="price-row">
                <div class="price-row-main">
                  <span class="price-label">{{ opt.label }}</span>
                  <span class="price-value">{{ opt.price }}</span>
                </div>
              </li>
            </template>
          </ul>
          <ul v-if="cat.notes" class="cat-notes">
            <li v-for="note in cat.notes" :key="note">{{ note }}</li>
            <li v-if="cat.contactLink">
              <RouterLink to="/contact" class="cat-contact-link">Contact よりお気軽にどうぞ →</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 注意事項 -->
      <div class="notes-block">
        <h3 class="notes-title">注意事項</h3>
        <ol class="notes-list">
          <li v-for="(note, i) in commissionNotes" :key="i" class="notes-item">{{ note }}</li>
        </ol>
      </div>

    </div>
  </section>
</template>

<style scoped>
.pricing-section {
  padding: 6rem 2rem;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 3rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.5rem;
}

.section-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* --- Price grid --- */
.price-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.price-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.75rem;
}

.price-cat-name {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.price-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.price-row-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.price-label {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.price-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}

.price-note {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0.4rem 0 0;
  padding-left: 0.5rem;
  border-left: 2px solid var(--border);
}

/* --- Category notes --- */
.cat-notes {
  list-style: none;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cat-notes li {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.cat-contact-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.78rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.cat-contact-link:hover {
  opacity: 1;
}

/* --- Notes inline (リクエストのnote) --- */
.notes-inline {
  list-style: none;
  padding: 0.5rem 0 0;
}

/* --- Notes block (注意事項) --- */
.notes-block {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.75rem;
}

.notes-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.notes-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  counter-reset: notes-counter;
}

.notes-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.7;
  display: flex;
  gap: 0.75rem;
  counter-increment: notes-counter;
}

.notes-item::before {
  content: counter(notes-counter) '.';
  color: var(--accent);
  font-weight: 600;
  font-size: 0.8rem;
  min-width: 1.2rem;
  margin-top: 0.1rem;
}
</style>
