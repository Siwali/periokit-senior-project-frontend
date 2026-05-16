<script setup lang="ts">
import ToothColumn from './ToothColumn.vue'
import ToothImageRow from './ToothImageRow.vue'
import { BUCCAL_ROWS, LOWER_ARCH, PALATAL_ROWS, UPPER_ARCH } from '@/domain/chart/chart.constants'
import { getToothColumnWidth } from '@/domain/chart/chart.image'
import type { ChartData, SiteIndex, Surface, ToothId } from '@/domain/chart/chart.types'

defineProps<{
  chartData: ChartData
  selectedToothId: ToothId | null
}>()

const emit = defineEmits<{
  selectTooth: [id: ToothId]
  toggleBop: [id: ToothId, surface: Surface, site: SiteIndex]
  togglePi: [id: ToothId, surface: Surface, site: SiteIndex]
  toggleFur: [id: ToothId, surface: Surface, index: number]
  updatePd: [id: ToothId, surface: Surface, site: SiteIndex, value: string]
  updateRec: [id: ToothId, surface: Surface, site: SiteIndex, value: string]
  toggleExtracted: [id: ToothId]
}>()

const getToothColumnStyle = (id: ToothId) => {
  const width = `${getToothColumnWidth(id)}px`

  return {
    width,
    flexBasis: width
  }
}
</script>

