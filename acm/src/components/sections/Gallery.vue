<script setup lang="ts">
import { computed } from 'vue'
import { movies, sortMoviesByDateDesc } from '../../data/movies'
import type { Movie } from '../../types'

const topMovieIds = ['Kq8p2Q2kHfg', 'mCjloHCSG9I', '2UixFWiWShc']

const preview = computed(() => {
  const topMovies = topMovieIds
    .map(id => movies.find(movie => movie.youtubeId === id))
    .filter((movie): movie is Movie => Boolean(movie))

  return sortMoviesByDateDesc(topMovies)
})
</script>

<template>
  <section id="movie" class="movie-section">
    <div class="section-inner">
      <div class="section-header">
        <p class="section-label">Movie</p>
        <h2 class="section-title">制作した動画</h2>
        <RouterLink to="/movie" class="more-link">すべて見る &rarr;</RouterLink>
      </div>

      <div class="movie-grid">
        <a
          v-for="movie in preview"
          :key="movie.youtubeId"
          :href="`https://www.youtube.com/watch?v=${movie.youtubeId}`"
          target="_blank"
          rel="noopener"
          class="movie-card"
        >
          <div class="movie-thumb">
            <img
              :src="movie.thumbnailUrl ?? `https://img.youtube.com/vi/${movie.youtubeId}/maxresdefault.jpg`"
              :alt="movie.title"
              loading="lazy"
              @error="($event.target as HTMLImageElement).src = `https://img.youtube.com/vi/${movie.youtubeId}/hqdefault.jpg`"
            />
            <div class="play-overlay">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="movie-body">
            <div class="movie-meta" v-if="movie.year || (movie.tags && movie.tags.length)">
              <span v-if="movie.year" class="movie-year">{{ movie.year }}</span>
              <div v-if="movie.tags && movie.tags.length" class="movie-tags">
                <span v-for="tag in movie.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <h3 class="movie-title">{{ movie.title }}</h3>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.movie-section {
  padding: 6rem 2rem;
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

/* --- Grid --- */
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* --- Card --- */
.movie-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.movie-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 200, 255, 0.1);
}

/* --- Thumbnail --- */
.movie-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--bg-secondary);
  overflow: hidden;
}

.movie-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.movie-card:hover .movie-thumb img {
  transform: scale(1.03);
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.25s;
}

.movie-card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 2.5rem;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 200, 255, 0.6);
  line-height: 1;
}

/* --- Body --- */
.movie-body {
  padding: 1.25rem;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.movie-year {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.movie-tags {
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

.movie-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .movie-section {
    padding-inline: 1rem;
  }

  .movie-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
