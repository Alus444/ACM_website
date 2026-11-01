<template>
  <section class="portfolio-links" aria-label="制作実績と公開作品">
    <div class="portfolio-grid">
      <RouterLink to="/works" class="portfolio-link portfolio-link--featured">
        <div class="portfolio-copy">
          <p class="portfolio-label">WORKS</p>
          <h2 class="portfolio-title">実績・経歴</h2>
          <p class="portfolio-description">これまでの制作実績と職歴をまとめています。</p>
        </div>
        <span class="portfolio-arrow" aria-hidden="true">&rarr;</span>
      </RouterLink>

      <RouterLink to="/movie" class="portfolio-link">
        <div class="portfolio-copy">
          <p class="portfolio-label">MOVIE</p>
          <h2 class="portfolio-title">制作した動画</h2>
          <p class="portfolio-description">制作に携わった動画を紹介しています。</p>
        </div>
        <span class="portfolio-arrow" aria-hidden="true">&rarr;</span>
      </RouterLink>

      <RouterLink to="/booth" class="portfolio-link">
        <div class="portfolio-copy">
          <p class="portfolio-label">BOOTH</p>
          <h2 class="portfolio-title">販売中の商品</h2>
          <p class="portfolio-description">販売中の商品を紹介しています。</p>
        </div>
        <span class="portfolio-arrow" aria-hidden="true">&rarr;</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.portfolio-links {
  padding: 1rem 2rem 2.5rem;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.portfolio-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  min-width: 0;
  padding: 1.5rem 2rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  transition: border-color 0.2s, background-color 0.2s;
}

.portfolio-link--featured {
  grid-column: 1 / -1;
  padding: 2rem 2.25rem;
  background:
    linear-gradient(100deg, rgba(0, 200, 255, 0.09), transparent 65%),
    var(--bg-card);
}

.portfolio-link:hover {
  border-color: rgba(0, 200, 255, 0.5);
  background-color: #142033;
}

.portfolio-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.portfolio-copy {
  min-width: 0;
}

.portfolio-label {
  margin: 0 0 0.4rem;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
}

.portfolio-title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.2rem, 2.2vw, 1.55rem);
  line-height: 1.4;
}

.portfolio-link--featured .portfolio-title {
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.portfolio-description {
  margin: 0.6rem 0 0;
  color: #a5b2c9;
  font-size: 0.9rem;
  line-height: 1.8;
}

.portfolio-arrow {
  flex: 0 0 auto;
  color: var(--accent);
  font-size: 1.5rem;
}

@media (max-width: 640px) {
  .portfolio-links {
    padding: 0 1rem 2rem;
  }

  .portfolio-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .portfolio-link,
  .portfolio-link--featured {
    gap: 1rem;
    padding: 1.4rem;
  }

  .portfolio-link--featured {
    padding-block: 1.75rem;
  }

  .portfolio-description {
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-link {
    transition: none;
  }
}
</style>
