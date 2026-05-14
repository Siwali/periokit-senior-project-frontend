<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Activity, FileText, Image as ImageIcon, Download, Stethoscope, Plus, Save, X, Info} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import Navbar from '../components/layout/Navbar.vue'

const authStore = useAuthStore()
const router = useRouter()
const user = authStore.user

// State for active tabs/sections
const activeSubNav = ref('chart')

// Mock patient data
const patientInfo = ref({
  hn: '65-010',
  doctor: 'Aj. Dr. Chatchai',
  studentId: '6310210000',
  patientName: 'John Doe',
  age: 45,
  nationality: 'Thai',
  gender: 'Male',
  date: new Date().toISOString().split('T')[0]
})

// Tooth Chart Data
const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

const teethData = ref<Record<string, any>>({})

// Furcation configuration helper
const getFurcationSites = (id: number) => {
  const idNum = Number(id);
  // Maxillary Molars: Buccal 1, Palatal 2
  if ([18, 17, 16, 26, 27, 28].includes(idNum)) return { buccal: 1, lingual: 2 };
  // Maxillary 1st Premolars: Palatal 2
  if ([14, 24].includes(idNum)) return { buccal: 0, lingual: 2 };
  // Mandibular Molars: Buccal 1, Lingual 1
  if ([48, 47, 46, 38, 37, 36].includes(idNum)) return { buccal: 1, lingual: 1 };
  return { buccal: 0, lingual: 0 };
}

// Initialize all 32 teeth
;[...upperTeeth, ...lowerTeeth].forEach(id => {
  const furConfig = getFurcationSites(id);
  teethData.value[id] = {
    implant: false,
    mo: '',
    ktw: '',
    fur: {
      buccal: new Array(furConfig.buccal).fill(0),
      lingual: new Array(furConfig.lingual).fill(0)
    },
    cut: false,
    prognosisKC: '',
    prognosisMN: '',
    buccal: {
      bop: [false, false, false],
      pi: [false, false, false],
      rec: ['', '', ''],
      pd: ['', '', ''],
      cal: ['', '', '']
    },
    lingual: { // or palatal
      bop: [false, false, false],
      pi: [false, false, false],
      rec: ['', '', ''],
      pd: ['', '', ''],
      cal: ['', '', '']
    }
  }
})

const toggleBop = (id: string | number, surface: 'buccal' | 'lingual', site: number) => {
  teethData.value[id][surface].bop[site] = !teethData.value[id][surface].bop[site]
}

const togglePi = (id: string | number, surface: 'buccal' | 'lingual', site: number) => {
  teethData.value[id][surface].pi[site] = !teethData.value[id][surface].pi[site]
}

const updateCal = (id: string | number, surface: 'buccal' | 'lingual', site: number) => {
  const pd = parseInt(teethData.value[id][surface].pd[site]) || 0
  const rec = parseInt(teethData.value[id][surface].rec[site]) || 0
  teethData.value[id][surface].cal[site] = (pd + rec).toString()
}

const toggleFur = (id: string | number, surface: 'buccal' | 'lingual', index: number) => {
  const current = teethData.value[id].fur[surface][index];
  teethData.value[id].fur[surface][index] = (current + 1) % 4;
}

const getFurSymbol = (grade: number) => {
  if (grade === 0) return ''
  if (grade === 1) return '○'
  if (grade === 2) return '◑'
  return '●'
}

const upperArch = [
  [18, 17, 16, 15, 14],
  [13, 12, 11, 21, 22, 23],
  [24, 25, 26, 27, 28]
]

const lowerArch = [
  [48, 47, 46, 45, 44],
  [43, 42, 41, 31, 32, 33],
  [34, 35, 36, 37, 38]
]


