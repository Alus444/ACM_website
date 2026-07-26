<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import UnderConstruction from './components/sections/UnderConstruction.vue'

// ★ true = 工事中ページ / false = 通常ページ
const underConstruction = false
const route = useRoute()
const isStandalone = computed(() => route.meta.standalone === true)
</script>

<template>
  <UnderConstruction v-if="underConstruction" />
  <RouterView v-else-if="isStandalone" />
  <template v-else>
    <Header />
    <RouterView />
    <Footer />
  </template>
</template>

<style scoped>
main {
  min-height: 100vh;
}
</style>
