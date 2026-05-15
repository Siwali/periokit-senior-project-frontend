<script setup lang="ts">
import { getFurImage, getToothImage } from '@/domain/chart/chart.image'
import type { ChartData, Surface, ToothId } from '@/domain/chart/chart.types'

defineProps<{
  label: string
  arch: number[][]
  chartData: ChartData
  surface: Surface
  selectedToothId: ToothId | null
  gridClass: string
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
        <div class="flex h-36 relative" :class="gridClass">
          <div
            v-for="id in group"
            :key="id"
            class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10 cursor-default transition-all duration-200 rounded-xl"
            :class="selectedToothId === id ? 'bg-blue-50 ring-2 ring-[#0052ff] ring-inset' : 'hover:bg-slate-50'"
          >
            <img
              :src="getToothImage(id, surface, chartData[id])"
              :alt="`Tooth ${id} ${label}`"
              class="w-12 h-auto object-contain transition-all duration-300"
              :class="[imageClass, selectedToothId === id ? 'scale-110' : '']"
            />
            <span
              class="absolute text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors z-10"
              :class="[labelPosition === 'top' ? 'top-1.5' : 'bottom-1.5', selectedToothId === id ? 'text-[#0052ff]' : '']"
            >
              {{ id }}
            </span>
            <div
              v-for="(grade, fIdx) in chartData[id].fur[surface]"
              :key="fIdx"
              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
              :style="{ left: chartData[id].fur[surface].length > 1 ? (fIdx === 0 ? '35%' : '65%') : '50%' }"
            >
              <img v-if="grade > 0" :src="getFurImage(grade)" class="w-3 h-3 object-contain" />
            </div>
          </div>
        </div>
        <div v-if="gIdx !== arch.length - 1" class="w-4"></div>
      </template>
    </div>
  </div>
</template>
