<script setup lang="ts">
import { profile } from '../../data/profile'
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-name">{{ profile.name }}</p>
      <div class="footer-links">
        <a v-if="profile.social.twitter" :href="profile.social.twitter" target="_blank" rel="noopener" class="footer-link">
          X (Twitter)
        </a>
        <a v-if="profile.social.booth" :href="profile.social.booth" target="_blank" rel="noopener" class="footer-link">
          BOOTH
        </a>
      </div>
      <p class="footer-copy">&copy; {{ new Date().getFullYear() }} {{ profile.name }}. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  padding: 3rem 2rem;
  text-align: center;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.08em;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--accent);
}

.footer-copy {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.5;
  margin: 0;
}
</style>
