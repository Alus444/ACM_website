<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()

// A range and its unit form one readable value, even inside a wrapping paragraph.
const parts = computed(() => {
  const range = /-?\d+(?:\.\d+)?\s*[–〜~]\s*-?\d+(?:\.\d+)?(?:\s*(?:%|px|TVL|秒|行|ms|Hz))?/g
  const result: { text: string; keepTogether: boolean }[] = []
  let start = 0
  for (const match of props.text.matchAll(range)) {
    const index = match.index ?? 0
    if (index > start) result.push({ text: props.text.slice(start, index), keepTogether: false })
    result.push({ text: match[0], keepTogether: true })
    start = index + match[0].length
  }
  if (start < props.text.length) result.push({ text: props.text.slice(start), keepTogether: false })
  return result
})
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <span v-if="part.keepTogether" class="text-range">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<style scoped>
.text-range {
  white-space: nowrap;
}
</style>
