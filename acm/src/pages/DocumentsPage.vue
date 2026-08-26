<script setup lang="ts">
import PageHeader from '../components/layout/PageHeader.vue'
import { documentationItems } from '../data/documents'
</script>

<template>
  <main class="documents-page">
    <div class="page-inner">
      <PageHeader label="Documents" title="制作物のドキュメント" />

      <div class="documents-grid">
        <RouterLink
          v-for="item in documentationItems"
          :key="item.id"
          :to="item.path"
          target="_blank"
          rel="noopener"
          class="document-card"
        >
          <div class="document-image">
            <div class="document-image-placeholder" aria-hidden="true">
              <span>▧</span>
            </div>
            <img
              :src="item.imageUrl"
              :alt="item.imageAlt"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <p class="document-category">{{ item.category }}</p>
          </div>
          <div class="document-body">
            <h2 class="document-title">{{ item.title }}</h2>
            <p class="document-description">{{ item.description }}</p>
            <span class="document-link">ドキュメントを開く <span aria-hidden="true">▷</span></span>
          </div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.documents-page {
  min-height: 100vh;
  padding: 8rem 2rem 6rem;
}

.page-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.document-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: inherit;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  text-decoration: none;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.document-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 200, 255, 0.1);
}

.document-image {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.document-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.document-card:hover .document-image img {
  transform: scale(1.04);
}

.document-image-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d1117, #0d1f33);
}

.document-image-placeholder span {
  color: var(--border);
  font-size: 3rem;
}

.document-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.25rem;
}

.document-category {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  margin: 0;
  padding: 0.25rem 0.6rem;
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 4px;
  background: rgba(8, 11, 18, 0.75);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.document-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}

.document-description {
  flex: 1;
  margin: 0.5rem 0 1rem;
  color: var(--text-secondary);
  font-size: 0.82rem;
  line-height: 1.7;
}

.document-link {
  align-self: flex-end;
  margin-top: auto;
  color: var(--text-secondary);
  font-size: 0.78rem;
  transition: color 0.2s;
}

.document-link span {
  user-select: none;
}

.document-card:hover .document-link {
  color: var(--accent);
}

@media (max-width: 700px) {
  .documents-page {
    padding: 7rem 1rem 4rem;
  }

  .documents-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
