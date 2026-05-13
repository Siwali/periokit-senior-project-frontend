<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { 
  Activity, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Stethoscope, 
  Plus, 
  Save,
  X,
  Info
} from 'lucide-vue-next'
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

// Initialize all 32 teeth
;[...upperTeeth, ...lowerTeeth].forEach(id => {
  teethData.value[id] = {
    implant: false,
    mo: '',
    ktw: '',
    fur: 0, // 0: none, 1: grade I, 2: grade II, 3: grade III
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

const toggleFur = (id: string | number) => {
  teethData.value[id].fur = (teethData.value[id].fur + 1) % 4
}

const getFurSymbol = (grade: number) => {
  if (grade === 0) return ''
  if (grade === 1) return '○'
  if (grade === 2) return '◑'
  return '●'
}

const upperGroups = [
  [18, 17, 16, 15, 14],
  [13, 12, 11, 21, 22, 23],
  [24, 25, 26, 27, 28]
]

const lowerGroups = [
  [48, 47, 46, 45, 44],
  [43, 42, 41, 31, 32, 33],
  [34, 35, 36, 37, 38]
]
</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] font-sans text-[#1e293b]">
    <Navbar />

    <!-- Sub-Navigation -->
    <div class="bg-white border-b border-slate-200 py-1.5 sticky top-16 z-40">
      <div class="max-w-[1600px] mx-auto px-8 flex items-center justify-center gap-3">
        <button 
          @click="activeSubNav = 'chart'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200"
          :class="activeSubNav === 'chart' ? 'bg-[#0052ff]/10 text-[#0052ff]' : 'text-slate-500 hover:bg-slate-50'"
        >
          <FileText class="w-4 h-4" /> 
          Periodontal Chart
        </button>
        <button 
          @click="activeSubNav = 'xray'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200"
          :class="activeSubNav === 'xray' ? 'bg-[#0052ff]/10 text-[#0052ff]' : 'text-slate-500 hover:bg-slate-50'"
        >
          <ImageIcon class="w-4 h-4" /> 
          X-ray
        </button>
        <div class="w-px h-5 bg-slate-200 mx-2 hidden sm:block"></div>
        <button class="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all duration-200">
          <Download class="w-4 h-4" /> 
          Export
        </button>
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
      <div class="flex items-center gap-1 mb-6">
        <div class="bg-white px-6 py-2 rounded-t-xl border-t border-l border-r border-slate-200 text-[11px] font-black text-slate-500 flex items-center gap-3 shadow-sm">
          CHART 1
          <X class="w-3 h-3 cursor-pointer hover:text-red-500" />
        </div>
        <button class="p-2 text-slate-300 hover:text-slate-500"><Plus class="w-4 h-4" /></button>
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

              <div class="grid grid-cols-12 gap-y-4 gap-x-6 items-center">
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
            <div class="p-8 bg-[#f8fafc] space-y-0">
              <!-- UPPER JAW -->
              <!-- Upper Grid (Buccal - TOP) -->
              <div class="flex gap-4 mb-2">
                <div v-for="(group, gIdx) in upperGroups" :key="gIdx" class="flex border border-slate-300 bg-white shadow-sm">
                  <div class="flex flex-col bg-slate-50 border-r border-slate-300 text-[8px] font-black text-slate-400 uppercase w-20">
                    <div class="h-6 flex items-center px-2 bg-slate-100 font-bold text-slate-500 border-b border-slate-200">ID</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Implant</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Mo</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">KTW</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Fur</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">BoP</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PI</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">REC</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PD</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">CAL</div>
                    <div class="h-6 flex items-center px-2 text-red-400">CUT</div>
                  </div>
                  <div v-for="id in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-[54px]">
                    <div class="h-6 bg-slate-100 flex items-center justify-center font-black text-slate-800 text-[11px] border-b border-slate-200">{{ id }}</div>
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center cursor-pointer select-none text-slate-800" @click="toggleFur(id)">
                      <svg v-if="teethData[id].fur > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="9" :fill="teethData[id].fur === 3 ? 'currentColor' : 'none'" />
                        <path v-if="teethData[id].fur === 2" d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
                      </svg>
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
                    <div class="flex h-6 border-b border-slate-200 bg-slate-50/50">
                      <div v-for="s in [0,1,2]" :key="s" class="flex-1 text-center text-[10px] font-bold text-slate-600 border-r border-slate-100 last:border-r-0">{{ teethData[id].buccal.cal[s] || '0' }}</div>
                    </div>
                    <div class="h-6 flex items-center justify-center">
                      <button @click="teethData[id].cut = !teethData[id].cut" class="w-full h-full text-[8px] font-black uppercase transition-all" :class="teethData[id].cut ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-400'">cut</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upper Illustrations (BUCCAL & PALATAL) -->
              <div class="flex gap-4">
                <div class="w-20 flex flex-col justify-center items-center text-[8px] font-black text-slate-400">
                  <div class="writing-vertical flex items-center justify-center gap-1 uppercase tracking-widest">BUCCAL</div>
                </div>
                <div class="flex-1 relative h-32 bg-white border border-slate-200 rounded-xl overflow-hidden mb-1">
                  <div class="absolute inset-0 flex flex-col justify-between py-2">
                    <div v-for="i in 10" :key="i" class="w-full h-[1px] bg-slate-50"></div>
                  </div>
                  <div class="absolute top-1/2 left-0 right-0 h-[2px] bg-red-400/30 z-10"></div>
                  <div class="relative h-full flex px-4 justify-between items-center">
                    <div v-for="id in upperTeeth" :key="id" class="w-[54px] h-full flex flex-col items-center justify-center group relative">
                        <Activity class="w-10 h-10 text-emerald-600/10 group-hover:text-emerald-600/30 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 mb-4">
                <div class="w-20 flex flex-col justify-center items-center text-[8px] font-black text-slate-400">
                  <div class="writing-vertical flex items-center justify-center gap-1 uppercase tracking-widest">PALATAL</div>
                </div>
                <div class="flex-1 relative h-32 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div class="absolute inset-0 flex flex-col justify-between py-2">
                    <div v-for="i in 10" :key="i" class="w-full h-[1px] bg-slate-50"></div>
                  </div>
                  <div class="absolute top-1/2 left-0 right-0 h-[2px] bg-red-400/30 z-10"></div>
                  <div class="relative h-full flex px-4 justify-between items-center">
                    <div v-for="id in upperTeeth" :key="id" class="w-[54px] h-full flex flex-col items-center justify-center group relative">
                        <Activity class="w-10 h-10 text-emerald-600/10 rotate-180 group-hover:text-emerald-600/30 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upper Grid (Palatal - MIDDLE) -->
              <div class="flex gap-4 mt-2 mb-16">
                <div v-for="(group, gIdx) in upperGroups" :key="gIdx" class="flex border border-slate-300 bg-white shadow-sm">
                  <div class="flex flex-col bg-slate-50 border-r border-slate-300 text-[8px] font-black text-slate-400 uppercase w-20">
                    <div class="h-6 flex items-center px-2 text-red-400 border-b border-slate-200">CUT</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">CAL</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PD</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">REC</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PI</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">BoP</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Fur</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">KTW</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Mo</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Implant</div>
                    <div class="h-6 flex items-center justify-center bg-slate-100 font-bold text-slate-500">ID</div>
                  </div>
                  <div v-for="id in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-[54px]">
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center">
                      <button @click="teethData[id].cut = !teethData[id].cut" class="w-full h-full text-[8px] font-black uppercase transition-all" :class="teethData[id].cut ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-400'">cut</button>
                    </div>
                    <div class="flex h-6 border-b border-slate-200 bg-slate-50/50">
                      <div v-for="s in [0,1,2]" :key="s" class="flex-1 text-center text-[10px] font-bold text-slate-600 border-r border-slate-100 last:border-r-0">{{ teethData[id].lingual.cal[s] || '0' }}</div>
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
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center cursor-pointer select-none text-slate-800" @click="toggleFur(id)">
                      <svg v-if="teethData[id].fur > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="9" :fill="teethData[id].fur === 3 ? 'currentColor' : 'none'" />
                        <path v-if="teethData[id].fur === 2" d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                    <div class="h-6 bg-slate-100 flex items-center justify-center font-black text-slate-800 text-[11px]">{{ id }}</div>
                  </div>
                </div>
              </div>

              <!-- LOWER JAW -->
              <!-- Lower Grid (Lingual - MIDDLE) -->
              <div class="flex gap-4 mb-2">
                <div v-for="(group, gIdx) in lowerGroups" :key="gIdx" class="flex border border-slate-300 bg-white shadow-sm">
                  <div class="flex flex-col bg-slate-50 border-r border-slate-300 text-[8px] font-black text-slate-400 uppercase w-20">
                    <div class="h-6 flex items-center px-2 bg-slate-100 font-bold text-slate-500 border-b border-slate-200">ID</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Implant</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Mo</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">KTW</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Fur</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">BoP</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PI</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">REC</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PD</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">CAL</div>
                    <div class="h-6 flex items-center px-2 text-red-400">CUT</div>
                  </div>
                  <div v-for="id in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-[54px]">
                    <div class="h-6 bg-slate-100 flex items-center justify-center font-black text-slate-800 text-[11px] border-b border-slate-200">{{ id }}</div>
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center cursor-pointer select-none text-slate-800" @click="toggleFur(id)">
                      <svg v-if="teethData[id].fur > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="9" :fill="teethData[id].fur === 3 ? 'currentColor' : 'none'" />
                        <path v-if="teethData[id].fur === 2" d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
                      </svg>
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
                    <div class="flex h-6 border-b border-slate-200 bg-slate-50/50">
                      <div v-for="s in [0,1,2]" :key="s" class="flex-1 text-center text-[10px] font-bold text-slate-600 border-r border-slate-100 last:border-r-0">{{ teethData[id].lingual.cal[s] || '0' }}</div>
                    </div>
                    <div class="h-6 flex items-center justify-center">
                      <button @click="teethData[id].cut = !teethData[id].cut" class="w-full h-full text-[8px] font-black uppercase transition-all" :class="teethData[id].cut ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-400'">cut</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lower Illustrations (LINGUAL & BUCCAL) -->
              <div class="flex gap-4">
                <div class="w-20 flex flex-col justify-center items-center text-[8px] font-black text-slate-400">
                  <div class="writing-vertical flex items-center justify-center gap-1 uppercase tracking-widest">LINGUAL</div>
                </div>
                <div class="flex-1 relative h-32 bg-white border border-slate-200 rounded-xl overflow-hidden mb-1">
                  <div class="absolute inset-0 flex flex-col justify-between py-2">
                    <div v-for="i in 10" :key="i" class="w-full h-[1px] bg-slate-50"></div>
                  </div>
                  <div class="absolute top-1/2 left-0 right-0 h-[2px] bg-red-400/30 z-10"></div>
                  <div class="relative h-full flex px-4 justify-between items-center">
                    <div v-for="id in lowerTeeth" :key="id" class="w-[54px] h-full flex flex-col items-center justify-center group relative">
                        <Activity class="w-10 h-10 text-emerald-600/10 rotate-180 group-hover:text-emerald-600/30 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 mb-4">
                <div class="w-20 flex flex-col justify-center items-center text-[8px] font-black text-slate-400">
                  <div class="writing-vertical flex items-center justify-center gap-1 uppercase tracking-widest">BUCCAL</div>
                </div>
                <div class="flex-1 relative h-32 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div class="absolute inset-0 flex flex-col justify-between py-2">
                    <div v-for="i in 10" :key="i" class="w-full h-[1px] bg-slate-50"></div>
                  </div>
                  <div class="absolute top-1/2 left-0 right-0 h-[2px] bg-red-400/30 z-10"></div>
                  <div class="relative h-full flex px-4 justify-between items-center">
                    <div v-for="id in lowerTeeth" :key="id" class="w-[54px] h-full flex flex-col items-center justify-center group relative">
                        <Activity class="w-10 h-10 text-emerald-600/10 group-hover:text-emerald-600/30 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lower Grid (Buccal - BOTTOM) -->
              <div class="flex gap-4 mt-2">
                <div v-for="(group, gIdx) in lowerGroups" :key="gIdx" class="flex border border-slate-300 bg-white shadow-sm">
                  <div class="flex flex-col bg-slate-50 border-r border-slate-300 text-[8px] font-black text-slate-400 uppercase w-20">
                    <div class="h-6 flex items-center px-2 text-red-400 border-b border-slate-200">CUT</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">CAL</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PD</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">REC</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">PI</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">BoP</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Fur</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">KTW</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Mo</div>
                    <div class="h-6 flex items-center px-2 border-b border-slate-200">Implant</div>
                    <div class="h-6 flex items-center justify-center bg-slate-100 font-bold text-slate-500">ID</div>
                  </div>
                  <div v-for="id in group" :key="id" class="flex flex-col border-r border-slate-200 last:border-r-0 w-[54px]">
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center">
                      <button @click="teethData[id].cut = !teethData[id].cut" class="w-full h-full text-[8px] font-black uppercase transition-all" :class="teethData[id].cut ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-400'">cut</button>
                    </div>
                    <div class="flex h-6 border-b border-slate-200 bg-slate-50/50">
                      <div v-for="s in [0,1,2]" :key="s" class="flex-1 text-center text-[10px] font-bold text-slate-600 border-r border-slate-100 last:border-r-0">{{ teethData[id].buccal.cal[s] || '0' }}</div>
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
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center cursor-pointer select-none text-slate-800" @click="toggleFur(id)">
                      <svg v-if="teethData[id].fur > 0" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="9" :fill="teethData[id].fur === 3 ? 'currentColor' : 'none'" />
                        <path v-if="teethData[id].fur === 2" d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].ktw" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200"><input type="text" v-model="teethData[id].mo" class="w-full h-full text-center text-[11px] outline-none" /></div>
                    <div class="h-6 border-b border-slate-200 flex items-center justify-center"><input type="checkbox" v-model="teethData[id].implant" class="w-3.5 h-3.5 accent-slate-800" /></div>
                    <div class="h-6 bg-slate-100 flex items-center justify-center font-black text-slate-800 text-[11px]">{{ id }}</div>
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
                <span class="text-[10px] font-bold text-slate-500">: Grade I</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 flex justify-center">
                  <svg class="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" /></svg>
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
</style>
