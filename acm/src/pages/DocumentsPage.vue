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
            <img :src="item.imageUrl" :alt="`${item.title}の画面`" loading="lazy" />
          </div>
          <div class="document-body">
            <p class="document-category">{{ item.category }}</p>
            <h2 class="document-title">{{ item.title }}</h2>
            <p class="document-description">{{ item.description }}</p>
            <span class="document-link">ドキュメントを開く <span aria-hidden="true">&rarr;</span></span>
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.document-card {
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  color: inherit;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.document-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 200, 255, 0.1);
}

.document-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.document-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.document-card:hover .document-image img {
  transform: scale(1.02);
}

.document-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.5rem;
}

.document-category {
  margin: 0 0 0.5rem;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.document-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  line-height: 1.35;
}

.document-description {
  margin: 0.8rem 0 1.5rem;
  color: var(--text-secondary);
  font-size: 0.87rem;
  line-height: 1.8;
}

.document-link {
  margin-top: auto;
  color: var(--accent);
  font-size: 0.82rem;
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
