<script setup lang="ts">
import { getFurImage, getFurMarkerStyle, getToothColumnWidth, getToothImage, getToothImageTopOffset } from '@/domain/chart/chart.image'
import type { ChartData, Surface, ToothId } from '@/domain/chart/chart.types'

const getToothColumnStyle = (id: ToothId) => {
  const width = `${getToothColumnWidth(id)}px`

  return {
    width,
    flexBasis: width
  }
}

const getToothImageStyle = (id: ToothId, surface: Surface) => {
  const top = getToothImageTopOffset(id, surface)

  return {
    top: `${top}px`
  }
}

defineProps<{
  label: string
  arch: number[][]
  chartData: ChartData
  surface: Surface
  selectedToothId: ToothId | null
  gridClass: string
  groupGapClass: string
  imageClass?: string
  labelPosition: 'top' | 'bottom'
}>()

</script>

<template>
  <div class="flex">
    <div class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4">
      <span v-for="letter in label.split('')" :key="letter">{{ letter }}</span>
    </div>
    <div class="flex-1 flex">
      <template v-for="(group, gIdx) in arch" :key="gIdx">
        <div class="flex h-38.75 relative">
          <div class="absolute inset-0 z-30 pointer-events-none" :class="gridClass"></div>
          <div
            v-for="id in group"
            :key="id"
            class="h-full flex shrink-0 justify-center group relative z-10 cursor-default transition-all duration-200 rounded-xl"
            :class="selectedToothId === id ? 'bg-blue-50 ring-2 ring-[#0052ff] ring-inset' : ''"
            :style="getToothColumnStyle(id)"
          >
            <img
              :src="getToothImage(id, surface, chartData[id])"
              :alt="`Tooth ${id} ${label}`"
              class="absolute h-35.25 w-auto max-w-none object-contain transition-all duration-300"
              :class="imageClass"
              :style="getToothImageStyle(id, surface)"
            />
            <div
              v-for="(grade, fIdx) in chartData[id].fur[surface]"
              :key="fIdx"
              class="absolute z-40 pointer-events-none -translate-x-1/2"
              :style="getFurMarkerStyle(id, surface, fIdx, chartData[id].fur[surface].length)"
            >
              <img v-if="grade > 0" :src="getFurImage(grade)" class="w-3 h-3 object-contain" />
            </div>
          </div>
        </div>
        <div v-if="gIdx !== arch.length - 1" :class="groupGapClass"></div>
      </template>
    </div>
  </div>
</template>
