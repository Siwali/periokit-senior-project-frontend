<script setup lang="ts">
import type { PatientInfo } from '@/domain/chart/chart.types'

defineProps<{
  patientInfo: PatientInfo
}>()
</script>

<template>
  <section class="bg-white rounded-r-3xl rounded-bl-3xl shadow-xl border border-slate-200 overflow-hidden relative z-0">
    <div class="p-10 border-b border-slate-100 bg-white">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-2">
          <span class="text-sm font-black text-slate-800">HN-</span>
          <input v-model="patientInfo.hn" type="text" placeholder="YY-XXX" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-sm font-bold w-40" />
        </div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight text-center">Periodontal Chart</h1>
        <div class="w-40"></div>
      </div>

      <div class="grid grid-cols-12 gap-y-4 gap-x-6 items-center">
        <div class="col-span-2 flex items-center gap-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Date:</span>
          <input v-model="patientInfo.date" type="date" class="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div class="col-span-5 flex items-center gap-2 ml-6">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Doctor:</span>
          <input v-model="patientInfo.doctor" type="text" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div class="col-span-4 flex items-center gap-2 ml-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Student ID:</span>
          <input v-model="patientInfo.studentId" type="text" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div class="col-span-4 flex items-center gap-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Patient:</span>
          <input v-model="patientInfo.patientName" type="text" placeholder="Full Name" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div class="col-span-2 flex items-center gap-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Age:</span>
          <input v-model="patientInfo.age" type="number" placeholder="0" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div class="col-span-3 flex items-center gap-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Nationality:</span>
          <input v-model="patientInfo.nationality" type="text" placeholder="e.g. Thai" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div class="col-span-3 flex items-center gap-4 pl-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0">Gender:</span>
          <div class="flex gap-3">
            <label v-for="gender in ['Male', 'Female']" :key="gender" class="flex items-center gap-1.5 cursor-pointer group">
              <input v-model="patientInfo.gender" type="radio" :value="gender" class="w-3.5 h-3.5 text-[#0052ff] border-slate-300 focus:ring-blue-100" />
              <span class="text-[11px] font-bold text-slate-600 group-hover:text-[#0052ff] transition-colors">{{ gender }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
