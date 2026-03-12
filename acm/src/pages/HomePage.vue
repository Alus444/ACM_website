<script setup lang="ts">
import Hero from '../components/sections/Hero.vue'
import Gallery from '../components/sections/Gallery.vue'
import BoothItems from '../components/sections/BoothItems.vue'
import Pricing from '../components/sections/Pricing.vue'
import { useMode } from '../composables/useMode'

const { isPro } = useMode()
</script>

<template>
  <main>
    <Hero />
    <Gallery />
    <BoothItems />
    <Pricing v-if="!isPro" />
  </main>
</template>
