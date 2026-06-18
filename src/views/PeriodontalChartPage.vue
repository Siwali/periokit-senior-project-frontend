<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Download, FileText, Image as ImageIcon, Plus, Save, Stethoscope, Loader2, X, Pencil } from 'lucide-vue-next'
import Navbar from '@/components/layout/Navbar.vue'
import ChartLegend from '@/components/chart/ChartLegend.vue'
import ChartOverviewModal from '@/components/chart/ChartOverviewModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import PatientChartHeader from '@/components/chart/PatientChartHeader.vue'
import PeriodontalChartGrid from '@/components/chart/PeriodontalChartGrid.vue'
import ToothSidebarOverlay from '@/components/chart/ToothSidebarOverlay.vue'
import VirtualNumpad from '@/components/chart/VirtualNumpad.vue'
import AutoFitWrapper from '@/components/common/AutoFitWrapper.vue'
import PatientDrawer from '@/components/patients/VisitListPanel.vue'
import { usePeriodontalChartStore } from '@/stores/periodontal-chart'
import { useClinicalValidationStore } from '@/stores/clinical-validation'
import { useVisitStore } from '@/stores/visit'
import { useNotificationStore } from '@/stores/notification'
import { useChartRouteState } from '@/composables/chart/useChartRouteState'
import { useDraftRecovery } from '@/composables/chart/useDraftRecovery'
import type { ToothId } from '@/domain/chart/chart.types'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const chartStore = usePeriodontalChartStore()
chartStore.initializeChart()
const validationStore = useClinicalValidationStore()
const visitStore = useVisitStore()
const notifStore = useNotificationStore()

const drawerOpen = ref(false)

const {
  patientInfo,
  teethData,
  selectedToothId,
  selectedToothData,
  activeSubNav,
  summary,
  currentPatientId,
} = storeToRefs(chartStore)

const { visits, activeVisitId } = storeToRefs(visitStore)

const editMode = ref(false)
const showOverviewModal = ref(false)
const showSaveConfirmModal = ref(false)
const showCloseTabWarningModal = ref(false)
const showDraftRecoveryModal = ref(false)
const showValidation = ref(false)
const showCancelEditConfirmModal = ref(false)
const enableAutoFit = ref(false)
const isSaving = ref(false)
const isTouchDevice = ref(false)

const {
  hasPatient,
  isNewPatientMode,
  handleSwitchVisit,
  handleCloseVisit,
  confirmCloseTab,
  handleNewVisit,
} = useChartRouteState({
  chartStore,
  visitStore,
  notifStore,
  route,
  router,
  activeVisitId,
  currentPatientId,
  visitCount: computed(() => visits.value.length),
  showCloseTabWarningModal,
})

const { discardDraft } = useDraftRecovery({
  chartStore,
  route,
  showDraftRecoveryModal,
})

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

const validateBeforeSave = () => {
  showValidation.value = true
  if (!patientInfo.value.hn) {
    notifStore.error('Please enter HN before saving')
    return false
  }
  if (!patientInfo.value.patientName) {
    notifStore.error('Please enter patient name before saving')
    return false
  }
  if (!chartStore.hasChartData) {
    notifStore.error('Please enter clinical chart data before saving')
    return false
  }
  return true
}

const handleSaveClick = () => {
  if (isSaving.value) return
  if (!validateBeforeSave()) return
  showSaveConfirmModal.value = true
}

