<script setup lang="ts">
import { Activity } from 'lucide-vue-next'
import { computed, type WritableComputedRef } from 'vue'
import type { PatientInfo, ChartSummary, PdBreakdown } from '@/domain/chart/chart.types'
import CountrySelect from './CountrySelect.vue'

const props = defineProps<{
  patientInfo: PatientInfo
  summary: ChartSummary
  showValidation?: boolean

  patientFieldsDisabled?: boolean

  visitFieldsDisabled?: boolean
  showSummary?: boolean
  forceDesktop?: boolean
}>()

const emit = defineEmits<{
  'update:patientInfo': [value: PatientInfo]
}>()


const localPatientInfo = computed({
  get: () => props.patientInfo,
  set: (value: PatientInfo) => emit('update:patientInfo', value)
}) as WritableComputedRef<PatientInfo>


const updateVisitPhase = (phase: string, checked: boolean) => {

	emit('update:patientInfo', {
		...props.patientInfo,
		visitPhase: checked ? phase : ''
	} as PatientInfo)
}


const updateGender = (gender: string, checked: boolean) => {

	emit('update:patientInfo', {
		...props.patientInfo,
		gender: checked ? gender : ''
	} as PatientInfo)
}


const sortedPdBreakdown = computed(() => {
  const breakdown: PdBreakdown = props.summary.pdBreakdown || {}
  return Object.entries(breakdown)
    .filter(([_, count]) => count > 0)
    .map(([depth, count]) => ({ depth: parseInt(depth), count }))
    .sort((a, b) => a.depth - b.depth)
})
</script>

