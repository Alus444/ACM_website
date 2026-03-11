<script setup lang="ts">
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import Hero from './components/sections/Hero.vue'
import Gallery from './components/sections/Gallery.vue'
import BoothItems from './components/sections/BoothItems.vue'
import Pricing from './components/sections/Pricing.vue'
import UnderConstruction from './components/sections/UnderConstruction.vue'

// ★ true = 工事中ページ / false = 通常ページ
const underConstruction = true
</script>

<template>
  <UnderConstruction v-if="underConstruction" />
  <template v-else>
    <Header />
    <main>
      <Hero />
      <Gallery />
      <BoothItems />
      <Pricing />
    </main>
    <Footer />
  </template>
</template>

<style scoped>
main {
  min-height: 100vh;
}
</style>
