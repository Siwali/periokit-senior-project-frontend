<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { ref, toRef, watch } from 'vue'
import PrognosisReferenceModal from '@/components/chart/PrognosisReferenceModal.vue'
import ToothClinicalNote from '@/components/chart/ToothClinicalNote.vue'
import ToothAnalysisSummary from '@/components/chart/ToothAnalysisSummary.vue'
import SiteStatusDiagram from '@/components/chart/SiteStatusDiagram.vue'
import ToothMeasurementCards from '@/components/chart/ToothMeasurementCards.vue'
import { useToothAnalysis } from '@/composables/chart/useToothAnalysis'
import type { ToothData, ToothId } from '@/domain/chart/chart.types'


const prognosisModalType = ref<'MN' | 'KC' | null>(null)
const isEditingNote = ref(false)

const props = defineProps<{
  toothId: ToothId | null
  toothData: ToothData | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  close: []
  'update-note': [value: { id: ToothId; note: string }]
}>()

const { innerSurfaceLabel, analysisData } = useToothAnalysis({
  toothId: toRef(props, 'toothId'),
  toothData: toRef(props, 'toothData'),
})

// Reset editing state when switching teeth
watch(() => props.toothId, () => {
  isEditingNote.value = false
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

      <ToothMeasurementCards
        :buccal-p-d="analysisData?.buccalPD"
        :inner-surface-p-d="analysisData?.innerSurfacePD"
        :buccal-c-a-l="analysisData?.buccalCAL"
        :inner-surface-c-a-l="analysisData?.innerSurfaceCAL"
        :inner-surface-label="innerSurfaceLabel"
        :extracted="toothData.extracted"
      />

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
        v-model:is-editing="isEditingNote"
        @update-note="handleUpdateNote"
      />

    </div>

    <!-- Fixed Footer Action at the bottom of the card -->
    <div v-if="!isEditingNote && !props.readonly" class="p-6 bg-white border-t border-slate-50 mt-auto">
      <button
        @click="isEditingNote = true"
        class="w-full py-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        {{ toothData.note ? 'Edit Clinical Note' : 'Add Clinical Note' }}
      </button>
    </div>
  </div>


  <PrognosisReferenceModal v-model="prognosisModalType" />

</template>