const buccalRows = ['Implant', 'Mo', 'KTW', 'Fur', 'BoP', 'PI', 'REC', 'PD', 'CAL']
const palatalRows = ['CAL', 'PD', 'REC', 'PI', 'BoP', 'Fur', 'KTW', 'Mo', 'Implant']
const lingualRows = ['Implant', 'Mo', 'KTW', 'Fur', 'BoP', 'PI', 'REC', 'PD', 'CAL']
const mandibularBuccalRows = ['CAL', 'PD', 'REC', 'PI', 'BoP', 'Fur', 'KTW', 'Mo', 'Implant']

const getToothImage = (id: number, surface: 'buccal' | 'lingual') => {
  const data = teethData.value[id]
  if (!data) return ''
  
  const isUpper = (id >= 11 && id <= 18) || (id >= 21 && id <= 28)
  const arch = isUpper ? 'arriba' : 'abajo'
  const isInner = surface === 'lingual'
  const suffix = isInner ? 'b' : ''
  
  let state = ''
  if (data.cut) state = 'tachados-'
  else if (data.implant) state = 'tornillo-'
  
  return `/images/teeth/periodontograma-dientes-${arch}-${state}${id}${suffix}.png`
}

</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] font-sans text-[#1e293b]">
    <Navbar />

    <!-- Sub-Navigation (Segmented Control style) -->
    <div class="bg-white border-b border-slate-200 py-2.5 sticky top-16 z-40">
      <div class="max-w-[1600px] mx-auto px-8 flex items-center justify-center">
        <div class="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          <button 
            @click="activeSubNav = 'chart'"
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="activeSubNav === 'chart' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            <FileText class="w-4 h-4" /> 
            Periodontal Chart
          </button>
          <button 
            @click="activeSubNav = 'xray'"
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="activeSubNav === 'xray' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            <ImageIcon class="w-4 h-4" /> 
            X-ray
          </button>
          <div class="w-px h-4 bg-slate-300 my-auto mx-1"></div>
          <button class="flex items-center gap-2 px-6 py-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-700 rounded-lg transition-all duration-200">
            <Download class="w-4 h-4" /> 
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-[1600px] mx-auto p-6 lg:p-8">
      <!-- Top Toolbar -->
      <div class="flex items-center justify-between mb-6">
        <button class="bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 shadow-sm">
          <FileText class="w-4 h-4" /> Overview
        </button>

        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-5 py-2 bg-white border border-[#9333ea]/30 text-[#9333ea] rounded-lg font-bold text-xs shadow-sm hover:bg-purple-50">
            <Stethoscope class="w-4 h-4" /> Diagnosis
          </button>
          <button class="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs shadow-sm hover:bg-slate-50">
            <Plus class="w-4 h-4" /> New Chart
          </button>
          <button class="flex items-center gap-2 px-5 py-2 bg-[#7aa4f0] text-white rounded-lg font-bold text-xs shadow-md hover:bg-[#6b94e0]">
            <Save class="w-4 h-4" /> Save Chart
          </button>
        </div>
      </div>

      <!-- Tab View -->
      <div class="flex items-center gap-0 mb-0 px-0.5 relative z-10">
        <div class="bg-white px-6 py-2.5 rounded-t-xl border-t border-l border-r border-slate-200 text-[11px] font-black text-[#0052ff] flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mb-[1px]">
          CHART 1
          <X class="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors" />
        </div>
        <button class="p-2.5 text-slate-400 hover:text-[#0052ff] transition-colors"><Plus class="w-5 h-5" /></button>
      </div>

      <!-- Chart Content Area -->
      <div class="flex gap-6">
        <div class="flex-1 flex flex-col gap-6">
          <!-- Patient Header Card -->
          <section class="bg-white rounded-r-3xl rounded-bl-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div class="p-10 border-b border-slate-100 bg-white">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-slate-800">HN-</span>
                  <input type="text" v-model="patientInfo.hn" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-sm font-bold w-40" />
                </div>
                <h1 class="text-3xl font-black text-slate-800 tracking-tight text-center">Periodontal Chart</h1>
                <div class="w-40"></div>
              </div>

              <div class="grid grid-cols-12 gap-y-4 gap-x-4 items-center">
                <div class="col-span-3 flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400 uppercase">Date:</span>
                  <input type="date" v-model="patientInfo.date" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
                </div>
                <div class="col-span-6 flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400 uppercase">Doctor:</span>
                  <input type="text" v-model="patientInfo.doctor" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
                </div>
                <div class="col-span-3 flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400 uppercase">Student ID:</span>
                  <input type="text" v-model="patientInfo.studentId" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
                </div>
                <div class="col-span-4 flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400 uppercase">Patient:</span>
                  <input type="text" v-model="patientInfo.patientName" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
                </div>
                <div class="col-span-2 flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400 uppercase">Age:</span>
                  <input type="number" v-model="patientInfo.age" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-12" />
                  <span class="text-[10px] font-bold text-slate-400">Y/O</span>
                </div>
                <div class="col-span-3 flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-400 uppercase">Nationality:</span>
                  <input type="text" v-model="patientInfo.nationality" class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full" />
                </div>
                <div class="col-span-3 flex items-center gap-6 pl-4">
                  <span class="text-xs font-bold text-slate-400 uppercase">Gender:</span>
                  <div class="flex gap-4">
                    <label v-for="g in ['Male', 'Female']" :key="g" class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" :value="g" v-model="patientInfo.gender" class="w-3.5 h-3.5 text-[#0052ff]" />
                      <span class="text-xs font-bold text-slate-600">{{ g }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Chart Grid Card -->
          <section class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div class="p-8 bg-[#f8fafc] overflow-x-auto">
              <!-- MAXILLARY ARCH (Upper) -->
              <div class="min-w-max">
                <!-- Maxillary Buccal Section (Top Grid) -->
                <div class="flex items-end mb-1">
                  <!-- Labels -->
                  <div class="flex flex-col bg-white border-l border-t border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
                    <div class="h-7 border-b border-r border-slate-300"></div>
                    <div v-for="row in buccalRows" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-300">
                      {{ row }}
                    </div>
                  </div>

                  <!-- Tooth Columns -->
                  <div class="flex">
                    <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                      <div class="flex border-t border-r border-slate-300 bg-white first:border-l">
                        <div v-for="(id, idx) in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px]" :class="gIdx === 1 && idx === 3 ? 'border-l-2 border-l-slate-400' : ''">
                          <!-- Tooth ID Header -->
                          <div class="h-7 bg-slate-50 flex items-center justify-center font-black text-slate-800 text-[11px] border-b border-slate-300">{{ id }}</div>
                          
                          <!-- Measurement Rows -->
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800">
                            <div v-for="(grade, fIdx) in teethData[id].fur.buccal" :key="fIdx" @click="toggleFur(id, 'buccal', fIdx)" class="flex items-center justify-center">
                              <svg v-if="grade > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                              <div v-else class="w-3 h-3 border border-slate-200 rounded-full"></div>
                            </div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="toggleBop(id, 'buccal', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].buccal.bop[s] ? 'bg-red-500' : ''"></div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="togglePi(id, 'buccal', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].buccal.pi[s] ? 'bg-blue-500' : ''"></div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].buccal.rec[s]" @input="updateCal(id, 'buccal', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].buccal.pd[s]" @input="updateCal(id, 'buccal', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-slate-200 bg-slate-50/30">
                            <input v-for="s in [0,1,2]" :key="s" type="text" :value="teethData[id].buccal.cal[s] || '0'" class="w-0 flex-1 text-center text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 bg-transparent outline-none pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- Missing Tooth / Cut Row -->
                <div class="flex mb-4">
                  <div class="w-20"></div>
                  <div class="flex">
                    <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                      <div class="flex">
                        <div v-for="id in group" :key="id" class="w-12 sm:w-[54px] h-8 flex items-center justify-center">
                          <button @click="teethData[id].cut = !teethData[id].cut" class="w-full h-6 text-[9px] font-black uppercase transition-all border border-slate-200" :class="teethData[id].cut ? 'bg-red-500 text-white border-red-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'">cut</button>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- Maxillary Tooth Illustrations -->
                <div class="flex flex-col gap-10 mb-6">
                  <!-- Buccal Illustration -->
                  <div class="flex">
                    <div class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4">
                      <span>B</span><span>U</span><span>C</span><span>C</span><span>A</span><span>L</span>
                    </div>
                    <div class="flex-1 flex">
                      <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg">
                          <div v-for="id in group" :key="id" class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10">
                            <span class="absolute top-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors">{{ id }}</span>
                            <img :src="getToothImage(id, 'buccal')" :alt="`Tooth ${id}`" class="w-12 h-auto object-contain transition-all duration-300 scale-x-[-1]" />
                            <!-- Furcation Dots -->
                            <div v-for="(grade, fIdx) in teethData[id].fur.buccal" :key="fIdx" 
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{ left: teethData[id].fur.buccal.length > 1 ? (fIdx === 0 ? '35%' : '65%') : '50%' }"
                            >
                              <svg v-if="grade > 0" class="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div v-if="gIdx !== 2" class="w-4"></div>
                      </template>
                    </div>
                  </div>

                  <!-- Palatal Illustration -->
                  <div class="flex">
                    <div class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4">
                      <span>P</span><span>A</span><span>L</span><span>A</span><span>T</span><span>A</span><span>L</span>
                    </div>
                    <div class="flex-1 flex">
                      <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg">
                          <div v-for="id in group" :key="id" class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10">
                            <span class="absolute top-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors">{{ id }}</span>
                            <img :src="getToothImage(id, 'lingual')" :alt="`Tooth ${id} Palatal`" class="w-12 h-auto object-contain transition-all duration-300" style="transform: scaleX(-1);" />
                            <!-- Furcation Dots -->
                            <div v-for="(grade, fIdx) in teethData[id].fur.lingual" :key="fIdx" 
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{ left: teethData[id].fur.lingual.length > 1 ? (fIdx === 0 ? '35%' : '65%') : '50%' }"
                            >
                              <svg v-if="grade > 0" class="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div v-if="gIdx !== 2" class="w-4"></div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Maxillary Palatal Section (Bottom Grid) -->
                <div class="flex mt-6 mb-16">
                  <div class="flex flex-col bg-white border-l border-y border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
                    <div v-for="row in palatalRows" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-200 last:border-b-0">
                      {{ row }}
                    </div>
                  </div>

                  <div class="flex">
                    <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                      <div class="flex border border-slate-300 border-l-0 bg-white first:border-l">
                        <div v-for="(id, idx) in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px]" :class="gIdx === 1 && idx === 3 ? 'border-l-2 border-l-slate-400' : ''">
                          <div class="flex h-6 border-b border-slate-200 bg-slate-50/30">
                            <input v-for="s in [0,1,2]" :key="s" type="text" :value="teethData[id].lingual.cal[s] || '0'" class="w-0 flex-1 text-center text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 bg-transparent outline-none pointer-events-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].lingual.pd[s]" @input="updateCal(id, 'lingual', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].lingual.rec[s]" @input="updateCal(id, 'lingual', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="togglePi(id, 'lingual', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].lingual.pi[s] ? 'bg-blue-500' : ''"></div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="toggleBop(id, 'lingual', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].lingual.bop[s] ? 'bg-red-500' : ''"></div>
                          </div>
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800">
                            <div v-for="(grade, fIdx) in teethData[id].fur.lingual" :key="fIdx" @click="toggleFur(id, 'lingual', fIdx)" class="flex items-center justify-center">
                              <svg v-if="grade > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                              <div v-else class="w-3 h-3 border border-slate-200 rounded-full"></div>
                            </div>
                          </div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- MANDIBULAR ARCH (Lower) -->
                <!-- Mandibular Lingual Section (Top Grid) -->
                <div class="flex items-end mb-1 mt-12">
                  <div class="flex flex-col bg-white border-l border-t border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
                    <div v-for="row in lingualRows" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-300">
                      {{ row }}
                    </div>
                  </div>

                  <div class="flex">
                    <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                      <div class="flex border-t border-r border-slate-300 bg-white first:border-l">
                        <div v-for="(id, idx) in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px]" :class="gIdx === 1 && idx === 3 ? 'border-l-2 border-l-slate-400' : ''">
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800">
                            <div v-for="(grade, fIdx) in teethData[id].fur.lingual" :key="fIdx" @click="toggleFur(id, 'lingual', fIdx)" class="flex items-center justify-center">
                              <svg v-if="grade > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                              <div v-else class="w-3 h-3 border border-slate-200 rounded-full"></div>
                            </div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="toggleBop(id, 'lingual', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].lingual.bop[s] ? 'bg-red-500' : ''"></div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="togglePi(id, 'lingual', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].lingual.pi[s] ? 'bg-blue-500' : ''"></div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].lingual.rec[s]" @input="updateCal(id, 'lingual', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].lingual.pd[s]" @input="updateCal(id, 'lingual', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-slate-200 bg-slate-50/30">
                            <input v-for="s in [0,1,2]" :key="s" type="text" :value="teethData[id].lingual.cal[s] || '0'" class="w-0 flex-1 text-center text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 bg-transparent outline-none pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- Mandibular Cut Row -->
                <div class="flex mt-1 mb-8">
                  <div class="w-20"></div>
                  <div class="flex">
                    <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                      <div class="flex">
                        <div v-for="id in group" :key="id" class="w-12 sm:w-[54px] h-8 flex items-center justify-center">
                          <button @click="teethData[id].cut = !teethData[id].cut" class="w-full h-6 text-[9px] font-black uppercase transition-all border border-slate-200" :class="teethData[id].cut ? 'bg-red-500 text-white border-red-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'">cut</button>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- Mandibular Tooth Illustrations -->
                <div class="flex flex-col gap-10 mb-6">
                  <!-- Lingual Illustration -->
                  <div class="flex">
                    <div class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4">
                      <span>L</span><span>I</span><span>N</span><span>G</span><span>U</span><span>A</span><span>L</span>
                    </div>
                    <div class="flex-1 flex">
                      <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg-inf">
                          <div v-for="id in group" :key="id" class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10">
                            <span class="absolute bottom-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors">{{ id }}</span>
                            <img :src="getToothImage(id, 'lingual')" :alt="`Tooth ${id} Lingual`" class="w-12 h-auto object-contain transition-all duration-300 scale-y-[-1] scale-x-[-1]" />
                            <!-- Furcation Dots -->
                            <div v-for="(grade, fIdx) in teethData[id].fur.lingual" :key="fIdx" 
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{ left: teethData[id].fur.lingual.length > 1 ? (fIdx === 0 ? '35%' : '65%') : '50%' }"
                            >
                              <svg v-if="grade > 0" class="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div v-if="gIdx !== 2" class="w-4"></div>
                      </template>
                    </div>
                  </div>

                  <!-- Buccal Illustration -->
                  <div class="flex">
                    <div class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4">
                      <span>B</span><span>U</span><span>C</span><span>C</span><span>A</span><span>L</span>
                    </div>
                    <div class="flex-1 flex">
                      <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg-inf">
                          <div v-for="id in group" :key="id" class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10">
                            <span class="absolute bottom-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors">{{ id }}</span>
                            <img :src="getToothImage(id, 'buccal')" :alt="`Tooth ${id}`" class="w-12 h-auto object-contain transition-all duration-300 scale-y-[-1] scale-x-[-1]" />
                            <!-- Furcation Dots -->
                            <div v-for="(grade, fIdx) in teethData[id].fur.buccal" :key="fIdx" 
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{ left: teethData[id].fur.buccal.length > 1 ? (fIdx === 0 ? '35%' : '65%') : '50%' }"
                            >
                              <svg v-if="grade > 0" class="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div v-if="gIdx !== 2" class="w-4"></div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Mandibular Buccal Section (Bottom Grid) -->
                <div class="flex mb-4">
                  <div class="flex flex-col bg-white border-l border-y border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20">
                    <div v-for="row in mandibularBuccalRows" :key="row" class="h-6 flex items-center px-2 border-b border-r border-slate-200 last:border-b-0">
                      {{ row }}
                    </div>
                    <div class="h-7 border-t border-r border-slate-300 bg-slate-50"></div>
                  </div>

                  <div class="flex">
                    <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                      <div class="flex border border-slate-300 border-l-0 bg-white first:border-l">
                        <div v-for="(id, idx) in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px]" :class="gIdx === 1 && idx === 3 ? 'border-l-2 border-l-slate-400' : ''">
                          <div class="flex h-6 border-b border-slate-200 bg-slate-50/30">
                            <input v-for="s in [0,1,2]" :key="s" type="text" :value="teethData[id].buccal.cal[s] || '0'" class="w-0 flex-1 text-center text-[10px] font-bold text-slate-700 border-r border-slate-100 last:border-r-0 bg-transparent outline-none pointer-events-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].buccal.pd[s]" @input="updateCal(id, 'buccal', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <input v-for="s in [0,1,2]" :key="s" type="text" v-model="teethData[id].buccal.rec[s]" @input="updateCal(id, 'buccal', s)" class="w-0 flex-1 text-center text-[10px] border-r border-slate-100 last:border-r-0 outline-none" />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="togglePi(id, 'buccal', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].buccal.pi[s] ? 'bg-blue-500' : ''"></div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <div v-for="s in [0,1,2]" :key="s" @click="toggleBop(id, 'buccal', s)" class="flex-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors" :class="teethData[id].buccal.bop[s] ? 'bg-red-500' : ''"></div>
                          </div>
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800">
                            <div v-for="(grade, fIdx) in teethData[id].fur.buccal" :key="fIdx" @click="toggleFur(id, 'buccal', fIdx)" class="flex items-center justify-center">
                              <svg v-if="grade > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="9" />
                                <path v-if="grade >= 2" d="M12 3a9 9 0 0 0 0 18z" :fill="grade === 2 ? 'currentColor' : 'none'" stroke="none" />
                                <circle v-if="grade === 3" cx="12" cy="12" r="9" fill="currentColor" />
                              </svg>
                              <div v-else class="w-3 h-3 border border-slate-200 rounded-full"></div>
                            </div>
                          </div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                          <div class="h-6 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                          <div class="h-7 bg-slate-50 flex items-center justify-center font-black text-slate-800 text-[11px] border-t border-slate-300">{{ id }}</div>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar Legend -->
        <aside class="w-72 flex flex-col gap-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 class="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Info class="w-3 h-3 text-[#0052ff]" /> KEY
            </h3>
            <ul class="space-y-2.5">
              <li v-for="(desc, key) in {
                'Implant': 'Dental Implant',
                'Mo': 'Mobility (Grade 0-3)',
                'KTW': 'Keratinized tissue width',
                'Fur': 'Furcation involvement',
                'BoP': 'Bleeding on probing',
                'PI': 'Plaque Index',
                'REC': 'Gingival recession',
                'PD': 'Probing depth',
                'CAL': 'Clinical attachment level',
                'CUT': 'Missing or Extracted tooth'
              }" :key="key" class="flex items-baseline gap-2">
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
                <span class="text-[10px] font-bold text-slate-500">: Grade I (Empty)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 flex justify-center">
                  <svg class="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" /></svg>
                </div>
                <span class="text-[10px] font-bold text-slate-500">: Grade II (Half)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 flex justify-center">
                  <svg class="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" fill="currentColor" /></svg>
                </div>
                <span class="text-[10px] font-bold text-slate-500">: Grade III (Full)</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
button, input {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

.writing-vertical {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.clinical-grid-bg {
  background-image: url('/images/teeth/fondo-grafico.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.clinical-grid-bg-inf {
  background-image: url('/images/teeth/fondo-grafico-inf.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
</style>
