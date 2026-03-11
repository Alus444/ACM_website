<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

      <nav class="nav">
        <RouterLink to="/" class="nav-link">Top</RouterLink>
        <RouterLink to="/movie" class="nav-link">MOVIE</RouterLink>
        <RouterLink to="/booth" class="nav-link">BOOTH</RouterLink>
        <RouterLink to="/pricing" class="nav-link">Commission</RouterLink>
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
  padding: 1.2rem 2rem;
  transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
  border-bottom: 1px solid transparent;
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
</style>
