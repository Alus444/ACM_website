<script setup lang="ts">
import { works } from '../../data/works'
</script>

<template>
  <section id="gallery" class="gallery-section">
    <div class="section-inner">
      <div class="section-header">
        <p class="section-label">Works</p>
        <h2 class="section-title">制作実績</h2>
      </div>

      <div class="works-grid">
        <article v-for="work in works" :key="work.id" class="work-card">
          <div class="work-image">
            <img
              :src="work.imageUrl"
              :alt="work.title"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div class="work-image-placeholder">
              <span>{{ work.title.charAt(0) }}</span>
            </div>
          </div>

          <div class="work-body">
            <div class="work-meta">
              <span class="work-year">{{ work.year }}</span>
              <div class="work-tags">
                <span v-for="tag in work.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <h3 class="work-title">{{ work.title }}</h3>
            <p class="work-desc">{{ work.description }}</p>
            <div v-if="work.software" class="work-software">
              <span v-for="sw in work.software" :key="sw" class="software-chip">{{ sw }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-section {
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

/* --- Grid --- */
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* --- Card --- */
.work-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.work-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 200, 255, 0.1);
}

/* --- Image --- */
.work-image {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--bg-secondary);
  overflow: hidden;
}

.work-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: var(--border);
  background: linear-gradient(135deg, var(--bg-secondary), #0d1f33);
}

/* --- Body --- */
.work-body {
  padding: 1.25rem;
}

.work-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.work-year {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.work-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-secondary);
}

.work-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.work-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 1rem;
}

.work-software {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.software-chip {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  background: rgba(0, 200, 255, 0.08);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 4px;
  color: var(--accent);
}
</style>
