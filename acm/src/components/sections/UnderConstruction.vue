<script setup lang="ts">
import { profile } from '../../data/profile'
</script>

<template>
  <div class="uc-wrap">
    <div class="uc-bg">
      <div class="uc-grid"></div>
      <div class="uc-glow"></div>
    </div>

    <div class="uc-content">
      <p class="uc-label">[ SITE UNDER CONSTRUCTION ]</p>
      <h1 class="uc-name">{{ profile.name }}</h1>
      <p class="uc-handle">{{ profile.handle }}</p>
      <p class="uc-message">ただいまサイトを準備中です。<br>もうしばらくお待ちください。</p>

      <div class="uc-links">
        <a
          v-if="profile.social.twitter"
          :href="profile.social.twitter"
          target="_blank"
          rel="noopener"
          class="uc-link"
        >
          X (Twitter)
        </a>
        <a
          v-if="profile.social.booth"
          :href="profile.social.booth"
          target="_blank"
          rel="noopener"
          class="uc-link"
        >
          BOOTH
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uc-wrap {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.uc-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.uc-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 200, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.uc-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(ellipse, rgba(0, 200, 255, 0.08) 0%, transparent 70%);
}

.uc-content {
  position: relative;
  text-align: center;
  padding: 2rem;
}

.uc-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: var(--accent);
  margin: 0 0 2rem;
}

.uc-name {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  line-height: 1;
}

.uc-handle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  letter-spacing: 0.1em;
  margin: 0 0 2rem;
}

.uc-message {
  font-size: 1rem;
  line-height: 1.9;
  color: var(--text-secondary);
  margin: 0 0 2.5rem;
}

.uc-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.uc-link {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 0.6rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}

.uc-link:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
