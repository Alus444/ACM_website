<template>
  <main class="pricing-page">
    <Pricing />
    <div class="contact-cta">
      <p class="cta-text">依頼・ご相談はこちらから</p>
      <RouterLink to="/contact" class="cta-btn">Contact &rarr;</RouterLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Pricing from '../components/sections/Pricing.vue'
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  padding-top: 6rem;
}

.contact-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 4rem 2rem 6rem;
  border-top: 1px solid var(--border);
}

.cta-text {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.cta-btn {
  display: inline-block;
  padding: 0.75rem 2.5rem;
  background: var(--accent);
  color: #080b12;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s, box-shadow 0.2s;
}

.cta-btn:hover {
  background: #33d4ff;
  box-shadow: 0 0 20px var(--accent-glow);
}
</style>
