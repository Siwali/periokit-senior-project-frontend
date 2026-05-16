<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { CHART_LEGEND_ITEMS } from '@/domain/chart/chart.constants'
</script>

<template>
  <aside class="w-72 flex flex-col gap-6 sticky top-32">
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
        <Info class="w-3 h-3 text-[#0052ff]" /> KEY
      </h3>
      <ul class="space-y-2.5">
        <li v-for="(desc, key) in CHART_LEGEND_ITEMS" :key="key" class="flex items-baseline gap-2">
          <span class="text-[10px] font-black text-slate-800 min-w-[45px]">{{ key }}</span>
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
  </aside>
</template>
