<script setup lang="ts">
type PrognosisType = 'MN' | 'KC'

defineProps<{
  modelValue: PrognosisType | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PrognosisType | null]
}>()

const close = () => {
  emit('update:modelValue', null)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        @click="close"
      >
        <div
          class="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-4xl shadow-2xl"
          @click.stop
        >
          <div class="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-50 flex items-center justify-between z-10">
            <h2 class="text-lg font-black text-slate-800 tracking-tight">
              {{ modelValue === 'MN' ? 'McGuire and Nunn (M&N)' : 'Kwok and Caton (K&C)' }}
            </h2>
            <button @click="close" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="p-8 space-y-10">
            <div v-if="modelValue === 'MN'">
              <div class="flex items-center gap-3 mb-5">
                <span class="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Classification</span>
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide">Prognosis Criteria</h3>
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
                      <td class="px-4 py-4 leading-relaxed">Control of etiologic factors and enough support to enable the tooth to be maintained by the patient and clinician.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-blue-600 bg-blue-50/30">Fair</td>
                      <td class="px-4 py-4 leading-relaxed">~25% attachment loss, Class I furcation. Adequate maintenance possible.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-yellow-600 bg-yellow-50/30">Poor</td>
                      <td class="px-4 py-4 leading-relaxed">50% attachment loss, Class II furcation. Maintenance difficult.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-orange-600 bg-orange-50/30">Questionable</td>
                      <td class="px-4 py-4 leading-relaxed">> 50% attachment loss, Class II/III furcation, Class II mobility, poor crown/root ratio.</td>
                    </tr>
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-red-600 bg-red-50/30">Hopeless</td>
                      <td class="px-4 py-4 leading-relaxed">Severe attachment loss; extraction suggested.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="modelValue === 'KC'">
              <div class="flex items-center gap-3 mb-5">
                <span class="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Classification</span>
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide">Prognosis Criteria</h3>
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
                      <td class="px-4 py-4 leading-relaxed">Can be stabilized with treatment/maintenance; less chance of breakdown.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-orange-600 bg-orange-50/30">Questionable</td>
                      <td class="px-4 py-4 leading-relaxed">Influenced by local/systemic factors that may or may not be controlled.</td>
                    </tr>
                    <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-red-600 bg-red-50/30">Unfavorable</td>
                      <td class="px-4 py-4 leading-relaxed">Influenced by factors that cannot be controlled; maintenance unlikely.</td>
                    </tr>
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-4 font-black text-black bg-slate-50/30">Hopeless</td>
                      <td class="px-4 py-4 leading-relaxed">Must be extracted.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="p-8 bg-slate-50/50 border-t border-slate-50 text-center rounded-b-4xl">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Reference: Clinical Periodontology Standards</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