<template>
  <section
    class="patient-chart-header bg-white rounded-2xl xl:rounded-l-none xl:rounded-r-3xl xl:rounded-bl-3xl xl:rounded-tl-none shadow-md xl:shadow-xl border border-slate-200 overflow-hidden relative z-0"
    :class="{ 'patient-chart-header--desktop': props.forceDesktop }"
  >
    <div class="patient-chart-header__body p-4 xl:p-6 border-b border-slate-100 bg-white">
      <div class="patient-chart-header__title-row flex flex-col xl:flex-row items-center justify-between gap-3 xl:gap-4 mb-4 xl:mb-5">
        <div class="patient-chart-header__hn flex items-center gap-2 w-full xl:w-auto justify-center xl:justify-start">
          <span class="text-[16px] font-bold text-slate-800">HN-</span>
          <input
            v-model="localPatientInfo.hn"
            type="text"
            :disabled="props.patientFieldsDisabled"
            :class="[
              'bg-slate-50 rounded-md px-2 py-1 text-[14px] w-40 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100',
              props.showValidation && !localPatientInfo.hn
                ? 'border-2 border-red-400 bg-red-50 placeholder-red-300'
                : 'border border-slate-300 focus:ring-2 focus:ring-blue-100'
            ]"
          />
        </div>
        <h1 class="patient-chart-header__title text-xl xl:text-3xl font-bold text-slate-800 tracking-tight text-center">Periodontal Chart</h1>
        <div class="patient-chart-header__title-spacer w-40 hidden xl:block"></div>
      </div>

      <div class="patient-chart-header__phases flex flex-wrap justify-center gap-3 xl:gap-8 mb-4 xl:mb-5">
        <label class="flex items-center gap-2 group" :class="props.visitFieldsDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'">
          <input
            type="checkbox"
            :checked="localPatientInfo.visitPhase === 'before_hygienic'"
            :disabled="props.visitFieldsDisabled"
            @change="updateVisitPhase('before_hygienic', ($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 text-black border-slate-600 focus:ring-slate-300 rounded-sm disabled:cursor-not-allowed"
          />
          <span class="text-[14px] font-medium text-black transition-colors">Before hygienic phase</span>
        </label>
        <label class="flex items-center gap-2 group" :class="props.visitFieldsDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'">
          <input
            type="checkbox"
            :checked="localPatientInfo.visitPhase === 'after_hygienic'"
            :disabled="props.visitFieldsDisabled"
            @change="updateVisitPhase('after_hygienic', ($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 text-black border-slate-600 focus:ring-slate-300 rounded-sm disabled:cursor-not-allowed"
          />
          <span class="text-[14px] font-medium text-black transition-colors">After hygienic phase</span>
        </label>
        <label class="flex items-center gap-2 group" :class="props.visitFieldsDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'">
          <input
            type="checkbox"
            :checked="localPatientInfo.visitPhase === 'after_corrective'"
            :disabled="props.visitFieldsDisabled"
            @change="updateVisitPhase('after_corrective', ($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 text-black border-slate-600 focus:ring-slate-300 rounded-sm disabled:cursor-not-allowed"
          />
          <span class="text-[14px] font-medium text-black transition-colors">After corrective phase</span>
        </label>
      </div>

      <div class="patient-chart-header__fields grid grid-cols-2 xl:grid-cols-12 gap-y-3 xl:gap-y-4 gap-x-3 xl:gap-x-5 items-center">

        <div class="patient-chart-header__field patient-chart-header__field--date col-span-2 xl:col-span-3 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Date:</span>
          <input v-model="localPatientInfo.date" type="date" :disabled="props.visitFieldsDisabled" class="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-[14px] w-full outline-none focus:ring-2 focus:ring-slate-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100" />
        </div>
        <div class="patient-chart-header__field patient-chart-header__field--doctor col-span-2 xl:col-span-6 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Doctor:</span>
          <input v-model="localPatientInfo.doctor" type="text" :disabled="props.visitFieldsDisabled" class="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-[14px] w-full outline-none focus:ring-2 focus:ring-slate-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100" />
        </div>
        <div class="patient-chart-header__field patient-chart-header__field--doctor-id col-span-2 xl:col-span-3 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Doctor ID:</span>
          <input v-model="localPatientInfo.studentId" type="text" :disabled="props.visitFieldsDisabled" class="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-[14px] w-full outline-none focus:ring-2 focus:ring-slate-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100" />
        </div>


        <div class="patient-chart-header__field patient-chart-header__field--patient col-span-2 xl:col-span-4 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Patient:</span>
          <input
            v-model="localPatientInfo.patientName"
            type="text"
            :disabled="props.patientFieldsDisabled"
            :class="[
              'rounded-md px-2 py-1 text-[14px] w-full outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100',
              props.showValidation && !localPatientInfo.patientName
                ? 'bg-red-50 border-2 border-red-400 placeholder-red-300'
                : 'bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-slate-300'
            ]"
          />
        </div>
        <div class="patient-chart-header__field patient-chart-header__field--age col-span-1 xl:col-span-2 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Age:</span>
          <div class="flex items-center gap-2 w-full">
            <input v-model="localPatientInfo.age" type="number" :disabled="props.patientFieldsDisabled" class="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-[14px] w-16 outline-none focus:ring-2 focus:ring-slate-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100" />
            <span class="text-[14px] text-black whitespace-nowrap shrink-0">years old</span>
          </div>
        </div>
        <div class="patient-chart-header__field patient-chart-header__field--nationality col-span-2 xl:col-span-3 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2 xl:ml-6">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Nationality:</span>
          <CountrySelect v-model="localPatientInfo.nationality" :disabled="props.patientFieldsDisabled" />
        </div>
        <div class="patient-chart-header__field patient-chart-header__field--gender col-span-1 xl:col-span-3 flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2 xl:justify-end">
          <span class="text-[14px] font-bold text-black whitespace-nowrap shrink-0">Gender:</span>
          <div class="flex gap-3">
            <label class="flex items-center gap-1.5 group" :class="props.patientFieldsDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'">
              <input type="checkbox" :checked="localPatientInfo.gender === 'Male'" :disabled="props.patientFieldsDisabled" @change="updateGender('Male', ($event.target as HTMLInputElement).checked)" class="w-4 h-4 text-black border-slate-600 focus:ring-slate-300 rounded-sm disabled:cursor-not-allowed" />
              <span class="text-[14px] font-medium text-black transition-colors">Male</span>
            </label>
            <label class="flex items-center gap-1.5 group" :class="props.patientFieldsDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'">
              <input type="checkbox" :checked="localPatientInfo.gender === 'Female'" :disabled="props.patientFieldsDisabled" @change="updateGender('Female', ($event.target as HTMLInputElement).checked)" class="w-4 h-4 text-black border-slate-600 focus:ring-slate-300 rounded-sm disabled:cursor-not-allowed" />
              <span class="text-[14px] font-medium text-black transition-colors">Female</span>
            </label>
          </div>
        </div>
      </div>
    </div>


    <div v-if="props.showSummary !== false" class="px-6 py-3 bg-linear-to-r from-slate-50 to-white border-t border-slate-100">
      <div class="flex items-center gap-3 overflow-x-auto">

        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 whitespace-nowrap">
          <Activity class="w-3.5 h-3.5 text-blue-500" />
          <span class="text-[11px] font-bold text-blue-600 uppercase">Summary</span>
        </div>


        <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-slate-400">Teeth</span>
          <span class="text-[11px] font-black text-slate-600">
            {{ props.summary.totalTeeth - props.summary.missingTeeth }}/{{ props.summary.totalTeeth }}
          </span>
        </div>


        <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-50 border border-violet-200 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-violet-400">Implants</span>
          <span class="text-[11px] font-black text-violet-600">
            {{ props.summary.implantTeeth }}
          </span>
        </div>


        <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-rose-400">BoP</span>
          <span class="text-[11px] font-black text-rose-600">
            {{ props.summary.bopPercentage }}%
          </span>
        </div>


        <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-blue-400">PI</span>
          <span class="text-[11px] font-black text-blue-600">
            {{ props.summary.piPercentage }}%
          </span>
        </div>


        <div v-if="props.summary.mobilityCount > 0" class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-amber-400">Mobility</span>
          <span class="text-[11px] font-black text-amber-600">
            {{ props.summary.mobilityCount }}
          </span>
        </div>


        <div v-if="props.summary.furcationCount > 0" class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-purple-400">Furcation</span>
          <span class="text-[11px] font-black text-purple-600">
            {{ props.summary.furcationCount }}
          </span>
        </div>


        <div v-if="props.summary.keratinizedLowCount > 0" class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 whitespace-nowrap">
          <span class="text-[10px] font-bold uppercase text-teal-400">KTW &lt;2</span>
          <span class="text-[11px] font-black text-teal-600">
            {{ props.summary.keratinizedLowCount }}
          </span>
        </div>


        <template v-for="item in sortedPdBreakdown" :key="item.depth">
          <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 whitespace-nowrap">
            <span class="text-[10px] font-bold uppercase text-rose-400">PD {{ item.depth }}mm</span>
            <span class="text-[11px] font-black text-rose-600">
              {{ item.count }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.patient-chart-header--desktop .patient-chart-header__body { padding: 1.5rem; }
.patient-chart-header--desktop .patient-chart-header__title-row {
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.patient-chart-header--desktop .patient-chart-header__hn {
  width: auto;
  justify-content: flex-start;
}
.patient-chart-header--desktop .patient-chart-header__title { font-size: 1.875rem; line-height: 2.25rem; }
.patient-chart-header--desktop .patient-chart-header__title-spacer { display: block; }
.patient-chart-header--desktop .patient-chart-header__phases {
  gap: 2rem;
  margin-bottom: 1.25rem;
}
.patient-chart-header--desktop .patient-chart-header__fields {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 1.25rem;
  row-gap: 1rem;
}
.patient-chart-header--desktop .patient-chart-header__field {
  flex-direction: row;
  align-items: center;
  gap: .5rem;
}
.patient-chart-header--desktop .patient-chart-header__field--date,
.patient-chart-header--desktop .patient-chart-header__field--doctor-id { grid-column: span 3 / span 3; }
.patient-chart-header--desktop .patient-chart-header__field--doctor { grid-column: span 6 / span 6; }
.patient-chart-header--desktop .patient-chart-header__field--patient { grid-column: span 4 / span 4; }
.patient-chart-header--desktop .patient-chart-header__field--age { grid-column: span 2 / span 2; }
.patient-chart-header--desktop .patient-chart-header__field--nationality {
  grid-column: span 3 / span 3;
  margin-left: 1.5rem;
}
.patient-chart-header--desktop .patient-chart-header__field--gender {
  grid-column: span 3 / span 3;
  justify-content: flex-end;
}
</style>
