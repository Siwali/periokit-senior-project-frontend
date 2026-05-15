<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

const showPrognosisInfo = ref(false)
const isEditingNote = ref(false)
const noteInput = ref('')

const props = defineProps<{
  toothId: number | string | null
  toothData: any
}>()

const emit = defineEmits(['close', 'update-note'])

// Reset editing state when switching teeth
watch(() => props.toothId, () => {
  isEditingNote.value = false
  noteInput.value = ''
})

// Initialize note input when tooth changes or editing starts
const startEditing = () => {
  noteInput.value = props.toothData.note || ''
  isEditingNote.value = true
}

const saveNote = () => {
  emit('update-note', { id: props.toothId, note: noteInput.value })
  isEditingNote.value = false
}

const cancelEditing = () => {
  isEditingNote.value = false
  noteInput.value = ''
}

// Using computed properties for Analysis Summary data

const analysisData = computed(() => {
  if (!props.toothData) return null
  return {
    prognosisKC: props.toothData.prognosisKC || "N/A",
    prognosisMN: props.toothData.prognosisMN || "N/A",
    buccalKTW: props.toothData.ktw || "0",
    palatalKTW: props.toothData.ktw || "0", // Uses same KTW state unless decoupled later
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
        <div class="flex items-center gap-3">
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">#{{ toothId }}</h2>
          <span v-if="toothData.cut" class="px-2 py-1 bg-red-50 text-red-500 rounded border border-red-100 text-[9px] font-black uppercase tracking-wider">Missing</span>
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
        <h3 class="text-[13px] font-black text-slate-800 mb-6">
          Analysis Summary
        </h3>
        <div class="space-y-5">
          <!-- Prognosis K&C Row -->
          <div 
            @click="showPrognosisInfo = true" 
            class="flex justify-between gap-4 cursor-pointer group"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-400 border-b border-dotted border-slate-300 group-hover:text-[#0052ff] group-hover:border-[#0052ff] transition-all">
                Prognosis K&C
              </span>
              <svg class="text-slate-200 group-hover:text-[#0052ff] transition-colors" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <span class="text-[11px] font-bold text-[#3b82f6] text-right max-w-[180px] leading-relaxed">
              {{ analysisData?.prognosisKC || 'N/A' }}
            </span>
          </div>

          <!-- Prognosis M&N Row -->
          <div 
            @click="showPrognosisInfo = true" 
            class="flex justify-between gap-4 cursor-pointer group"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-400 border-b border-dotted border-slate-300 group-hover:text-[#0052ff] group-hover:border-[#0052ff] transition-all">
                Prognosis M&N
              </span>
              <svg class="text-slate-200 group-hover:text-[#0052ff] transition-colors" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <span class="text-[11px] font-bold text-[#3b82f6] text-right max-w-[180px] leading-relaxed">
              {{ analysisData?.prognosisMN || 'N/A' }}
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

      <!-- Note / Remark -->
      <section v-if="toothData.note && !isEditingNote" class="bg-yellow-50/50 border border-yellow-100 rounded-3xl p-6 shadow-sm group relative">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-[11px] font-black text-yellow-600 uppercase tracking-[0.15em]">Note</h3>
          <button @click="startEditing" class="opacity-0 group-hover:opacity-100 p-1 hover:bg-yellow-100 rounded text-yellow-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
        </div>
        <p class="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">{{ toothData.note }}</p>
      </section>

      <!-- Edit Note Form -->
      <section v-if="isEditingNote" class="bg-white border border-[#0052ff]/20 rounded-3xl p-6 shadow-xl ring-4 ring-[#0052ff]/5">
        <h3 class="text-[11px] font-black text-[#0052ff] uppercase tracking-[0.15em] mb-4">Clinical Note</h3>
        <textarea 
          v-model="noteInput"
          placeholder="Enter clinical observations, findings, or remarks for this tooth..."
          class="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0052ff]/10 focus:border-[#0052ff]/30 transition-all resize-none mb-4"
          autofocus
        ></textarea>
        <div class="flex gap-3">
          <button 
            @click="saveNote"
            class="flex-1 py-3 bg-[#0052ff] hover:bg-[#0041cc] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-200"
          >
            Save Note
          </button>
          <button 
            @click="cancelEditing"
            class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </section>

    </div>

    <!-- Footer Action -->
    <div class="p-6 bg-white border-t border-slate-50 mt-auto">
      <button 
        v-if="!isEditingNote"
        @click="startEditing"
        class="w-full py-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        {{ toothData.note ? 'Edit Clinical Note' : 'Add Clinical Note' }}
      </button>
    </div>
  </div>
  

  <!-- Prognosis Reference Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showPrognosisInfo" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div 
          class="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] shadow-2xl"
          @click.stop
        >
          <div class="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-50 flex items-center justify-between z-10">
            <h2 class="text-lg font-black text-slate-800 tracking-tight">Prognosis Classification Systems</h2>
            <button @click="showPrognosisInfo = false" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="p-8 space-y-10">
            <!-- Table 1: McGuire and Nunn -->
            <div>
              <div class="flex items-center gap-3 mb-5">
                <span class="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Table 1</span>
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide">McGuire and Nunn (M&N)</h3>
              </div>
              <div class="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Prognosis</th>
                      <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Criteria</th>
                    </tr>
                  </thead>
                  <tbody class="text-[11px] font-medium text-slate-600">
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-green-600 bg-green-50/30">Good</td>
                      <td class="px-4 py-4 leading-relaxed italic">Control of etiologic factors and enough support to enable the tooth to be maintained by the patient and clinician.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-blue-600 bg-blue-50/30">Fair</td>
                      <td class="px-4 py-4 leading-relaxed italic">~25% attachment loss, Class I furcation. Adequate maintenance possible.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-yellow-600 bg-yellow-50/30">Poor</td>
                      <td class="px-4 py-4 leading-relaxed italic">50% attachment loss, Class II furcation. Maintenance difficult.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-orange-600 bg-orange-50/30">Questionable</td>
                      <td class="px-4 py-4 leading-relaxed italic">> 50% attachment loss, Class II/III furcation, Class II mobility, poor crown/root ratio.</td>
                    </tr>
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-red-600 bg-red-50/30">Hopeless</td>
                      <td class="px-4 py-4 leading-relaxed italic">Severe attachment loss; extraction suggested.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Table 2: Kwok and Caton -->
            <div>
              <div class="flex items-center gap-3 mb-5">
                <span class="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Table 2</span>
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide">Kwok and Caton (K&C)</h3>
              </div>
              <div class="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Prognosis</th>
                      <th class="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Classification</th>
                    </tr>
                  </thead>
                  <tbody class="text-[11px] font-medium text-slate-600">
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-green-600 bg-green-50/30">Favorable</td>
                      <td class="px-4 py-4 leading-relaxed italic">Can be stabilized with treatment/maintenance; less chance of breakdown.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-orange-600 bg-orange-50/30">Questionable</td>
                      <td class="px-4 py-4 leading-relaxed italic">Influenced by local/systemic factors that may or may not be controlled.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-red-600 bg-red-50/30">Unfavorable</td>
                      <td class="px-4 py-4 leading-relaxed italic">Influenced by factors that cannot be controlled; maintenance unlikely.</td>
                    </tr>
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-black bg-slate-50/30">Hopeless</td>
                      <td class="px-4 py-4 leading-relaxed italic">Must be extracted.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="p-8 bg-slate-50/50 border-t border-slate-50 text-center rounded-b-[32px]">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Reference: Clinical Periodontology Standards</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
