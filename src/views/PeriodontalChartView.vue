<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Stethoscope,
  Plus,
  Save,
  X,
} from "lucide-vue-next";
import Navbar from "../components/layout/Navbar.vue";
import ToothSidebarOverlay from "../components/chart/ToothSidebarOverlay.vue";
import ClinicalInputCell from "../components/chart/ClinicalInputCell.vue";
import { calculateCALValue } from "../utils/calculations";

const authStore = useAuthStore();
const user = authStore.user;

// State for active tabs/sections
const activeSubNav = ref("chart");

// Tooth Selection State
const selectedToothId = ref<number | string | null>(null);
const isSidebarOpen = ref(false);

const selectTooth = (id: number | string, triggerSidebar = false) => {
  selectedToothId.value = id;
  if (triggerSidebar) {
    isSidebarOpen.value = true;
  }
};

const selectedToothData = computed(() => {
  if (selectedToothId.value === null) return null;
  return teethData.value[selectedToothId.value];
});

// Mock patient data
// Patient data (Doctor and Student ID based on user account, others cleared for manual input)
const patientInfo = ref({
  hn: "",
  doctor: user?.first_name
    ? `${user.first_name} ${user.last_name}`
    : "Aj. Dr. Chatchai",
  studentId: user?.student_id || "6310210000",
  patientName: "",
  age: null as number | null,
  nationality: "",
  gender: "",
  date: new Date().toISOString().split("T")[0],
});

// Tooth Chart Data
const upperTeeth = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];
const lowerTeeth = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

const teethData = ref<Record<string, any>>({});

// Furcation configuration helper
const getFurcationSites = (id: number) => {
  const idNum = Number(id);
  // Maxillary Molars: Buccal 1, Palatal 2
  if ([18, 17, 16, 26, 27, 28].includes(idNum))
    return { buccal: 1, lingual: 2 };
  // Maxillary 1st Premolars: Palatal 2
  if ([14, 24].includes(idNum)) return { buccal: 0, lingual: 2 };
  // Mandibular Molars: Buccal 1, Lingual 1
  if ([48, 47, 46, 38, 37, 36].includes(idNum))
    return { buccal: 1, lingual: 1 };
  return { buccal: 0, lingual: 0 };
};

// Initialize all 32 teeth
[...upperTeeth, ...lowerTeeth].forEach((id) => {
  const furConfig = getFurcationSites(id);
  teethData.value[id] = {
    implant: false,
    mo: "",
    ktw: "",
    fur: {
      buccal: new Array(furConfig.buccal).fill(0),
      lingual: new Array(furConfig.lingual).fill(0),
    },
    cut: false,
    prognosisKC: "",
    prognosisMN: "",
    buccal: {
      bop: [false, false, false],
      pi: [false, false, false],
      rec: ["", "", ""],
      pd: ["", "", ""],
      cal: ["", "", ""],
    },
    lingual: {
      // or palatal
      bop: [false, false, false],
      pi: [false, false, false],
      rec: ["", "", ""],
      pd: ["", "", ""],
      cal: ["", "", ""],
    },
    note: "",
  };
});

const updateCal = (
  id: string | number,
  surface: "buccal" | "lingual",
  site: number,
) => {
  if (teethData.value[id].cut) return;
  const pd = teethData.value[id][surface].pd[site];
  const rec = teethData.value[id][surface].rec[site];
  teethData.value[id][surface].cal[site] = calculateCALValue(
    pd,
    rec,
  ).toString();
};

const updateClinicalData = (
  id: string | number,
  surface: "buccal" | "lingual",
  field: string,
  site: number,
  value: any,
) => {
  if (teethData.value[id].cut) return;

  // Cast to correct type if necessary
  if (field === "bop" || field === "pi") {
    teethData.value[id][surface][field][site] = !!value;
  } else {
    teethData.value[id][surface][field][site] = value;
    if (field === "pd" || field === "rec") {
      updateCal(id, surface, site);
    }
  }
};

const toggleFur = (
  id: string | number,
  surface: "buccal" | "lingual",
  index: number | string,
) => {
  if (teethData.value[id].cut || teethData.value[id].implant) return;
  const numIndex = Number(index);
  const current = teethData.value[id].fur[surface][numIndex];
  teethData.value[id].fur[surface][numIndex] = (current + 1) % 4;
};

const getFurImage = (grade: number) => {
  if (grade === 1) return "/images/teeth/vacio.png";
  if (grade === 2) return "/images/teeth/mediolleno.png";
  if (grade === 3) return "/images/teeth/lleno.png";
  return "";
};

const upperArch = [
  [18, 17, 16, 15, 14],
  [13, 12, 11, 21, 22, 23],
  [24, 25, 26, 27, 28],
];

const lowerArch = [
  [48, 47, 46, 45, 44],
  [43, 42, 41, 31, 32, 33],
  [34, 35, 36, 37, 38],
];

