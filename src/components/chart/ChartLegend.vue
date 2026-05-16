<script setup lang="ts">
	import { Info, X } from 'lucide-vue-next'
	import { CHART_LEGEND_ITEMS } from '@/domain/chart/chart.constants'
	import { ref } from 'vue'

	defineProps<{
		isSidebarOpen: boolean
	}>()

	const isExpanded = ref(false)
</script>

<template>
  <aside :class="[
    'flex flex-col gap-6 sticky top-32 transition-all duration-500',
    isSidebarOpen ? 'w-16 z-150' : 'w-72 z-0'
  ]">
    <!-- Collapsed Icon Mode with Toggle -->
    <div v-if="isSidebarOpen" class="flex flex-col items-center relative">
      <!-- Toggle Button -->
      <button
        @click="isExpanded = !isExpanded"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200',
          isExpanded ? 'bg-[#0052ff]' : 'bg-slate-50'
        ]"
      >
        <Info
          :class="[
            'transition-all duration-200',
            isExpanded ? 'text-white' : 'text-[#0052ff]'
          ]"
          class="w-4 h-4"
        />
      </button>

      <!-- Expanded Panel -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="isExpanded"
          class="absolute left-full top-0 ml-4 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 min-w-50 z-200"
        >
          <!-- Close Button -->
          <button
            @click="isExpanded = false"
            class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X class="w-3 h-3" />
          </button>

          <h3 class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 flex items-center gap-2 pr-6">
            <Info class="w-3 h-3 text-[#0052ff]" /> KEY
          </h3>
          <ul class="space-y-2">
            <li v-for="(desc, key) in CHART_LEGEND_ITEMS" :key="key" class="flex items-baseline gap-2">
              <span class="text-[10px] font-black text-slate-800 min-w-10">{{ key }}</span>
              <span class="text-[10px] font-medium text-slate-400">= {{ desc }}</span>
            </li>
          </ul>

          <div class="mt-3 pt-3 border-t border-slate-100">
            <h4 class="text-[9px] font-black text-slate-800 uppercase tracking-wider mb-2">Furcation</h4>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /></svg>
                <span class="text-[9px] font-bold text-slate-500">Grade I</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" /></svg>
                <span class="text-[9px] font-bold text-slate-500">Grade II</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" fill="currentColor" /></svg>
                <span class="text-[9px] font-bold text-slate-500">Grade III</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Expanded Mode (when sidebar is closed) -->
    <template v-else>
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Info class="w-3 h-3 text-[#0052ff]" /> KEY
        </h3>
        <ul class="space-y-2.5">
          <li v-for="(desc, key) in CHART_LEGEND_ITEMS" :key="key" class="flex items-baseline gap-2">
            <span class="text-[10px] font-black text-slate-800 min-w-11.25">{{ key }}</span>
            <span class="text-[10px] font-medium text-slate-400">= {{ desc }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Furcation involvement</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-6 flex justify-center">
              <svg class="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /></svg>
            </div>
            <span class="text-[10px] font-bold text-slate-500">: Grade I</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-6 flex justify-center">
              <svg class="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" /></svg>
            </div>
            <span class="text-[10px] font-bold text-slate-500">: Grade II</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-6 flex justify-center">
              <svg class="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" fill="currentColor" /></svg>
            </div>
            <span class="text-[10px] font-bold text-slate-500">: Grade III</span>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>
