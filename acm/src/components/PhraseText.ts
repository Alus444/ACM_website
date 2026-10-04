import { computed, defineComponent, h, toDisplayString } from 'vue'
import { splitPhrases } from '../utils/phraseWrap.ts'

export default defineComponent({
  name: 'PhraseText',
  props: { text: {} },
  setup(props, { slots }) {
    const phrases = computed(() => splitPhrases(toDisplayString(props.text)))
    // A neutral inline root keeps a single flex/grid item and avoids existing
    // selectors for span/strong/table cells applying to the generated wrapper.
    return () => {
      const parts = slots.default
        ? splitPhrases(slots.default().map(node => toDisplayString(node.children)).join(''))
        : phrases.value
      return h('acm-text', { class: 'phrase-text' }, parts.map((text, index) =>
        // A punctuation-only boundary next to a link/code stays ordinary text
        // so the browser can still apply Japanese line-start/end prohibitions.
        /^[\s\p{Punctuation}\p{Symbol}]+$/u.test(text)
          ? text : h('span', { class: 'phrase-unit', key: index }, text),
      ))
    }
  },
})