const buccalRows = [
  "Implant",
  "Mobility",
  "Keratinized",
  "Furcation",
  "BOP",
  "PI",
  "Recession",
  "PD",
  "CAL",
];
const palatalRows = [
  "Implant",
  "Mobility",
  "Keratinized",
  "Furcation",
  "BOP",
  "PI",
  "Recession",
  "PD",
  "CAL",
];

const getToothImage = (id: number | string, surface: "buccal" | "lingual") => {
  const data = teethData.value[id];
  if (!data) return "";

  const idNum = Number(id);
  const isUpper = (idNum >= 11 && idNum <= 18) || (idNum >= 21 && idNum <= 28);
  const arch = isUpper ? "arriba" : "abajo";
  const isInner = surface === "lingual";
  const suffix = isInner ? "b" : "";

  let state = "";
  if (data.cut) state = "tachados-";
  else if (data.implant) state = "tornillo-";

  return `/images/teeth/periodontograma-dientes-${arch}-${state}${id}${suffix}.png`;
};

const handleUpdateNote = ({
  id,
  note,
}: {
  id: string | number;
  note: string;
}) => {
  if (teethData.value[id]) {
    teethData.value[id].note = note;
  }
};

// --- Keyboard Navigation Logic ---
const chartContainerRef = ref<HTMLElement | null>(null);

const handleKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("chart-input")) return;

  const key = e.key;
  if (
    !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(key)
  )
    return;

  e.preventDefault();

  const currentTooth = target.getAttribute("data-tooth");
  const currentField = target.getAttribute("data-field");
  const currentSite = parseInt(target.getAttribute("data-site") || "0");
  const currentSurface = target.getAttribute("data-surface");

  // Get all potential inputs in the chart
  const allInputs = Array.from(
    chartContainerRef.value?.querySelectorAll(".chart-input") || [],
  ) as HTMLElement[];

  const currentIndex = allInputs.indexOf(target);
  if (currentIndex === -1) return;

  let nextTarget: HTMLElement | null = null;

  if (key === "ArrowDown") {
    // Vertical: Find next field (row) for the same tooth/site
    for (let i = currentIndex + 1; i < allInputs.length; i++) {
      if (
        allInputs[i].getAttribute("data-tooth") === currentTooth &&
        allInputs[i].getAttribute("data-site") === currentSite.toString() &&
        allInputs[i].getAttribute("data-surface") === currentSurface &&
        !(allInputs[i] as HTMLInputElement).disabled
      ) {
        nextTarget = allInputs[i];
        break;
      }
    }
  } else if (key === "ArrowUp") {
    // Vertical: Find previous field (row) for the same tooth/site
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (
        allInputs[i].getAttribute("data-tooth") === currentTooth &&
        allInputs[i].getAttribute("data-site") === currentSite.toString() &&
        allInputs[i].getAttribute("data-surface") === currentSurface &&
        !(allInputs[i] as HTMLInputElement).disabled
      ) {
        nextTarget = allInputs[i];
        break;
      }
    }
  } else if (key === "ArrowRight" || key === "Enter") {
    // Strict Row-based navigation:
    // First, try to find the next input in the SAME field (row)
    for (let i = currentIndex + 1; i < allInputs.length; i++) {
      const input = allInputs[i] as HTMLInputElement;
      if (
        !input.disabled && 
        input.offsetParent !== null &&
        input.getAttribute("data-field") === currentField &&
        input.getAttribute("data-surface") === currentSurface
      ) {
        nextTarget = input;
        break;
      }
    }
    
    // If we reached the end of the current row, jump to the first input of the NEXT row
    if (!nextTarget) {
      for (let i = currentIndex + 1; i < allInputs.length; i++) {
        const input = allInputs[i] as HTMLInputElement;
        if (!input.disabled && input.offsetParent !== null) {
          nextTarget = input;
          break;
        }
      }
    }
  } else if (key === "ArrowLeft") {
    // Previous in row
    for (let i = currentIndex - 1; i >= 0; i--) {
      const input = allInputs[i] as HTMLInputElement;
      if (
        !input.disabled && 
        input.offsetParent !== null &&
        input.getAttribute("data-field") === currentField &&
        input.getAttribute("data-surface") === currentSurface
      ) {
        nextTarget = input;
        break;
      }
    }
    
    // If at the start of row, jump to the end of the PREVIOUS row
    if (!nextTarget) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const input = allInputs[i] as HTMLInputElement;
        if (!input.disabled && input.offsetParent !== null) {
          nextTarget = input;
          break;
        }
      }
    }
  }

  if (nextTarget) {
    nextTarget.focus();
    
    const nextToothId = nextTarget.getAttribute("data-tooth");
    if (nextToothId && nextToothId !== selectedToothId.value) {
      selectTooth(nextToothId);
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#f1f5f9] font-sans text-[#1e293b]">
    <Navbar />

    <!-- Sub-Navigation (Segmented Control style) -->
    <div class="bg-white border-b border-slate-200 py-2.5 sticky top-16 z-40">
      <div class="max-w-[1600px] mx-auto px-8 flex items-center justify-center">
        <div
          class="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200"
        >
          <button
            @click="activeSubNav = 'chart'"
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="
              activeSubNav === 'chart'
                ? 'bg-white text-[#0052ff] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
          >
            <FileText class="w-4 h-4" />
            Periodontal Chart
          </button>
          <button
            @click="activeSubNav = 'xray'"
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="
              activeSubNav === 'xray'
                ? 'bg-white text-[#0052ff] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
          >
            <ImageIcon class="w-4 h-4" />
            X-ray
          </button>
          <div class="w-px h-4 bg-slate-300 my-auto mx-1"></div>
          <button
            @click="activeSubNav = 'export'"
            class="flex items-center gap-2 px-6 py-1.5 rounded-lg text-[13px] font-bold transition-all duration-200"
            :class="
              activeSubNav === 'export'
                ? 'bg-white text-[#0052ff] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
          >
            <Download class="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-[1800px] mx-auto p-6 lg:p-8 overflow-visible">
      <!-- Top Toolbar -->
      <div class="flex items-center justify-between mb-6">
        <button
          class="bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FileText class="w-4 h-4" /> Overview
        </button>

        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-2 px-5 py-2 bg-white border border-[#9333ea]/30 text-[#9333ea] rounded-lg font-bold text-xs shadow-sm hover:bg-purple-50 transition-colors"
          >
            <Stethoscope class="w-4 h-4" /> Diagnosis
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Plus class="w-4 h-4" /> New Chart
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2 bg-[#7aa4f0] text-white rounded-lg font-bold text-xs shadow-md hover:bg-[#6b94e0] transition-colors"
          >
            <Save class="w-4 h-4" /> Save Chart
          </button>
        </div>
      </div>

      <!-- Chart Content Area - Centered and shifts when sidebar opens -->
      <!-- Main Content Container with dynamic padding for sidebar space -->
      <div
        class="flex justify-center items-start transition-all duration-500 ease-in-out"
        :style="{
          paddingRight: selectedToothId && isSidebarOpen ? '340px' : '0',
        }"
      >
        <div
          class="w-full max-w-fit flex-shrink-0 flex flex-col gap-0 transition-all duration-500"
        >
          <!-- Tab View - Now inside the same container -->
          <div class="flex items-center gap-0 relative z-10">
            <div
              class="bg-white px-6 py-2.5 rounded-t-xl border-t border-l border-r border-slate-200 text-[11px] font-black text-[#0052ff] flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mb-[1px]"
            >
              CHART 1
              <X
                class="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors"
              />
            </div>
            <button
              class="p-2.5 text-slate-400 hover:text-[#0052ff] transition-colors"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- Patient Header Card -->
          <section
            class="bg-white rounded-r-3xl rounded-bl-3xl shadow-xl border border-slate-200 overflow-hidden relative z-0"
          >
            <div class="p-10 border-b border-slate-100 bg-white">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-slate-800">HN-</span>
                  <input
                    type="text"
                    v-model="patientInfo.hn"
                    placeholder="YY-XXX"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-sm font-bold w-40"
                  />
                </div>
                <h1
                  class="text-3xl font-black text-slate-800 tracking-tight text-center"
                >
                  Periodontal Chart
                </h1>
                <div class="w-40"></div>
              </div>

              <div class="grid grid-cols-12 gap-y-4 gap-x-6 items-center">
                <!-- Row 1: Date, Doctor, Student ID -->
                <div class="col-span-2 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Date:</span
                  >
                  <input
                    type="date"
                    v-model="patientInfo.date"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div class="col-span-6 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Doctor:</span
                  >
                  <input
                    type="text"
                    v-model="patientInfo.doctor"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div class="col-span-4 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Student ID:</span
                  >
                  <input
                    type="text"
                    v-model="patientInfo.studentId"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <!-- Row 2: Patient, Age, Nationality, Gender -->
                <div class="col-span-4 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Patient:</span
                  >
                  <input
                    type="text"
                    v-model="patientInfo.patientName"
                    placeholder="Full Name"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div class="col-span-2 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Age:</span
                  >
                  <input
                    type="number"
                    v-model="patientInfo.age"
                    placeholder="0"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div class="col-span-3 flex items-center gap-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Nationality:</span
                  >
                  <input
                    type="text"
                    v-model="patientInfo.nationality"
                    placeholder="e.g. Thai"
                    class="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div class="col-span-3 flex items-center gap-4 pl-2">
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap shrink-0"
                    >Gender:</span
                  >
                  <div class="flex gap-3">
                    <label
                      v-for="g in ['Male', 'Female']"
                      :key="g"
                      class="flex items-center gap-1.5 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        :value="g"
                        v-model="patientInfo.gender"
                        class="w-3.5 h-3.5 text-[#0052ff] border-slate-300 focus:ring-blue-100"
                      />
                      <span
                        class="text-[11px] font-bold text-slate-600 group-hover:text-[#0052ff] transition-colors"
                        >{{ g }}</span
                      >
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            class="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div
              ref="chartContainerRef"
              @keydown="handleKeyDown"
              class="p-8 bg-[#f8fafc] overflow-x-auto flex flex-col items-center"
            >
              <!-- MAXILLARY ARCH (Upper) -->
              <div class="w-fit">
                <!-- Maxillary Buccal Section (Top Grid) -->
                <div class="flex items-end mb-1">
                  <!-- Labels -->
                  <div
                    class="flex flex-col bg-white border-l border-t border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20"
                  >
                    <div class="h-7 border-b border-r border-slate-300"></div>
                    <div
                      v-for="row in buccalRows"
                      :key="row"
                      class="h-6 flex items-center px-2 border-b border-r border-slate-300"
                    >
                      {{ row }}
                    </div>
                  </div>

                  <!-- Tooth Columns -->
                  <div class="flex">
                    <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                      <div
                        class="flex border-t border-r border-slate-300 bg-white first:border-l"
                      >
                        <div
                          v-for="(id, idx) in group"
                          :key="id"
                          class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px] transition-all duration-200 cursor-pointer"
                          :class="[
                            gIdx === 1 && idx === 3
                              ? 'border-l-2 border-l-slate-400'
                              : '',
                            selectedToothId === id && isSidebarOpen
                              ? 'bg-blue-50/50 ring-2 ring-[#0052ff] ring-inset z-10'
                              : '',
                          ]"
                        >
                          <!-- Tooth ID Header -->
                          <div
                            @click.stop="selectTooth(id, true)"
                            class="h-7 flex items-center justify-center font-black text-[11px] border-b border-slate-300 cursor-pointer transition-all duration-200"
                            :class="
                              selectedToothId === id && isSidebarOpen
                                ? 'bg-[#0052ff] text-white'
                                : 'bg-slate-50 text-slate-800 hover:bg-[#0052ff] hover:text-white'
                            "
                          >
                            {{ id }}
                          </div>

                          <!-- Measurement Rows -->
                          <div
                            class="h-6 border-b border-slate-200 flex items-center justify-center"
                          >
                            <input
                              type="checkbox"
                              v-model="teethData[id].implant"
                              :disabled="teethData[id].cut"
                              class="chart-input w-3.5 h-3.5 accent-slate-800 disabled:opacity-30 focus:ring-1 focus:ring-[#0052ff] outline-none"
                              :data-tooth="id"
                              data-field="implant"
                              data-surface="buccal"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].mo"
                              :disabled="
                                teethData[id].cut || teethData[id].implant
                              "
                              :placeholder="teethData[id].implant ? '0' : ''"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="mo"
                              data-surface="buccal"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].ktw"
                              :disabled="teethData[id].cut"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="ktw"
                              data-surface="buccal"
                            />
                          </div>
                          <div
                            class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800"
                            :class="{
                              'pointer-events-none opacity-30':
                                teethData[id].cut || teethData[id].implant,
                            }"
                          >
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.buccal"
                              :key="fIdx"
                              @click="toggleFur(id, 'buccal', fIdx)"
                              class="flex items-center justify-center w-4 h-4 cursor-pointer"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3.5 h-3.5 object-contain"
                              />
                              <div
                                v-else
                                class="w-3 h-3 border border-slate-200 rounded-full bg-white/50"
                              ></div>
                            </div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="bop"
                              surface="buccal"
                              inputType="toggle"
                              :value="teethData[id].buccal.bop[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'buccal',
                                    'bop',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pi"
                              surface="buccal"
                              inputType="toggle"
                              :value="teethData[id].buccal.pi[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(id, 'buccal', 'pi', s, val)
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="rec"
                              surface="buccal"
                              inputType="numeric"
                              :value="teethData[id].buccal.rec[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'buccal',
                                    'rec',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pd"
                              surface="buccal"
                              inputType="numeric"
                              :value="teethData[id].buccal.pd[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(id, 'buccal', 'pd', s, val)
                              "
                            />
                          </div>
                          <div class="flex h-6 border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="cal"
                              surface="buccal"
                              inputType="numeric"
                              :value="teethData[id].buccal.cal[s] || '0'"
                              readonly
                            />
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
                        <div
                          v-for="id in group"
                          :key="id"
                          class="w-12 sm:w-[54px] h-8 flex items-center justify-center"
                        >
                          <button
                            @click="teethData[id].cut = !teethData[id].cut"
                            class="w-full h-6 text-[9px] font-black uppercase transition-all duration-200 border border-slate-200"
                            :class="
                              teethData[id].cut
                                ? 'bg-red-500 text-white border-red-600'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            "
                          >
                            ext.
                          </button>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- Maxillary Tooth Illustrations -->
                <div class="flex flex-col gap-10 mb-6 w-full items-center">
                  <!-- Buccal Illustration -->
                  <div class="flex w-full justify-center">
                    <div
                      class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4 shrink-0"
                    >
                      <span>B</span><span>U</span><span>C</span><span>C</span
                      ><span>A</span><span>L</span>
                    </div>
                    <div class="flex">
                      <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg">
                          <div
                            v-for="id in group"
                            :key="id"
                            class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10 cursor-pointer transition-all duration-200 rounded-xl"
                            :class="[
                              selectedToothId === id && isSidebarOpen
                                ? 'bg-blue-50 ring-2 ring-[#0052ff] ring-inset'
                                : 'hover:bg-slate-50',
                            ]"
                          >
                            <img
                              :src="getToothImage(id, 'buccal')"
                              :alt="`Tooth ${id}`"
                              class="w-12 h-auto object-contain transition-all duration-300 scale-x-[-1]"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'scale-110'
                                  : ''
                              "
                            />
                            <span
                              class="absolute top-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors z-10"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'text-[#0052ff]'
                                  : ''
                              "
                              >{{ id }}</span
                            >
                            <!-- Furcation Dots -->
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.buccal"
                              :key="fIdx"
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{
                                left:
                                  teethData[id].fur.buccal.length > 1
                                    ? fIdx === 0
                                      ? '35%'
                                      : '65%'
                                    : '50%',
                              }"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3 h-3 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                        <div v-if="gIdx !== 2" class="w-4"></div>
                      </template>
                    </div>
                  </div>

                  <!-- Palatal Illustration -->
                  <div class="flex w-full justify-center">
                    <div
                      class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4 shrink-0"
                    >
                      <span>P</span><span>A</span><span>L</span><span>A</span
                      ><span>T</span><span>A</span><span>L</span>
                    </div>
                    <div class="flex">
                      <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg">
                          <div
                            v-for="id in group"
                            :key="id"
                            class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10 cursor-pointer transition-all duration-200 rounded-xl"
                            :class="[
                              selectedToothId === id && isSidebarOpen
                                ? 'bg-blue-50 ring-2 ring-[#0052ff] ring-inset'
                                : 'hover:bg-slate-50',
                            ]"
                          >
                            <img
                              :src="getToothImage(id, 'lingual')"
                              :alt="`Tooth ${id} Palatal`"
                              class="w-12 h-auto object-contain transition-all duration-300"
                              style="transform: scaleX(-1)"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'scale-110'
                                  : ''
                              "
                            />
                            <span
                              class="absolute top-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors z-10"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'text-[#0052ff]'
                                  : ''
                              "
                              >{{ id }}</span
                            >
                            <!-- Furcation Dots -->
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.lingual"
                              :key="fIdx"
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{
                                left:
                                  teethData[id].fur.lingual.length > 1
                                    ? fIdx === 0
                                      ? '35%'
                                      : '65%'
                                    : '50%',
                              }"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3 h-3 object-contain"
                              />
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
                  <div
                    class="flex flex-col bg-white border-l border-y border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20"
                  >
                    <div
                      v-for="row in palatalRows"
                      :key="row"
                      class="h-6 flex items-center px-2 border-b border-r border-slate-200 last:border-b-0"
                    >
                      {{ row }}
                    </div>
                  </div>

                  <div class="flex">
                    <template v-for="(group, gIdx) in upperArch" :key="gIdx">
                      <div
                        class="flex border border-slate-300 border-l-0 bg-white first:border-l"
                      >
                        <div
                          v-for="(id, idx) in group"
                          :key="id"
                          class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px] transition-all duration-200 cursor-pointer"
                          :class="[
                            gIdx === 1 && idx === 3
                              ? 'border-l-2 border-l-slate-400'
                              : '',
                            selectedToothId === id && isSidebarOpen
                              ? 'bg-blue-50/50 ring-2 ring-[#0052ff] ring-inset z-10'
                              : '',
                          ]"
                        >
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center">
                            <input
                              type="checkbox"
                              v-model="teethData[id].implant"
                              :disabled="teethData[id].cut"
                              class="chart-input w-3.5 h-3.5 accent-slate-800 disabled:opacity-30 focus:ring-1 focus:ring-[#0052ff] outline-none"
                              :data-tooth="id"
                              data-field="implant"
                              data-surface="lingual"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].mo"
                              :disabled="
                                teethData[id].cut || teethData[id].implant
                              "
                              :placeholder="teethData[id].implant ? '0' : ''"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="mo"
                              data-surface="lingual"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].ktw"
                              :disabled="teethData[id].cut"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="ktw"
                              data-surface="lingual"
                            />
                          </div>
                          <div
                            class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800"
                            :class="{
                              'pointer-events-none opacity-30':
                                teethData[id].cut || teethData[id].implant,
                            }"
                          >
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.lingual"
                              :key="fIdx"
                              @click="toggleFur(id, 'lingual', fIdx)"
                              @keydown.enter.space.prevent="toggleFur(id, 'lingual', fIdx)"
                              tabindex="0"
                              class="chart-input flex items-center justify-center w-4 h-4 cursor-pointer outline-none rounded-sm focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="fur"
                              data-surface="lingual"
                              :data-site="fIdx"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3.5 h-3.5 object-contain"
                              />
                              <div
                                v-else
                                class="w-3 h-3 border border-slate-200 rounded-full bg-white/50"
                              ></div>
                            </div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="bop"
                              surface="lingual"
                              inputType="toggle"
                              :value="teethData[id].lingual.bop[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'bop',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pi"
                              surface="lingual"
                              inputType="toggle"
                              :value="teethData[id].lingual.pi[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'pi',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="rec"
                              surface="lingual"
                              inputType="numeric"
                              :value="teethData[id].lingual.rec[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'rec',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pd"
                              surface="lingual"
                              inputType="numeric"
                              :value="teethData[id].lingual.pd[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'pd',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="cal"
                              surface="lingual"
                              inputType="numeric"
                              :value="teethData[id].lingual.cal[s] || '0'"
                              readonly
                            />
                          </div>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- MANDIBULAR ARCH (Lower) -->
                <!-- Mandibular Lingual Section (Top Grid) -->
                <div class="flex items-end mb-1 mt-12">
                  <div
                    class="flex flex-col bg-white border-l border-t border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20"
                  >
                    <div
                      v-for="row in buccalRows"
                      :key="row"
                      class="h-6 flex items-center px-2 border-b border-r border-slate-300"
                    >
                      {{ row }}
                    </div>
                  </div>

                  <div class="flex">
                    <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                      <div
                        class="flex border-t border-r border-slate-300 bg-white first:border-l"
                      >
                        <div
                          v-for="(id, idx) in group"
                          :key="id"
                          class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px] transition-all duration-200 cursor-pointer"
                          :class="[
                            gIdx === 1 && idx === 3
                              ? 'border-l-2 border-l-slate-400'
                              : '',
                            selectedToothId === id && isSidebarOpen
                              ? 'bg-blue-50/50 ring-2 ring-[#0052ff] ring-inset z-10'
                              : '',
                          ]"
                        >
                          <div
                            class="h-6 border-b border-slate-200 flex items-center justify-center"
                          >
                            <input
                              type="checkbox"
                              v-model="teethData[id].implant"
                              :disabled="teethData[id].cut"
                              class="chart-input w-3.5 h-3.5 accent-slate-800 disabled:opacity-30 focus:ring-1 focus:ring-[#0052ff] outline-none"
                              :data-tooth="id"
                              data-field="implant"
                              data-surface="lingual"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].mo"
                              :disabled="
                                teethData[id].cut || teethData[id].implant
                              "
                              :placeholder="teethData[id].implant ? '0' : ''"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="mo"
                              data-surface="lingual"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].ktw"
                              :disabled="teethData[id].cut"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="ktw"
                              data-surface="lingual"
                            />
                          </div>
                          <div
                            class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800"
                            :class="{
                              'pointer-events-none opacity-30':
                                teethData[id].cut || teethData[id].implant,
                            }"
                          >
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.lingual"
                              :key="fIdx"
                              @click="toggleFur(id, 'lingual', fIdx)"
                              @keydown.enter.space.prevent="toggleFur(id, 'lingual', fIdx)"
                              tabindex="0"
                              class="chart-input flex items-center justify-center w-4 h-4 cursor-pointer outline-none rounded-sm focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="fur"
                              data-surface="lingual"
                              :data-site="fIdx"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3.5 h-3.5 object-contain"
                              />
                              <div
                                v-else
                                class="w-3 h-3 border border-slate-200 rounded-full bg-white/50"
                              ></div>
                            </div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="bop"
                              surface="lingual"
                              inputType="toggle"
                              :value="teethData[id].lingual.bop[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'bop',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pi"
                              surface="lingual"
                              inputType="toggle"
                              :value="teethData[id].lingual.pi[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'pi',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="rec"
                              surface="lingual"
                              inputType="numeric"
                              :value="teethData[id].lingual.rec[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'rec',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pd"
                              surface="lingual"
                              inputType="numeric"
                              :value="teethData[id].lingual.pd[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'lingual',
                                    'pd',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="cal"
                              surface="lingual"
                              inputType="numeric"
                              :value="teethData[id].lingual.cal[s] || '0'"
                              readonly
                            />
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
                        <div
                          v-for="id in group"
                          :key="id"
                          class="w-12 sm:w-[54px] h-8 flex items-center justify-center"
                        >
                          <button
                            @click="teethData[id].cut = !teethData[id].cut"
                            class="w-full h-6 text-[9px] font-black uppercase transition-all duration-200 border border-slate-200"
                            :class="
                              teethData[id].cut
                                ? 'bg-red-500 text-white border-red-600'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            "
                          >
                            ext.
                          </button>
                        </div>
                      </div>
                      <div v-if="gIdx !== 2" class="w-4"></div>
                    </template>
                  </div>
                </div>

                <!-- Mandibular Tooth Illustrations -->
                <div class="flex flex-col gap-10 mb-6 w-full items-center">
                  <!-- Lingual Illustration -->
                  <div class="flex w-full justify-center">
                    <div
                      class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4 shrink-0"
                    >
                      <span>L</span><span>I</span><span>N</span><span>G</span
                      ><span>U</span><span>A</span><span>L</span>
                    </div>
                    <div class="flex">
                      <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg-inf">
                          <div
                            v-for="id in group"
                            :key="id"
                            class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10 cursor-pointer transition-all duration-200 rounded-xl"
                            :class="[
                              selectedToothId === id && isSidebarOpen
                                ? 'bg-blue-50 ring-2 ring-[#0052ff] ring-inset'
                                : 'hover:bg-slate-50',
                            ]"
                          >
                            <img
                              :src="getToothImage(id, 'lingual')"
                              :alt="`Tooth ${id} Lingual`"
                              class="w-12 h-auto object-contain transition-all duration-300 scale-y-[-1] scale-x-[-1]"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'scale-110'
                                  : ''
                              "
                            />
                            <span
                              class="absolute bottom-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors z-10"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'text-[#0052ff]'
                                  : ''
                              "
                              >{{ id }}</span
                            >
                            <!-- Furcation Dots -->
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.lingual"
                              :key="fIdx"
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{
                                left:
                                  teethData[id].fur.lingual.length > 1
                                    ? fIdx === 0
                                      ? '35%'
                                      : '65%'
                                    : '50%',
                              }"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3 h-3 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                        <div v-if="gIdx !== 2" class="w-4"></div>
                      </template>
                    </div>
                  </div>

                  <!-- Buccal Illustration -->
                  <div class="flex w-full justify-center">
                    <div
                      class="w-20 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1 py-4 shrink-0"
                    >
                      <span>B</span><span>U</span><span>C</span><span>C</span
                      ><span>A</span><span>L</span>
                    </div>
                    <div class="flex">
                      <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                        <div class="flex h-36 relative clinical-grid-bg-inf">
                          <div
                            v-for="id in group"
                            :key="id"
                            class="w-12 sm:w-[54px] h-full flex items-center justify-center group relative z-10 cursor-pointer transition-all duration-200 rounded-xl"
                            :class="[
                              selectedToothId === id && isSidebarOpen
                                ? 'bg-blue-50 ring-2 ring-[#0052ff] ring-inset'
                                : 'hover:bg-slate-50',
                            ]"
                          >
                            <img
                              :src="getToothImage(id, 'buccal')"
                              :alt="`Tooth ${id}`"
                              class="w-12 h-auto object-contain transition-all duration-300 scale-y-[-1] scale-x-[-1]"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'scale-110'
                                  : ''
                              "
                            />
                            <span
                              class="absolute bottom-1.5 text-[9px] font-black text-slate-300 select-none group-hover:text-slate-400 transition-colors z-10"
                              :class="
                                selectedToothId === id && isSidebarOpen
                                  ? 'text-[#0052ff]'
                                  : ''
                              "
                              >{{ id }}</span
                            >
                            <!-- Furcation Dots -->
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.buccal"
                              :key="fIdx"
                              class="absolute top-[40%] z-20 pointer-events-none -translate-x-1/2"
                              :style="{
                                left:
                                  teethData[id].fur.buccal.length > 1
                                    ? fIdx === 0
                                      ? '35%'
                                      : '65%'
                                    : '50%',
                              }"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3 h-3 object-contain"
                              />
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
                  <div
                    class="flex flex-col bg-white border-l border-y border-slate-300 text-[9px] font-bold text-slate-500 uppercase w-20 sticky left-0 z-20"
                  >
                    <div
                      v-for="row in palatalRows"
                      :key="row"
                      class="h-6 flex items-center px-2 border-b border-r border-slate-200 last:border-b-0"
                    >
                      {{ row }}
                    </div>
                    <div
                      class="h-7 border-t border-r border-slate-300 bg-slate-50"
                    ></div>
                  </div>

                  <div class="flex">
                    <template v-for="(group, gIdx) in lowerArch" :key="gIdx">
                      <div
                        class="flex border border-slate-300 border-l-0 bg-white first:border-l"
                      >
                        <div
                          v-for="(id, idx) in group"
                          :key="id"
                          class="flex flex-col border-r border-slate-200 last:border-r-0 w-12 sm:w-[54px] transition-all duration-200 cursor-pointer"
                          :class="[
                            gIdx === 1 && idx === 3
                              ? 'border-l-2 border-l-slate-400'
                              : '',
                            selectedToothId === id && isSidebarOpen
                              ? 'bg-blue-50/50 ring-2 ring-[#0052ff] ring-inset z-10'
                              : '',
                          ]"
                        >
                          <div class="h-6 border-b border-slate-200 flex items-center justify-center">
                            <input
                              type="checkbox"
                              v-model="teethData[id].implant"
                              :disabled="teethData[id].cut"
                              class="chart-input w-3.5 h-3.5 accent-slate-800 disabled:opacity-30 focus:ring-1 focus:ring-[#0052ff] outline-none"
                              :data-tooth="id"
                              data-field="implant"
                              data-surface="buccal"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].mo"
                              :disabled="
                                teethData[id].cut || teethData[id].implant
                              "
                              :placeholder="teethData[id].implant ? '0' : ''"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="mo"
                              data-surface="buccal"
                            />
                          </div>
                          <div class="h-6 border-b border-slate-200">
                            <input
                              type="text"
                              v-model="teethData[id].ktw"
                              :disabled="teethData[id].cut"
                              class="chart-input w-full h-full text-center text-[11px] outline-none disabled:bg-slate-100/50 focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="ktw"
                              data-surface="buccal"
                            />
                          </div>
                          <div
                            class="h-6 border-b border-slate-200 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800"
                            :class="{
                              'pointer-events-none opacity-30':
                                teethData[id].cut || teethData[id].implant,
                            }"
                          >
                            <div
                              v-for="(grade, fIdx) in teethData[id].fur.buccal"
                              :key="fIdx"
                              @click="toggleFur(id, 'buccal', fIdx)"
                              @keydown.enter.space.prevent="toggleFur(id, 'buccal', fIdx)"
                              tabindex="0"
                              class="chart-input flex items-center justify-center w-4 h-4 cursor-pointer outline-none rounded-sm focus:ring-1 focus:ring-[#0052ff] focus:ring-inset"
                              :data-tooth="id"
                              data-field="fur"
                              data-surface="buccal"
                              :data-site="fIdx"
                            >
                              <img
                                v-if="grade > 0"
                                :src="getFurImage(grade)"
                                class="w-3.5 h-3.5 object-contain"
                              />
                              <div
                                v-else
                                class="w-3 h-3 border border-slate-200 rounded-full bg-white/50"
                              ></div>
                            </div>
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="bop"
                              surface="buccal"
                              inputType="toggle"
                              :value="teethData[id].buccal.bop[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'buccal',
                                    'bop',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pi"
                              surface="buccal"
                              inputType="toggle"
                              :value="teethData[id].buccal.pi[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(id, 'buccal', 'pi', s, val)
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="rec"
                              surface="buccal"
                              inputType="numeric"
                              :value="teethData[id].buccal.rec[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(
                                    id,
                                    'buccal',
                                    'rec',
                                    s,
                                    val,
                                  )
                              "
                            />
                          </div>
                          <div class="flex h-6 border-b border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="pd"
                              surface="buccal"
                              inputType="numeric"
                              :value="teethData[id].buccal.pd[s]"
                              :disabled="teethData[id].cut"
                              @change="
                                (val) =>
                                  updateClinicalData(id, 'buccal', 'pd', s, val)
                              "
                            />
                          </div>
                          <div class="flex h-6 border-slate-200">
                            <ClinicalInputCell
                              v-for="s in [0, 1, 2]"
                              :key="s"
                              :toothNumber="id"
                              :sitePosition="s"
                              fieldName="cal"
                              surface="buccal"
                              inputType="numeric"
                              :value="teethData[id].buccal.cal[s] || '0'"
                              readonly
                            />
                          </div>
                          <div
                            @click.stop="selectTooth(id, true)"
                            class="h-7 flex items-center justify-center font-black text-[11px] border-t border-slate-300 cursor-pointer transition-all duration-200"
                            :class="
                              selectedToothId === id && isSidebarOpen
                                ? 'bg-[#0052ff] text-white'
                                : 'bg-slate-50 text-slate-800 hover:bg-[#0052ff] hover:text-white'
                            "
                          >
                            {{ id }}
                          </div>
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

        <!-- Sidebar Tooth Detail - Unified Overlay Component -->
        <ToothSidebarOverlay
          :isOpen="isSidebarOpen"
          :toothId="selectedToothId"
          :toothData="selectedToothData"
          @close="isSidebarOpen = false"
          @update-note="handleUpdateNote"
        />
      </div>
    </main>
  </div>
</template>