const confirmSaveChart = async () => {
  showSaveConfirmModal.value = false
  if (isSaving.value) return

  isSaving.value = true
  const wasNewPatient = isNewPatientMode.value

  try {
    await chartStore.saveToBackend(true)
    editMode.value = false

    const activeVisit = activeVisitId.value
    const patientId = currentPatientId.value

    if (wasNewPatient && patientId) {
      router.push({ name: 'patient-visits', params: { patientId } })
      return
    }

    if (activeVisit && (route.query.visitId !== activeVisit || (patientId && route.query.patientId !== patientId))) {
      router.replace({
        query: {
          ...route.query,
          visitId: activeVisit,
          ...(patientId ? { patientId } : {}),
        },
      })
    }
  } catch (error) {
    console.error('Failed to save chart:', error)
  } finally {
    isSaving.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isExistingVisit = computed(
  () => activeVisitId.value !== 'new' && activeVisitId.value !== null,
)
const chartEditable = computed(
  () => !isExistingVisit.value || editMode.value,
)
const patientFieldsEditable = computed(() => !isExistingVisit.value)

watch(chartEditable, value => { chartStore.readonly = !value }, { immediate: true })
watch(activeVisitId, () => { editMode.value = false })

const handleEditVisit = () => { editMode.value = true }

const handleCancelEditClick = () => {
  if (chartStore.isDirty) {
    showCancelEditConfirmModal.value = true
  } else {
    editMode.value = false
  }
}

const confirmCancelEdit = async () => {
  showCancelEditConfirmModal.value = false
  editMode.value = false

  const visitId = activeVisitId.value
  if (visitId && visitId !== 'new') {
    try {
      await chartStore.loadFromBackend(visitId)
    } catch (error) {
      console.error(error)
    }
  }
}

const handleUpdateNote = ({ id, note }: { id: string | number; note: string }) => {
  chartStore.updateNote(Number(id) as ToothId, note)
}
</script>
<template>
  <div class="min-h-screen bg-[#f1f5f9] font-sans text-[#1e293b]">
    <Navbar @toggle-drawer="drawerOpen = !drawerOpen" />
    <PatientDrawer v-model:open="drawerOpen" />

    <div class="bg-white border-b border-slate-200 py-1.5 sticky top-16 z-40">
      <div class="max-w-400 mx-auto px-4 flex items-center justify-center">
        <div class="flex items-center gap-1.5 p-0.5 bg-slate-100/80 rounded-xl border border-slate-200 overflow-x-auto min-w-max">
          <button
            class="flex items-center gap-1.5 px-4 py-1 rounded-lg text-[12px] font-bold transition-all duration-200"
            :class="activeSubNav === 'chart' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="chartStore.activeSubNav = 'chart'"
          >
            <FileText class="w-3.5 h-3.5" />
            Periodontal Chart
          </button>
          <button
            class="flex items-center gap-1.5 px-4 py-1 rounded-lg text-[12px] font-bold transition-all duration-200"
            :class="activeSubNav === 'xray' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="chartStore.activeSubNav = 'xray'"
          >
            <ImageIcon class="w-3.5 h-3.5" />
            X-ray
          </button>
          <div class="w-px h-3 bg-slate-300 my-auto mx-0.5"></div>
          <button
            class="flex items-center gap-1.5 px-4 py-1 rounded-lg text-[12px] font-bold transition-all duration-200"
            :class="activeSubNav === 'export' ? 'bg-white text-[#0052ff] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="chartStore.activeSubNav = 'export'"
          >
            <Download class="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>
    </div>

    <main class="max-w-400 mx-auto px-4 py-3">
      <!-- Empty state when no patient selected -->
      <div v-if="!hasPatient" class="flex flex-col items-center justify-center py-20">
        <p class="text-slate-400 text-sm">Please select a patient from the drawer</p>
      </div>

      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-4 mb-3">
          <button
            class="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition-all duration-500"
            :class="selectedToothId !== null ? 'xl:ml-18' : 'xl:ml-63'"
            @click="showOverviewModal = true"
          >
            <FileText class="w-3.5 h-3.5" /> Overview
          </button>

          <div class="flex flex-wrap items-center gap-2 xl:mr-50">
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#9333ea]/30 text-[#9333ea] rounded-lg font-bold text-[11px] shadow-sm hover:bg-purple-50 transition-colors">
              <Stethoscope class="w-3.5 h-3.5" /> Diagnosis
            </button>
            <button 
              class="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg font-bold text-[11px] transition-all duration-200 xl:hidden" 
              @click="enableAutoFit = !enableAutoFit"
              :class="enableAutoFit ? 'bg-[#0052ff] border-[#0052ff] text-white shadow-inner transform scale-[0.98]' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50'"
            >
              Zoom to Fit
            </button>
            <button v-if="!isNewPatientMode" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[11px] shadow-sm hover:bg-slate-50 transition-colors" @click="handleNewVisit">
              <Plus class="w-3.5 h-3.5" /> New Visit
            </button>

            <!-- Edit button: existing visit, not yet in edit mode -->
            <button
              v-if="isExistingVisit && !editMode"
              @click="handleEditVisit"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[11px] shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Pencil class="w-3.5 h-3.5" /> Edit
            </button>

            <!-- Cancel edit: discard unsaved edits -->
            <button
              v-if="isExistingVisit && editMode"
              @click="handleCancelEditClick"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[11px] shadow-sm hover:bg-slate-50 transition-colors"
            >
              <X class="w-3.5 h-3.5" /> Cancel
            </button>

            <!-- Save Chart: new unsaved visit OR existing visit in edit mode -->
            <button
              v-if="chartEditable"
              @click="handleSaveClick"
              :disabled="isSaving || (isExistingVisit && editMode && !chartStore.isDirty)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-md transition-colors"
              :class="(isSaving || (isExistingVisit && editMode && !chartStore.isDirty)) ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50' : 'bg-blue-600 text-white hover:bg-blue-700'"
            >
              <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              {{ isSaving ? 'Saving...' : 'Save Chart' }}
            </button>
          </div>
        </div>

        <div class="flex flex-col xl:flex-row gap-4 transition-all duration-500">
          <ChartLegend :is-sidebar-open="selectedToothId !== null" class="hidden xl:flex" />

          <div class="w-full xl:w-255 shrink-0 flex flex-col gap-0 transition-all duration-500 min-w-0">
            <!-- Visit Tabs: always visible when there are visits/drafts -->
            <div v-if="!isNewPatientMode || visits.length > 0" class="flex items-center gap-0 relative z-10">
              <template v-if="visits.length === 0">
                <div class="px-4 py-2 text-xs text-slate-400 italic">
                  No visits yet. Click "New Visit" to create one.
                </div>
              </template>

              <template v-else>
                <draggable
                  v-model="visits"
                  group="visits"
                  item-key="id"
                  class="flex items-center gap-0"
                  ghost-class="opacity-30"
                  drag-class="cursor-grabbing"
                  animation="200"
                >
                  <template #item="{ element: visit }">
                    <div
                      class="relative group"
                      @click="handleSwitchVisit(visit.id)"
                    >
                      <div
                        class="px-4 py-1.5 rounded-t-xl border-t border-l border-r text-[10px] font-black flex items-center gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mb-px transition-all cursor-grab active:cursor-grabbing"
                        :class="visit.id === activeVisitId
                          ? 'bg-white border-slate-200 text-[#0052ff]'
                          : 'bg-slate-100 border-transparent text-slate-400 hover:text-slate-600'"
                      >
                        <span class="max-w-24 truncate">{{ visit.id === 'new' ? 'New Visit' : `Visit #${visit.visitNumber || '-'}` }}</span>
                        <span class="text-[9px] text-slate-400 font-normal">{{ formatDate(visit.visitDate) }}</span>
                        <span v-if="visit.id === 'new'" class="text-[8px] bg-blue-100 text-blue-600 px-1 rounded">Draft</span>
                        <span v-else-if="!visit.hasChart" class="text-[8px] bg-amber-100 text-amber-600 px-1 rounded">Empty</span>
                        <button
                          v-if="visits.length > 1"
                          class="ml-0.5 -mr-1 p-0.5 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Close tab"
                          @click.stop="handleCloseVisit(visit.id)"
                        >
                          <X class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </template>
                </draggable>
              </template>

              <button
                class="p-1.5 text-slate-400 hover:text-[#0052ff] transition-colors"
                @click="handleNewVisit"
                title="Create new visit for this patient"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>

            <PatientChartHeader
              :patient-info="patientInfo"
              :summary="summary"
              :show-validation="showValidation"
              :patient-fields-disabled="!patientFieldsEditable"
              :visit-fields-disabled="!chartEditable"
              @update:patient-info="chartStore.updatePatientInfo"
            />

            <!-- fieldset disables native inputs/checkboxes when read-only; the
                 store guard covers the div-based toggles (BoP/PI/fur/Ext). -->
            <fieldset :disabled="!chartEditable" class="border-0 p-0 m-0 min-w-0">
              <div class="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent" :class="isTouchDevice ? 'pb-96' : 'pb-4'">
                <AutoFitWrapper :enable-auto-fit="enableAutoFit">
                  <div class="min-w-max">
                    <PeriodontalChartGrid
                      :chart-data="teethData"
                      :selected-tooth-id="selectedToothId"
                      @select-tooth="chartStore.selectTooth"
                      @toggle-bop="chartStore.toggleBop"
                      @toggle-pi="chartStore.togglePi"
                      @toggle-fur="chartStore.toggleFur"
                      @update-pd="chartStore.updatePd"
                      @update-rec="chartStore.updateRec"
                      @update-mobility="chartStore.updateMobility"
                      @update-ktw="chartStore.updateKtw"
                      :get-field-validation="validationStore.getFieldValidation"
                      @validate-field="validationStore.setFieldValidation"
                      @toggle-extracted="chartStore.toggleExtracted"
                      @toggle-implant="chartStore.toggleImplant"
                    />
                  </div>
                </AutoFitWrapper>
              </div>
            </fieldset>
          </div>

          <ToothSidebarOverlay
            :is-open="selectedToothId !== null"
            :tooth-id="selectedToothId"
            :tooth-data="selectedToothData"
            :readonly="!chartEditable"
            @close="selectedToothId = null"
            @update-note="handleUpdateNote"
          />

          <!-- Overview Modal -->
          <ChartOverviewModal
            :show="showOverviewModal"
            :chart-data="teethData"
            @close="showOverviewModal = false"
          />

          <!-- Save Chart Confirmation Modal -->
          <ConfirmModal
            :show="showSaveConfirmModal"
            title="Save Chart"
            message="<span class='text-slate-800 font-bold text-lg block mb-1'>Do you want to save this chart?</span><span class='text-slate-500 font-normal'>Once saved, you can still click Edit to modify it later.</span>"
            confirm-text="Save"
            cancel-text="Cancel"
            @confirm="confirmSaveChart"
            @cancel="showSaveConfirmModal = false"
          />

          <!-- Close Tab Warning Modal -->
          <ConfirmModal
            :show="showCloseTabWarningModal"
            title="Unsaved Changes"
            message="<span class='text-slate-800 font-bold text-lg block mb-1'>This chart has not been saved.</span><span class='text-slate-500 font-normal'>Are you sure you want to close this tab? Your data will be lost.</span>"
            confirm-text="Close Tab"
            cancel-text="Cancel"
            type="danger"
            @confirm="confirmCloseTab"
            @cancel="showCloseTabWarningModal = false"
          />

          <!-- Draft Recovery Modal -->
          <ConfirmModal
            :show="showDraftRecoveryModal"
            title="Draft Found"
            :message="`<span class='text-slate-800 font-bold text-lg block mb-1'>Found unsaved chart data for ${patientInfo.patientName || 'patient'}.</span><span class='text-slate-500 font-normal'>Do you want to recover this data to continue working?</span>`"
            confirm-text="Recover Data"
            cancel-text="Discard Data"
            @confirm="showDraftRecoveryModal = false"
            @cancel="discardDraft"
          />

          <!-- Cancel Edit Confirmation Modal -->
          <ConfirmModal
            :show="showCancelEditConfirmModal"
            title="Cancel Editing"
            message="<span class='text-slate-800 font-bold text-lg block mb-1'>Are you sure you want to cancel?</span><span class='text-slate-500 font-normal'>Any unsaved changes will be lost.</span>"
            confirm-text="Discard Changes"
            cancel-text="Continue Editing"
            type="danger"
            @confirm="confirmCancelEdit"
            @cancel="showCancelEditConfirmModal = false"
          />

          <!-- Virtual Numpad -->
          <VirtualNumpad />
        </div>
      </template>
    </main>
  </div>
</template>
