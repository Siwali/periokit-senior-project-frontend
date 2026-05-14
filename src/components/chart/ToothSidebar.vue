<script setup lang="ts">
import { X, Activity } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  toothId: number | string | null
  toothData: any
}>()

const emit = defineEmits(['close'])

// Using computed properties for Analysis Summary data

const analysisData = computed(() => {
  if (!props.toothData) return null
  return {
    prognosisKC: props.toothData.prognosisKC || "N/A",
    prognosisMN: props.toothData.prognosisMN || "N/A",
    buccalKTW: props.toothData.ktw || "0",
    palatalKTW: "2", // Assuming default or second KTW if added later
    mobility: props.toothData.mo || "0",
    furcation: props.toothData.fur?.buccal?.[0] || 0
  }
})

const getFurLabel = (grade: number) => {
  const labels = ['-', 'Grade I', 'Grade II', 'Grade III']
  return labels[grade] || '-'
}
</script>

<template>
  <div v-if="toothId && toothData" class="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
      <div>
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">#{{ toothId }}</h2>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tooth Details</p>
      </div>
      <button @click="emit('close')" class="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
      
      <!-- PD Section -->
      <section>
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">PD</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Buccal Card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in toothData.buccal.pd" :key="i" 
                :class="parseInt(val) > 4 ? 'text-red-500' : 'text-[#0052ff]'">
                {{ val || '0' }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buccal (mm)</p>
          </div>
          <!-- Palatal Card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in toothData.lingual.pd" :key="i" 
                :class="parseInt(val) > 4 ? 'text-red-500' : 'text-[#0052ff]'">
                {{ val || '0' }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Palatal (mm)</p>
          </div>
        </div>
      </section>

      <!-- CAL Section -->
      <section>
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">CAL</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Buccal Card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in toothData.buccal.cal" :key="i" 
                :class="parseInt(val) > 4 ? 'text-red-500' : 'text-[#0052ff]'">
                {{ val || '0' }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buccal (mm)</p>
          </div>
          <!-- Palatal Card -->
          <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center group hover:border-[#0052ff]/20 transition-all">
            <div class="text-2xl font-black mb-1 flex items-center justify-center gap-0.5">
              <span v-for="(val, i) in toothData.lingual.cal" :key="i" 
                :class="parseInt(val) > 4 ? 'text-red-500' : 'text-[#0052ff]'">
                {{ val || '0' }}{{ Number(i) < 2 ? '-' : '' }}
              </span>
            </div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Palatal (mm)</p>
          </div>
        </div>
      </section>

      <!-- Visual Indicators Section -->
      <section class="grid grid-cols-2 gap-4">
        <!-- BoP Diagram -->
        <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center">
          <div class="relative w-16 h-16 mb-4">
            <!-- Simplified Surface Map Diagram -->
            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-45">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#e2e8f0" stroke-width="2" />
              <!-- Top (Buccal Mid) -->
              <path v-if="toothData.buccal.bop[1]" d="M50 0 L75 25 L50 50 L25 25 Z" fill="#ef4444" />
              <!-- Bottom (Lingual Mid) -->
              <path v-if="toothData.lingual.bop[1]" d="M50 50 L75 75 L50 100 L25 75 Z" fill="#ef4444" />
              <!-- Left (Distal) -->
              <path v-if="toothData.buccal.bop[0]" d="M0 50 L25 25 L50 50 L25 75 Z" fill="#ef4444" />
              <!-- Right (Mesial) -->
              <path v-if="toothData.buccal.bop[2]" d="M50 50 L75 25 L100 50 L75 75 Z" fill="#ef4444" />
              <!-- Lines -->
              <line x1="50" y1="0" x2="50" y2="100" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" stroke-width="1" />
            </svg>
          </div>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">BoP</p>
        </div>

        <!-- Plaque Diagram -->
        <div class="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center">
          <div class="relative w-16 h-16 mb-4">
            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-45">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#e2e8f0" stroke-width="2" />
              <!-- Top (Buccal Mid) -->
              <path v-if="toothData.buccal.pi[1]" d="M50 0 L75 25 L50 50 L25 25 Z" fill="#3b82f6" />
              <!-- Bottom (Lingual Mid) -->
              <path v-if="toothData.lingual.pi[1]" d="M50 50 L75 75 L50 100 L25 75 Z" fill="#3b82f6" />
              <!-- Left (Distal) -->
              <path v-if="toothData.buccal.pi[0]" d="M0 50 L25 25 L50 50 L25 75 Z" fill="#3b82f6" />
              <!-- Right (Mesial) -->
              <path v-if="toothData.buccal.pi[2]" d="M50 50 L75 25 L100 50 L75 75 Z" fill="#3b82f6" />
              <!-- Lines -->
              <line x1="50" y1="0" x2="50" y2="100" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" stroke-width="1" />
            </svg>
          </div>
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plaque</p>
        </div>
      </section>

      <!-- Analysis Summary -->
      <section class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 class="text-[13px] font-black text-slate-800 mb-6 flex items-center gap-2">
          Analysis Summary
        </h3>
        <div class="space-y-5">
          <div class="flex justify-between gap-4">
            <span class="text-[11px] font-bold text-slate-400">Prognosis K&C</span>
            <span class="text-[11px] font-bold text-[#3b82f6] text-right max-w-[180px] leading-relaxed">
              {{ analysisData?.prognosisKC }}
            </span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-[11px] font-bold text-slate-400">Prognosis M&N</span>
            <span class="text-[11px] font-bold text-[#3b82f6] text-right max-w-[180px] leading-relaxed">
              {{ analysisData?.prognosisMN }}
            </span>
          </div>
          <div class="flex justify-between items-center pt-2">
            <span class="text-[11px] font-bold text-slate-400">Buccal-KTW</span>
            <span class="text-[11px] font-black text-slate-700">{{ analysisData?.buccalKTW }} mm</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-slate-400">Palatal-KTW</span>
            <span class="text-[11px] font-black text-slate-700">{{ analysisData?.palatalKTW }} mm</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-slate-400">Mobility</span>
            <span class="text-[11px] font-black text-slate-700">Grade {{ analysisData?.mobility }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-slate-400">Furcation</span>
            <span class="text-[11px] font-black text-slate-700">{{ getFurLabel(analysisData?.furcation) }}</span>
          </div>
        </div>
      </section>

    </div>

    <!-- Footer Action -->
    <div class="p-6 bg-white border-t border-slate-50">
      <button class="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest transition-all active:scale-95">
        Detailed Assessment
      </button>
    </div>
  </div>
  
  <!-- Empty State -->
  <div v-else class="flex flex-col items-center justify-center h-full p-10 text-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
    <div class="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 text-slate-200 shadow-sm border border-slate-50">
      <Activity class="w-10 h-10" />
    </div>
    <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">No Tooth Selected</h3>
    <p class="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px] mx-auto">
      Select a tooth from the chart to view clinical analysis
    </p>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
