<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMode } from '../../composables/useMode'

const { isPro } = useMode()
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header :class="['site-header', { scrolled }]">
    <div class="header-inner">
      <RouterLink to="/" class="logo">
        <img src="/images/ACMLogo.svg" alt="ACM" class="logo-img" />
      </RouterLink>

      <nav class="nav" aria-label="メインナビゲーション">
        <RouterLink to="/" class="nav-link">Top</RouterLink>
        <RouterLink to="/booth" class="nav-link">BOOTH</RouterLink>
        <RouterLink to="/movie" class="nav-link">MOVIE</RouterLink>
        <RouterLink v-if="isPro" to="/works" class="nav-link">Works</RouterLink>
        <RouterLink v-else to="/pricing" class="nav-link">Commission</RouterLink>
        <RouterLink to="/contact" class="nav-link">Contact</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1.6rem 2rem;
  transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
  border-bottom: 1px solid var(--border);
  background: rgba(8, 11, 18, 0.85);
  backdrop-filter: blur(12px);
}

.site-header.scrolled {
  background: rgba(8, 11, 18, 0.85);
  backdrop-filter: blur(12px);
  border-color: var(--border);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 2rem;
  width: auto;
  display: block;
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.4rem 1rem;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: color 0.2s, border-color 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.router-link-exact-active {
  color: var(--accent);
  border-color: var(--accent);
}

@media (max-width: 768px) {
  .site-header {
    padding: 0.75rem 1rem 0.65rem;
  }

  .header-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 0.45rem;
  }

  .logo {
    align-self: flex-start;
  }

  .logo-img {
    height: 1.5rem;
  }

  .nav {
    width: 100%;
    min-width: 0;
    justify-content: space-between;
    gap: 0.35rem;
    overflow-x: auto;
    scrollbar-width: none;
    overscroll-behavior-inline: contain;
  }

  .nav::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    flex: 0 0 auto;
    padding: 0.3rem 0.5rem;
    font-size: 0.74rem;
  }
}

@media (max-width: 360px) {
  .nav {
    gap: 0.2rem;
  }

  .nav-link {
    padding-inline: 0.25rem;
    font-size: 0.67rem;
  }
}
</style>
