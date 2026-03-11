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
      <a href="#hero" class="logo">
        <span class="logo-bracket">[</span>
        ACM
        <span class="logo-bracket">]</span>
      </a>

      <nav class="nav">
        <a href="#gallery" class="nav-link">Works</a>
        <a href="#booth" class="nav-link">BOOTH</a>
        <a href="#pricing" class="nav-link nav-link--accent">Commission</a>
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
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-primary);
  text-decoration: none;
}

.logo-bracket {
  color: var(--accent);
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
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link--accent {
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.4rem 1rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.nav-link--accent:hover {
  background: var(--accent);
  color: #080b12;
}
</style>
