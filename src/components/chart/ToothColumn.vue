<script setup lang="ts">
import { SITE_INDEXES } from '@/domain/chart/chart.constants'
import { getFurImage } from '@/domain/chart/chart.image'
import type { SiteIndex, Surface, ToothData, ToothId } from '@/domain/chart/chart.types'

const props = defineProps<{
  id: ToothId
  toothData: ToothData
  surface: Surface
  selected: boolean
  midline?: boolean
  headerPosition?: 'top' | 'bottom' | 'none'
  order: 'standard' | 'reverse'
}>()

const emit = defineEmits<{
  select: [id: ToothId]
  toggleBop: [id: ToothId, surface: Surface, site: SiteIndex]
  togglePi: [id: ToothId, surface: Surface, site: SiteIndex]
  toggleFur: [id: ToothId, surface: Surface, index: number]
  updatePd: [id: ToothId, surface: Surface, site: SiteIndex, value: string]
  updateRec: [id: ToothId, surface: Surface, site: SiteIndex, value: string]
}>()

const select = () => emit('select', props.id)
const inputValue = (event: Event) => (event.target as HTMLInputElement).value
</script>

<template>
  <div
    class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px] transition-all duration-200 cursor-default"
    :class="[midline ? 'border-l-2 border-l-slate-400' : '', selected ? 'bg-blue-50/50 ring-2 ring-[#0052ff] ring-inset z-10' : '']"
  >
    <div
      v-if="headerPosition === 'top'"
      class="h-7 flex items-center justify-center font-black text-[11px] border-b border-slate-300 cursor-pointer transition-all duration-200"
      :class="selected ? 'bg-[#0052ff] text-white' : 'bg-slate-50 text-slate-800 hover:bg-[#0052ff] hover:text-white'"
      @click.stop="select"
    >
      {{ id }}
    </div>

    <template v-if="order === 'standard'">
      <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input v-model="toothData.implant" type="checkbox" :disabled="toothData.extracted" class="w-3.5 h-3.5 accent-slate-800 disabled:opacity-30" /></div>
      <div class="h-6 border-b border-slate-200"><input v-model="toothData.mo" type="text" :disabled="toothData.extracted || toothData.implant" :placeholder="toothData.implant ? '0' : ''" class="w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50" /></div>
      <div class="h-6 border-b border-slate-200"><input v-model="toothData.ktw" type="text" :disabled="toothData.extracted" class="w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50" /></div>
      <div class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800" :class="{ 'pointer-events-none opacity-30': toothData.extracted || toothData.implant }">
        <div v-for="(grade, fIdx) in toothData.fur[surface]" :key="fIdx" class="flex items-center justify-center w-4 h-4 cursor-pointer" @click.stop="emit('toggleFur', id, surface, fIdx)">
          <img v-if="grade > 0" :src="getFurImage(grade)" class="w-3.5 h-3.5 object-contain" />
          <div v-else class="w-3 h-3 border border-slate-200 rounded-full bg-white/50"></div>
        </div>
      </div>
      <div class="flex h-6 border-b border-slate-200" :class="{ 'pointer-events-none opacity-50': toothData.extracted }">
        <div v-for="site in SITE_INDEXES" :key="site" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="toothData[surface].bop[site] ? 'bg-red-500' : ''" @click.stop="emit('toggleBop', id, surface, site)"></div>
      </div>
      <div class="flex h-6 border-b border-slate-200" :class="{ 'pointer-events-none opacity-50': toothData.extracted }">
        <div v-for="site in SITE_INDEXES" :key="site" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="toothData[surface].pi[site] ? 'bg-blue-500' : ''" @click.stop="emit('togglePi', id, surface, site)"></div>
      </div>
      <div class="flex h-6 border-b border-slate-200">
        <input v-for="site in SITE_INDEXES" :key="site" :value="toothData[surface].rec[site]" type="text" :disabled="toothData.extracted" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none disabled:bg-slate-100/50" @input="emit('updateRec', id, surface, site, inputValue($event))" />
      </div>
      <div class="flex h-6 border-b border-slate-200">
        <input v-for="site in SITE_INDEXES" :key="site" :value="toothData[surface].pd[site]" type="text" :disabled="toothData.extracted" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none disabled:bg-slate-100/50" @input="emit('updatePd', id, surface, site, inputValue($event))" />
      </div>
      <div class="flex h-6 border-slate-200 bg-slate-50/30">
        <input v-for="site in SITE_INDEXES" :key="site" type="text" :value="toothData[surface].cal[site] || '0'" class="w-0 flex-1 text-center text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 bg-transparent outline-none pointer-events-none" />
      </div>
    </template>

    <template v-else>
      <div class="flex h-6 border-b border-slate-200 bg-slate-50/30">
        <input v-for="site in SITE_INDEXES" :key="site" type="text" :value="toothData[surface].cal[site] || '0'" class="w-0 flex-1 text-center text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 bg-transparent outline-none pointer-events-none" />
      </div>
      <div class="flex h-6 border-b border-slate-200">
        <input v-for="site in SITE_INDEXES" :key="site" :value="toothData[surface].pd[site]" type="text" :disabled="toothData.extracted" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none disabled:bg-slate-100/50" @input="emit('updatePd', id, surface, site, inputValue($event))" />
      </div>
      <div class="flex h-6 border-b border-slate-200">
        <input v-for="site in SITE_INDEXES" :key="site" :value="toothData[surface].rec[site]" type="text" :disabled="toothData.extracted" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none disabled:bg-slate-100/50" @input="emit('updateRec', id, surface, site, inputValue($event))" />
      </div>
      <div class="flex h-6 border-b border-slate-200" :class="{ 'pointer-events-none opacity-50': toothData.extracted }">
        <div v-for="site in SITE_INDEXES" :key="site" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="toothData[surface].pi[site] ? 'bg-blue-500' : ''" @click.stop="emit('togglePi', id, surface, site)"></div>
      </div>
      <div class="flex h-6 border-b border-slate-200" :class="{ 'pointer-events-none opacity-50': toothData.extracted }">
        <div v-for="site in SITE_INDEXES" :key="site" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="toothData[surface].bop[site] ? 'bg-red-500' : ''" @click.stop="emit('toggleBop', id, surface, site)"></div>
      </div>
      <div class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800" :class="{ 'pointer-events-none opacity-30': toothData.extracted || toothData.implant }">
        <div v-for="(grade, fIdx) in toothData.fur[surface]" :key="fIdx" class="flex items-center justify-center w-4 h-4 cursor-pointer" @click.stop="emit('toggleFur', id, surface, fIdx)">
          <img v-if="grade > 0" :src="getFurImage(grade)" class="w-3.5 h-3.5 object-contain" />
          <div v-else class="w-3 h-3 border border-slate-200 rounded-full bg-white/50"></div>
        </div>
      </div>
      <div class="h-6 border-b border-slate-200"><input v-model="toothData.ktw" type="text" :disabled="toothData.extracted" class="w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50" /></div>
      <div class="h-6 border-b border-slate-200"><input v-model="toothData.mo" type="text" :disabled="toothData.extracted || toothData.implant" :placeholder="toothData.implant ? '0' : ''" class="w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50" /></div>
      <div class="h-6 flex items-center justify-center"><input v-model="toothData.implant" type="checkbox" :disabled="toothData.extracted" class="w-3.5 h-3.5 accent-slate-800 disabled:opacity-30" /></div>
    </template>

    <div
      v-if="headerPosition === 'bottom'"
      class="h-7 flex items-center justify-center font-black text-[11px] border-t border-slate-300 cursor-pointer transition-all duration-200"
      :class="selected ? 'bg-[#0052ff] text-white' : 'bg-slate-50 text-slate-800 hover:bg-[#0052ff] hover:text-white'"
      @click.stop="select"
    >
      {{ id }}
    </div>
  </div>
</template>
