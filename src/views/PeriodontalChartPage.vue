<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Download, FileText, Image as ImageIcon, Plus, Save, Stethoscope, X } from 'lucide-vue-next'
import Navbar from '@/components/layout/Navbar.vue'
import ChartLegend from '@/components/chart/ChartLegend.vue'
import PatientChartHeader from '@/components/chart/PatientChartHeader.vue'
import PeriodontalChartGrid from '@/components/chart/PeriodontalChartGrid.vue'
import ToothSidebarOverlay from '@/components/chart/ToothSidebarOverlay.vue'
import { usePeriodontalChartStore } from '@/stores/periodontal-chart'
import { useClinicalValidationStore } from '@/stores/clinical-validation'
import type { ToothId } from '@/domain/chart/chart.types'

const chartStore = usePeriodontalChartStore()
chartStore.initializeChart()
const validationStore = useClinicalValidationStore()

const {
  patientInfo,
  teethData,
  selectedToothId,
  selectedToothData,
  activeSubNav,
  summary
} = storeToRefs(chartStore)

const handleUpdateNote = ({ id, note }: { id: string | number; note: string }) => {
  chartStore.updateNote(Number(id) as ToothId, note)
}

</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] font-sans text-[#1e293b]">
    <Navbar />

    <div class="bg-white border-b border-slate-200 py-2.5 sticky top-16 z-40">
      <div class="max-w-[1600px] mx-auto px-8 flex items-center justify-center">
        <div class="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          <button
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="activeSubNav === 'chart' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="chartStore.activeSubNav = 'chart'"
          >
            <FileText class="w-4 h-4" />
            Periodontal Chart
          </button>
          <button
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="activeSubNav === 'xray' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="chartStore.activeSubNav = 'xray'"
          >
            <ImageIcon class="w-4 h-4" />
            X-ray
          </button>
          <div class="w-px h-4 bg-slate-300 my-auto mx-1"></div>
          <button
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="activeSubNav === 'export' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="chartStore.activeSubNav = 'export'"
          >
            <Download class="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Tooth Sidebar -->

    <main class="max-w-[1600px] mx-auto p-6 lg:p-8">
      <div class="flex items-center justify-between mb-6">
        <button class="bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors">
          <FileText class="w-4 h-4" /> Overview
        </button>

        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-5 py-2 bg-white border border-[#9333ea]/30 text-[#9333ea] rounded-lg font-bold text-xs shadow-sm hover:bg-purple-50 transition-colors">
            <Stethoscope class="w-4 h-4" /> Diagnosis
          </button>
          <button class="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors" @click="chartStore.resetChart">
            <Plus class="w-4 h-4" /> New Chart
          </button>
          <button class="flex items-center gap-2 px-5 py-2 bg-[#7aa4f0] text-white rounded-lg font-bold text-xs shadow-md hover:bg-[#6b94e0] transition-colors">
            <Save class="w-4 h-4" /> Save Chart
          </button>
        </div>
      </div>

      <div class="flex gap-6 transition-all duration-500">
        <ChartLegend :is-sidebar-open="selectedToothId !== null" />

        <div class="w-[1020px] max-w-full flex-shrink-0 flex flex-col gap-0 transition-all duration-500">
          <div class="flex items-center gap-0 relative z-10">
            <div class="bg-white px-6 py-2.5 rounded-t-xl border-t border-l border-r border-slate-200 text-[11px] font-black text-[#0052ff] flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mb-[1px]">
              CHART 1
              <X class="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors" />
            </div>
            <button class="p-2.5 text-slate-400 hover:text-[#0052ff] transition-colors"><Plus class="w-5 h-5" /></button>
          </div>

          <PatientChartHeader :patient-info="patientInfo" />

          <PeriodontalChartGrid
            :chart-data="teethData"
            :selected-tooth-id="selectedToothId"
            @select-tooth="chartStore.selectTooth"
            @toggle-bop="chartStore.toggleBop"
            @toggle-pi="chartStore.togglePi"
            @toggle-fur="chartStore.toggleFur"
            @update-pd="chartStore.updatePd"
            @update-rec="chartStore.updateRec"
            @update-mobility="chartStore.updateMobility"
            @update-ktw="chartStore.updateKtw"
            :get-field-validation="validationStore.getFieldValidation"
            @validate-field="validationStore.setFieldValidation"
            @toggle-extracted="chartStore.toggleExtracted"
          />

          <!-- Summary -->
          <section class="mt-6 w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 class="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Full-mouth summary</h2>
            <div class="grid grid-cols-6 gap-3">
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase">Teeth</p>
                <p class="text-lg font-black text-slate-800">{{ summary.totalTeeth - summary.missingTeeth }}/{{ summary.totalTeeth }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase">Implants</p>
                <p class="text-lg font-black text-slate-800">{{ summary.implantTeeth }}</p>
              </div>
              <div class="rounded-xl bg-red-50 p-3">
                <p class="text-[10px] font-bold text-red-400 uppercase">BoP</p>
                <p class="text-lg font-black text-red-600">{{ summary.bopPercentage }}%</p>
              </div>
              <div class="rounded-xl bg-blue-50 p-3">
                <p class="text-[10px] font-bold text-blue-400 uppercase">PI</p>
                <p class="text-lg font-black text-blue-600">{{ summary.piPercentage }}%</p>
              </div>
              <div class="rounded-xl bg-amber-50 p-3">
                <p class="text-[10px] font-bold text-amber-500 uppercase">PD 4-5</p>
                <p class="text-lg font-black text-amber-600">{{ summary.pdCategories.warning }}</p>
              </div>
              <div class="rounded-xl bg-rose-50 p-3">
                <p class="text-[10px] font-bold text-rose-500 uppercase">PD 6+</p>
                <p class="text-lg font-black text-rose-600">{{ summary.pdCategories.deep }}</p>
              </div>
            </div>
          </section>
        </div>

        <ToothSidebarOverlay
          :is-open="selectedToothId !== null"
          :tooth-id="selectedToothId"
          :tooth-data="selectedToothData"
          @close="selectedToothId = null"
          @update-note="handleUpdateNote"
        />
      </div>
    </main>
  </div>
</template>
