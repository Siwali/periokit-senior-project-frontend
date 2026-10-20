<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { calculateContainScale, calculateFitScale } from './fit-scale'

const props = defineProps<{
  enableAutoFit?: boolean
  maxScale?: number
  safeInset?: number
  animate?: boolean
  fitHeight?: boolean
  centerContent?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const scale = ref(1)
const scaledHeight = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const containerStyle = computed(() => (
  props.fitHeight
    ? { height: '100%' }
    : scaledHeight.value > 0 ? { height: `${scaledHeight.value}px` } : undefined
))

const calculateScale = () => {
  if (!props.enableAutoFit) {
    scale.value = 1
    scaledHeight.value = 0
    offsetX.value = 0
    offsetY.value = 0
    return
  }

  if (containerRef.value && contentRef.value) {
    const containerWidth = containerRef.value.clientWidth

    const currentTransform = contentRef.value.style.transform
    contentRef.value.style.transform = 'none'

    const contentWidth = contentRef.value.scrollWidth
    const contentHeight = contentRef.value.scrollHeight


    contentRef.value.style.transform = currentTransform

    scale.value = props.fitHeight
      ? calculateContainScale(
          containerWidth,
          containerRef.value.clientHeight,
          contentWidth,
          contentHeight,
          props.maxScale ?? 1,
          props.safeInset ?? 0,
        )
      : calculateFitScale(
          containerWidth,
          contentWidth,
          props.maxScale ?? 1,
          props.safeInset ?? 0,
        )
    scaledHeight.value = contentHeight * scale.value
    offsetX.value = props.centerContent
      ? Math.max(0, (containerWidth - contentWidth * scale.value) / 2)
      : 0
    offsetY.value = props.centerContent && props.fitHeight
      ? Math.max(0, (containerRef.value.clientHeight - contentHeight * scale.value) / 2)
      : 0
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      calculateScale()
    })
    resizeObserver.observe(containerRef.value)
    if (contentRef.value) resizeObserver.observe(contentRef.value)
  }

  nextTick(calculateScale)
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(
  () => [
    props.enableAutoFit,
    props.maxScale,
    props.safeInset,
    props.fitHeight,
    props.centerContent,
  ],
  calculateScale,
)
</script>

<template>
  <div
    ref="containerRef"
    class="w-full overflow-hidden origin-top-left"
    :class="{ 'transition-all duration-300': animate !== false }"
    :style="containerStyle"
  >
    <div
      ref="contentRef"
      class="origin-top-left min-w-max"
      :class="{ 'transition-transform duration-300': animate !== false }"
      :style="{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }"
    >
      <slot />
    </div>
  </div>
</template>
