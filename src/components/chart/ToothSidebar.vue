<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import PrognosisReferenceModal from '@/components/chart/PrognosisReferenceModal.vue'
import ToothClinicalNote from '@/components/chart/ToothClinicalNote.vue'
import ToothAnalysisSummary from '@/components/chart/ToothAnalysisSummary.vue'
import SiteStatusDiagram from '@/components/chart/SiteStatusDiagram.vue'

import {
  calculatePrognosisKC,
  calculatePrognosisMN,
  getSafePDValues,
  getSafeCALValues,
  calculateToothBopPercentage,
  calculateToothPiPercentage
} from '../../utils/calculations'
import { isUpperTooth } from '@/domain/chart/chart.rules'
import type { ToothData, ToothId } from '@/domain/chart/chart.types'


const prognosisModalType = ref<'MN' | 'KC' | null>(null)

const props = defineProps<{
  toothId: ToothId | null
  toothData: ToothData | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  close: []
  'update-note': [value: { id: ToothId; note: string }]
}>()

const innerSurfaceLabel = computed(() => {
  if (!props.toothId) return 'Palatal'
  return isUpperTooth(props.toothId) ? 'Palatal' : 'Lingual'
})

const analysisData = computed(() => {
  if (!props.toothData) return null

  const allFur = [
    ...(props.toothData.fur?.buccal || []),
    ...(props.toothData.fur?.lingual || [])
  ].map(v => Number(v) || 0)

  const maxFur = allFur.length > 0 ? Math.max(0, ...allFur) : 0

  return {
    prognosisKC: calculatePrognosisKC(props.toothData),
    prognosisMN: calculatePrognosisMN(props.toothData),
    buccalKTW: props.toothData.buccal?.ktw || "0",
    innerSurfaceKTW: props.toothData.lingual?.ktw || "0",
    mobility: props.toothData.mo || "0",
    furcation: maxFur,
    buccalPD: getSafePDValues(props.toothData.buccal?.pd),
    innerSurfacePD: getSafePDValues(props.toothData.lingual?.pd),
    buccalCAL: getSafeCALValues(props.toothData.buccal?.cal),
    innerSurfaceCAL: getSafeCALValues(props.toothData.lingual?.cal),
    bopPercentage: calculateToothBopPercentage(props.toothData),
    piPercentage: calculateToothPiPercentage(props.toothData)
  }
})

const handleUpdateNote = (note: string) => {
  if (props.toothId === null) return
  emit('update-note', { id: props.toothId, note })
}

</script>

<template>
  <div v-if="toothId && toothData" class="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">#{{ toothId }}</h2>
          <span v-if="toothData.extracted" class="px-2 py-1 bg-red-50 text-red-500 rounded border border-red-100 text-[9px] font-black uppercase tracking-wider">Extracted</span>
          <span v-if="toothData.implant" class="px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200 text-[9px] font-black uppercase tracking-wider">Implant</span>
        </div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tooth Details</p>
      </div>
      <button @click="emit('close')" class="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">

      <!-- PD Section -->
      <section :class="{ 'bg-slate-800/30 opacity-70 pointer-events-none': toothData.extracted }">
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">PD</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Buccal Card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in analysisData?.buccalPD" :key="i"
                :class="parseInt(val) > 4 ? 'text-red-500' : 'text-[#0052ff]'">
                {{ val }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buccal (mm)</p>
          </div>
          <!-- Inner surface card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in analysisData?.innerSurfacePD" :key="i"
                :class="parseInt(val) > 4 ? 'text-red-500' : 'text-[#0052ff]'">
                {{ val }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ innerSurfaceLabel }} (mm)</p>
          </div>
        </div>

      </section>

      <!-- CAL Section -->
      <section :class="{ 'bg-slate-800/30 opacity-70 pointer-events-none': toothData.extracted }">
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">CAL</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Buccal Card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in analysisData?.buccalCAL" :key="i" class="text-[#0052ff]">
                {{ val }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buccal (mm)</p>
          </div>
          <!-- Inner surface card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in analysisData?.innerSurfaceCAL" :key="i" class="text-[#0052ff]">
                {{ val }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ innerSurfaceLabel }} (mm)</p>
          </div>
        </div>

      </section>

      <!-- Visual Indicators Section (Standard 6-Site Hexagonal Diagrams) -->
      <section class="grid grid-cols-2 gap-4" :class="{ 'bg-slate-900/5 opacity-60 pointer-events-none': toothData.extracted }">
        <SiteStatusDiagram
          :tooth-id="toothId"
          :tooth-data="toothData"
          field="bop"
          label="BOP (6 Sites)"
          :percentage="analysisData?.bopPercentage"
          active-fill="#ef4444"
          badge-class="bg-red-50 text-red-500 border-red-100"
          clip-id-prefix="squircle-clip-bop"
        />

        <SiteStatusDiagram
          :tooth-id="toothId"
          :tooth-data="toothData"
          field="pi"
          label="PI (6 Sites)"
          :percentage="analysisData?.piPercentage"
          active-fill="#3b82f6"
          badge-class="bg-blue-50 text-blue-500 border-blue-100"
          clip-id-prefix="squircle-clip-pi"
        />
      </section>

      <!-- Analysis Summary -->
      <ToothAnalysisSummary
        :extracted="toothData.extracted"
        :implant="toothData.implant"
        :inner-surface-label="innerSurfaceLabel"
        :prognosis-k-c="analysisData?.prognosisKC"
        :prognosis-m-n="analysisData?.prognosisMN"
        :buccal-k-t-w="analysisData?.buccalKTW"
        :inner-surface-k-t-w="analysisData?.innerSurfaceKTW"
        :mobility="analysisData?.mobility"
        :furcation="analysisData?.furcation"
        @show-prognosis="prognosisModalType = $event"
      />

      <ToothClinicalNote
        :note="toothData.note"
        :readonly="props.readonly"
        @update-note="handleUpdateNote"
      />

    </div>
  </div>


  <PrognosisReferenceModal v-model="prognosisModalType" />

</template>

