<script setup lang="ts">
import Hero from '../components/sections/Hero.vue'
import Gallery from '../components/sections/Gallery.vue'
import BoothItems from '../components/sections/BoothItems.vue'
import DocumentsTeaser from '../components/sections/DocumentsTeaser.vue'
import Pricing from '../components/sections/Pricing.vue'
import PortfolioLinks from '../components/sections/PortfolioLinks.vue'
import { useMode } from '../composables/useMode'

const { isPro } = useMode()
</script>

<template>
  <main>
    <Hero />
    <PortfolioLinks v-if="isPro" />
    <template v-else>
      <BoothItems />
      <Gallery />
    </template>
    <DocumentsTeaser />
    <Pricing v-if="!isPro" />
  </main>
</template>
