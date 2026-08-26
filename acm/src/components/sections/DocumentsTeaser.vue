<template>
  <section class="documents-teaser" aria-labelledby="documents-teaser-title">
    <div class="section-inner">
      <RouterLink to="/docs" target="_blank" rel="noopener" class="documents-panel">
        <div class="documents-copy">
          <p class="section-label">Documents</p>
          <h2 id="documents-teaser-title" class="section-title">制作物のドキュメント</h2>
          <p class="section-description">公開中の制作物について、導入方法や使い方、仕様をまとめています。</p>
        </div>
        <span class="documents-link">ドキュメント一覧を見る <span aria-hidden="true">&rarr;</span></span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.documents-teaser {
  padding: 1rem 2rem 6rem;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.documents-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem 2.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background:
    linear-gradient(100deg, rgba(0, 200, 255, 0.07), transparent 48%),
    var(--bg-card);
  transition: border-color 0.2s, background-color 0.2s;
}

.documents-panel:hover {
  border-color: rgba(0, 200, 255, 0.42);
}

.documents-copy {
  min-width: 0;
}

.section-label {
  margin: 0 0 0.45rem;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.3;
}

.section-description {
  margin: 0.75rem 0 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.documents-link {
  flex: 0 0 auto;
  color: var(--accent);
  font-size: 0.86rem;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .documents-teaser {
    padding: 0 1rem 4rem;
  }

  .documents-panel {
    align-items: flex-start;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
  }

  .section-description {
    font-size: 0.85rem;
  }
}
</style>
