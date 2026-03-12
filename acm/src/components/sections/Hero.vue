<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { profile } from '../../data/profile'
import { profilePro } from '../../data/profile-pro'
import { useMode } from '../../composables/useMode'

const { isPro } = useMode()
const activeProfile = isPro ? profilePro : profile
</script>

<template>
  <section id="hero" class="hero">
    <div class="hero-bg">
      <div class="hero-grid"></div>
      <div class="hero-glow"></div>
    </div>

    <div class="hero-inner">
      <!-- 左：アバター画像 -->
      <div class="hero-avatar-wrap">
        <div class="hero-avatar-frame">
          <img
            v-if="profile.avatarUrl"
            :src="profile.avatarUrl"
            :alt="profile.name"
            class="hero-avatar-img"
          />
          <div v-else class="hero-avatar-placeholder">
            <span>{{ profile.name.charAt(0) }}</span>
          </div>
        </div>
        <div class="hero-avatar-glow"></div>
      </div>

      <!-- 右：テキスト -->
      <div class="hero-content">
        <p class="hero-handle">{{ activeProfile.handle }}</p>
        <h1 class="hero-name" :class="{ 'hero-name--pro': isPro }">{{ activeProfile.name }}</h1>

        <p class="hero-bio">
          <span v-for="(line, i) in activeProfile.bio.split('\n')" :key="i">
            {{ line }}<br v-if="i < activeProfile.bio.split('\n').length - 1" />
          </span>
        </p>

        <div class="hero-skills">
          <span v-for="skill in activeProfile.skills" :key="skill" class="skill-tag">{{ skill }}</span>
        </div>

        <div class="hero-actions">
          <a
            v-if="!isPro && activeProfile.social.twitter"
            :href="activeProfile.social.twitter"
            target="_blank"
            rel="noopener"
            class="btn btn--primary"
          >
            X (Twitter)
          </a>
          <RouterLink v-if="isPro" to="/contact" class="btn btn--primary">お問い合わせ</RouterLink>
          <RouterLink v-else to="/pricing" class="btn btn--outline">依頼・料金</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 6rem 2rem 4rem;
}

/* --- Background --- */
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 200, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 700px;
  background: radial-gradient(ellipse, rgba(0, 200, 255, 0.06) 0%, transparent 65%);
}

/* --- 2カラムレイアウト --- */
.hero-inner {
  position: relative;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;
}

/* --- アバター --- */
.hero-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.hero-avatar-frame {
  width: 340px;
  height: 340px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border);
  position: relative;
  z-index: 1;
}

.hero-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.hero-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary), #0d1f33);
  font-size: 5rem;
  font-weight: 700;
  color: var(--border);
}

.hero-avatar-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 200, 255, 0.12) 0%, transparent 70%);
  z-index: 0;
}

/* --- テキスト --- */
.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-handle {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--accent);
  margin: 0 0 0.75rem;
}

.hero-name {
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
  line-height: 1.1;
}

.hero-name--pro {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

.hero-bio {
  font-size: 1rem;
  line-height: 1.85;
  color: var(--text-secondary);
  margin: 0 0 1.75rem;
}

.hero-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.skill-tag {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  padding: 0.3rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.7rem 1.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: all 0.2s;
}

.btn--primary {
  background: var(--accent);
  color: #080b12;
}

.btn--primary:hover {
  background: #33d4ff;
  box-shadow: 0 0 20px var(--accent-glow);
}

.btn--outline {
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.btn--outline:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* --- レスポンシブ --- */
@media (max-width: 768px) {
  .hero-inner {
    flex-direction: column;
    text-align: center;
    gap: 2.5rem;
  }

  .hero-avatar-frame {
    width: 220px;
    height: 220px;
  }

  .hero-skills,
  .hero-actions {
    justify-content: center;
  }
}
</style>
