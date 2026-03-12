<script setup lang="ts">
import PageHeader from '../components/layout/PageHeader.vue'
import { useMode } from '../composables/useMode'

const { isPro } = useMode()

const linksDefault = [
  {
    label: 'X (Twitter)',
    handle: '@Alus_ND',
    desc: 'DM でのお問い合わせはこちら',
    url: 'https://x.com/Alus_ND',
  },
  {
    label: 'Discord',
    handle: 'alus',
    desc: 'プロフィールページを開く',
    url: 'https://discord.com/users/329990768670408714',
  },
  {
    label: 'Email',
    handle: 'alus@ac-md.com',
    desc: 'メールでのお問い合わせ',
    url: 'mailto:alus@ac-md.com',
  },
]

const linksPro = [
  {
    label: 'Email',
    handle: 'azc@ac-md.com',
    desc: 'メールでのお問い合わせ',
    url: 'mailto:azc@ac-md.com',
  },
]

const links = isPro ? linksPro : linksDefault
</script>

<template>
  <main class="contact-page">
    <div class="page-inner">
      <PageHeader label="Contact" title="連絡先" />
      <div class="contact-grid">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener"
          class="contact-card"
        >
          <div class="card-body">
            <p class="card-label">{{ link.label }}</p>
            <p class="card-handle">{{ link.handle }}</p>
            <p class="card-desc">{{ link.desc }}</p>
          </div>
          <span class="card-arrow">&rarr;</span>
        </a>
      </div>

      <p class="note">
        <template v-if="isPro">ご依頼・ご相談はメールにてお気軽にお問い合わせください。</template>
        <template v-else>お仕事の依頼は Twitter の DM が一番確認しやすいです。</template>
      </p>
    </div>
  </main>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  padding: 8rem 2rem 6rem;
}

.page-inner {
  max-width: 640px;
  margin: 0 auto;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem 1.75rem;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}


.contact-card:hover {
  border-color: rgba(0, 200, 255, 0.4);
  box-shadow: 0 4px 20px rgba(0, 200, 255, 0.08);
  transform: translateY(-2px);
}

.card-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 0.3rem;
}

.card-handle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

.card-arrow {
  font-size: 0.85rem;
  color: var(--accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.note {
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
</style>
