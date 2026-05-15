<script setup lang="ts">
import type { PatientInfo } from '@/domain/chart/chart.types'

defineProps<{
  patientInfo: PatientInfo
}>()
</script>

<template>
  <section class="w-full bg-white rounded-r-3xl rounded-bl-3xl shadow-xl border border-slate-200 overflow-hidden relative z-0">
    <div class="p-6 border-b border-slate-100 bg-white">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="text-sm font-black text-slate-800">HN-</span>
          <input v-model="patientInfo.hn" type="text" placeholder="YY-XXX" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-sm font-bold w-40" />
        </div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight text-center">Periodontal Chart</h1>
        <div class="w-40"></div>
      </div>

      <div class="grid grid-cols-12 gap-y-4 gap-x-3 items-center">
        <div class="col-span-3 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Date:</span>
          <input v-model="patientInfo.date" type="date" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
        </div>
        <div class="col-span-6 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Doctor:</span>
          <input v-model="patientInfo.doctor" type="text" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
        </div>
        <div class="col-span-3 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Student ID:</span>
          <input v-model="patientInfo.studentId" type="text" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
        </div>
        <div class="col-span-4 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Patient:</span>
          <input v-model="patientInfo.patientName" type="text" placeholder="Full Name" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
        </div>
        <div class="col-span-2 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Age:</span>
          <input v-model="patientInfo.age" type="number" placeholder="0" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-12" />
          <span class="text-[10px] font-bold text-slate-400">Y/O</span>
        </div>
        <div class="col-span-3 flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Nationality:</span>
          <input v-model="patientInfo.nationality" type="text" placeholder="e.g. Thai" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
        </div>
        <div class="col-span-3 flex items-center gap-6 pl-4">
          <span class="text-xs font-bold text-slate-400 uppercase">Gender:</span>
          <div class="flex gap-4">
            <label v-for="gender in ['Male', 'Female']" :key="gender" class="flex items-center gap-2 cursor-pointer">
              <input v-model="patientInfo.gender" type="radio" :value="gender" class="w-3.5 h-3.5 text-[#0052ff]" />
              <span class="text-xs font-bold text-slate-600">{{ gender }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
