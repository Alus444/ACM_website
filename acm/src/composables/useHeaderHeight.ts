import { onMounted, onUnmounted, readonly, ref, type Ref } from 'vue'

const headerHeight = ref(0)

export function useHeaderHeight(element?: Ref<HTMLElement | null>) {
  if (element) {
    let observer: ResizeObserver | undefined

    onMounted(() => {
      const header = element.value
      if (!header) return

      const updateHeight = () => {
        headerHeight.value = header.getBoundingClientRect().height
      }

      updateHeight()
      observer = new ResizeObserver(updateHeight)
      observer.observe(header)
    })

    onUnmounted(() => {
      observer?.disconnect()
      // Standalone product pages unmount the shared Header.
      headerHeight.value = 0
    })
  }

  return readonly(headerHeight)
}