<template>
  <section class="mt-6 w-full bg-white rounded-3xl shadow-xl border border-slate-300 overflow-hidden">
    <div class="p-4 bg-[#f8fafc] overflow-x-auto">
      <div class="w-fit mx-auto">

        <!-- Upper Arch Buccal -->
        <div class="flex items-end mb-1">
          <div class="flex flex-col bg-white border-l border-t border-slate-400 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
            <div class="h-7 border-b border-r border-slate-400"></div>
            <div v-for="row in BUCCAL_ROWS" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-400">{{ row }}</div>
          </div>
          <div class="flex">
            <template v-for="(group, gIdx) in UPPER_ARCH" :key="gIdx">
              <div class="flex border-l border-t border-r border-slate-400 bg-white">
                <ToothColumn
                  v-for="(id, idx) in group"
                  :id="id"
                  :key="id"
                  :tooth-data="chartData[id]"
                  surface="buccal"
                  order="standard"
                  header-position="top"
                  :midline="gIdx === 1 && idx === 3"
                  :selected="selectedToothId === id"
                  @select="emit('selectTooth', $event)"
                  @toggle-bop="(...args) => emit('toggleBop', ...args)"
                  @toggle-pi="(...args) => emit('togglePi', ...args)"
                  @toggle-fur="(...args) => emit('toggleFur', ...args)"
                  @update-pd="(...args) => emit('updatePd', ...args)"
                  @update-rec="(...args) => emit('updateRec', ...args)"
                />
              </div>
              <div v-if="gIdx !== UPPER_ARCH.length - 1" class="w-4"></div>
            </template>
          </div>
        </div>
        
        <!-- Upper Arch - Extracted Button-->
        <div class="flex mb-4">
          <div class="w-20"></div>
          <div class="flex">
            <template v-for="(group, gIdx) in UPPER_ARCH" :key="gIdx">
              <div class="flex">
                <div v-for="id in group" :key="id" class="h-8 flex shrink-0 items-center justify-center" :style="getToothColumnStyle(id)">
                  <button class="w-full h-6 text-[9px] font-black transition-all duration-200 border border-slate-300" :class="chartData[id].extracted ? 'bg-red-500 text-white border-red-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'" @click="emit('toggleExtracted', id)">Ext</button>
                </div>
              </div>
              <div v-if="gIdx !== UPPER_ARCH.length - 1" class="w-4"></div>
            </template>
          </div>
        </div>

        <!-- Upper Arch - Images -->
        <div class="flex flex-col gap-10 mb-6">
          <ToothImageRow label="BUCCAL" :arch="UPPER_ARCH" :chart-data="chartData" surface="buccal" :selected-tooth-id="selectedToothId" grid-class="clinical-grid-bg" group-gap-class="w-4" label-position="top" />
          <ToothImageRow label="PALATAL" :arch="UPPER_ARCH" :chart-data="chartData" surface="lingual" :selected-tooth-id="selectedToothId" grid-class="clinical-grid-bg-inf" group-gap-class="w-4" label-position="top" />
        </div>

        <!-- Upper Arch Palatal -->
        <div class="flex mt-6 mb-16">
          <div class="flex flex-col bg-white border-l border-y border-slate-400 text-[9px] font-bold text-slate-500 w-20 sticky left-0 z-20">
            <div v-for="row in PALATAL_ROWS" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-300 last:border-b-0">{{ row }}</div>
          </div>
          <div class="flex">
            <template v-for="(group, gIdx) in UPPER_ARCH" :key="gIdx">
              <div class="flex border border-slate-400 bg-white">
                <ToothColumn
                  v-for="(id, idx) in group"
                  :id="id"
                  :key="id"
                  :tooth-data="chartData[id]"
                  surface="lingual"
                  order="reverse"
                  header-position="none"
                  :midline="gIdx === 1 && idx === 3"
                  :selected="selectedToothId === id"
                  @select="emit('selectTooth', $event)"
                  @toggle-bop="(...args) => emit('toggleBop', ...args)"
                  @toggle-pi="(...args) => emit('togglePi', ...args)"
                  @toggle-fur="(...args) => emit('toggleFur', ...args)"
                  @update-pd="(...args) => emit('updatePd', ...args)"
                  @update-rec="(...args) => emit('updateRec', ...args)"
                />
              </div>
              <div v-if="gIdx !== UPPER_ARCH.length - 1" class="w-4"></div>
            </template>
          </div>
        </div>

        <!-- Lower Arch Buccal -->
        <div class="flex items-end mb-1 mt-12">
          <div class="flex flex-col bg-white border-l border-t border-slate-400 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
            <div v-for="row in BUCCAL_ROWS" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-400">{{ row }}</div>
          </div>
          <div class="flex">
            <template v-for="(group, gIdx) in LOWER_ARCH" :key="gIdx">
              <div class="flex border-l border-t border-r border-slate-400 bg-white">
                <ToothColumn
                  v-for="(id, idx) in group"
                  :id="id"
                  :key="id"
                  :tooth-data="chartData[id]"
                  surface="lingual"
                  order="standard"
                  header-position="none"
                  :midline="gIdx === 1 && idx === 3"
                  :selected="selectedToothId === id"
                  @select="emit('selectTooth', $event)"
                  @toggle-bop="(...args) => emit('toggleBop', ...args)"
                  @toggle-pi="(...args) => emit('togglePi', ...args)"
                  @toggle-fur="(...args) => emit('toggleFur', ...args)"
                  @update-pd="(...args) => emit('updatePd', ...args)"
                  @update-rec="(...args) => emit('updateRec', ...args)"
                />
              </div>
              <div v-if="gIdx !== LOWER_ARCH.length - 1" class="w-6"></div>
            </template>
          </div>
        </div>

        <!-- Lower Arch - Extracted Button -->
        <div class="flex mt-1 mb-8">
          <div class="w-20"></div>
          <div class="flex">
            <template v-for="(group, gIdx) in LOWER_ARCH" :key="gIdx">
              <div class="flex">
                <div v-for="id in group" :key="id" class="h-8 flex shrink-0 items-center justify-center" :style="getToothColumnStyle(id)">
                  <button class="w-full h-6 text-[9px] font-black uppercase transition-all duration-200 border border-slate-300" :class="chartData[id].extracted ? 'bg-red-500 text-white border-red-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'" @click="emit('toggleExtracted', id)">Ext</button>
                </div>
              </div>
              <div v-if="gIdx !== LOWER_ARCH.length - 1" class="w-6"></div>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-10 mb-6">
          <ToothImageRow label="LINGUAL" :arch="LOWER_ARCH" :chart-data="chartData" surface="buccal" :selected-tooth-id="selectedToothId" grid-class="clinical-grid-bg" group-gap-class="w-6" label-position="bottom" />
          <ToothImageRow label="BUCCAL" :arch="LOWER_ARCH" :chart-data="chartData" surface="lingual" :selected-tooth-id="selectedToothId" grid-class="clinical-grid-bg-inf" group-gap-class="w-6" label-position="bottom" />
        </div>

        <!-- Lower Arch lingual -->
        <div class="flex mb-4">
          <div class="flex flex-col bg-white border-l border-y border-slate-400 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
            <div v-for="row in PALATAL_ROWS" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-300 last:border-b-0">{{ row }}</div>
            <div class="h-7 border-t border-r border-slate-400 bg-slate-50"></div>
          </div>
          <div class="flex">
            <template v-for="(group, gIdx) in LOWER_ARCH" :key="gIdx">
              <div class="flex border border-slate-400 bg-white">
                <ToothColumn
                  v-for="(id, idx) in group"
                  :id="id"
                  :key="id"
                  :tooth-data="chartData[id]"
                  surface="buccal"
                  order="reverse"
                  header-position="bottom"
                  :midline="gIdx === 1 && idx === 3"
                  :selected="selectedToothId === id"
                  @select="emit('selectTooth', $event)"
                  @toggle-bop="(...args) => emit('toggleBop', ...args)"
                  @toggle-pi="(...args) => emit('togglePi', ...args)"
                  @toggle-fur="(...args) => emit('toggleFur', ...args)"
                  @update-pd="(...args) => emit('updatePd', ...args)"
                  @update-rec="(...args) => emit('updateRec', ...args)"
                />
              </div>
              <div v-if="gIdx !== LOWER_ARCH.length - 1" class="w-6"></div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
