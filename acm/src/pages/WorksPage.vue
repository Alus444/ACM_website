<script setup lang="ts">
import PageHeader from '../components/layout/PageHeader.vue'

const career = [
  {
    period: '2022.05 — 現在',
    role: '映像編集・制作統括',
    org: '株式会社ゴービヨンドネクスト（業務委託）',
    items: [
      '映像制作全般の統括・制作進行管理・クオリティ管理',
      '撮影手配・ディレクション・編集業務',
      '東京MX「ビジネスタイガーサミット(前期)」ディレクター（2024年）',
    ],
  },
  {
    period: '2023.04 — 現在',
    role: '専門講師',
    org: '高等学校（業務委託）',
    items: [
      '担当科目: 3DCGソフト「MAYA」、ゲームエンジン「Unity」',
      'モデリング・アニメーション基礎・ゲーム制作の指導',
    ],
  },
  {
    period: '2021.04 — 2021.12',
    role: '3DCGクリエイター',
    org: '株式会社クリープ',
    items: [
      'アニメ・ゲーム背景モデル制作',
      'CGLO制作（コンテを元にした映像作業）',
      '自社Vtuberモデル調整・配信セットアップ補助',
    ],
  },
  {
    period: '2020.10 — 現在',
    role: '3DCGクリエイター',
    org: 'フリーランス（業務委託）',
    items: [
      'オリジナル3DCGモデル制作（モデリング・リギング・テクスチャリング）',
      'Vtuber向けモデル調整・最適化・配信環境導入',
    ],
  },
]

const projects = [
  { year: '2025', client: 'Canon', desc: 'Vket2025 Summer カメラモデル制作' },
  { year: '2024', client: 'Canon', desc: 'Vket2024 Winter カメラモデル制作' },
  { year: '2024', client: '東京MX', desc: '「ビジネスタイガーサミット(前期)」CM・番組映像制作' },
  { year: '2024', client: '高知県北川村', desc: 'PR用動画 撮影・編集' },
  { year: '2023', client: 'YouTube', desc: 'チャンネル登録者数13万人向け動画 撮影・編集・ディレクション' },
  { year: '2022', client: 'docomo', desc: 'プロップモデル制作' },
  { year: '2021', client: 'BEAMS', desc: 'コラボタクシー内装モデル制作' },
  { year: '2021', client: '東京マルイ', desc: 'Vket6 サバイバルゲーム会場建造物制作' },
  { year: '2021', client: 'トヨタマリン', desc: 'ボートショー展示用ボートモデル制作' },
  { year: '2020', client: '東京マルイ', desc: 'Vket5 企業ブース担当' },
]
</script>

<template>
  <main class="works-page">
    <div class="page-inner">
      <PageHeader label="Works" title="実績・経歴" />

      <!-- 実績 -->
      <section class="works-section">
        <h2 class="section-heading">Notable Projects</h2>
        <div class="project-list">
          <div v-for="p in projects" :key="p.year + p.client" class="project-row">
            <span class="project-year">{{ p.year }}</span>
            <span class="project-client">{{ p.client }}</span>
            <span class="project-desc">{{ p.desc }}</span>
          </div>
        </div>
      </section>

      <!-- 経歴 -->
      <section class="works-section">
        <h2 class="section-heading">Career</h2>
        <div class="career-list">
          <div v-for="c in career" :key="c.org" class="career-item">
            <div class="career-header">
              <span class="career-period">{{ c.period }}</span>
              <div class="career-title">
                <p class="career-role">{{ c.role }}</p>
                <p class="career-org">{{ c.org }}</p>
              </div>
            </div>
            <ul class="career-items">
              <li v-for="item in c.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.works-page {
  min-height: 100vh;
  padding: 8rem 2rem 6rem;
}

.page-inner {
  max-width: 900px;
  margin: 0 auto;
}

.works-section {
  margin-bottom: 4rem;
}

.section-heading {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

/* --- Projects --- */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.project-row {
  display: grid;
  grid-template-columns: 3.5rem 8rem 1fr;
  gap: 1rem;
  align-items: baseline;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 200, 255, 0.06);
}

.project-year {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.project-client {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
}

.project-desc {
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.5;
}

/* --- Career --- */
.career-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.career-item {
  padding-left: 1.25rem;
  border-left: 2px solid var(--border);
}

.career-header {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.career-period {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  padding-top: 0.15rem;
}

.career-role {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.2rem;
}

.career-org {
  font-size: 0.78rem;
  color: var(--accent);
  margin: 0;
}

.career-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.career-items li {
  font-size: 0.82rem;
  color: var(--text-secondary);
  padding-left: 1rem;
  position: relative;
}

.career-items li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--border);
}

@media (max-width: 640px) {
  .project-row {
    grid-template-columns: 3rem 1fr;
    grid-template-rows: auto auto;
  }
  .project-client {
    grid-column: 2;
  }
  .project-desc {
    grid-column: 1 / -1;
    padding-left: 0;
  }
}
</style>
