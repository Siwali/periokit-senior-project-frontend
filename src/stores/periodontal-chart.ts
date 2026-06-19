import { defineStore } from 'pinia'
import { calculateBopPercentage, calculateCal, calculateChartSummary, calculatePdCategories, calculatePiPercentage } from '@/domain/chart/chart.calculations'
import { createInitialChartData } from '@/domain/chart/chart.factory'
import type { PatientInfo, SiteIndex, Surface, ToothId } from '@/domain/chart/chart.types'
import { useAuthStore } from './auth'
import { loadChartPatientWorkflow, loadChartWorkflow, saveChartWorkflow } from '@/services/chart-workflow'
import { registerSessionClearListener } from '@/services/session'

const createDefaultPatientInfo = (): PatientInfo => {
  const authStore = useAuthStore()
  const user = authStore.user

  return {
    hn: '',
    doctor: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
    studentId: user?.student_id || '',
    patientName: '',
    age: null,
    nationality: '',
    gender: '',
    date: new Date().toISOString().split('T')[0],
    visitPhase: 'before_hygienic' // Default phase
  }
}

export const usePeriodontalChartStore = defineStore('periodontalChart', {
  state: () => ({
    // Single active chart for the current visit
    chartName: 'New Chart' as string,
    patientInfo: createDefaultPatientInfo(),
    teethData: createInitialChartData(),
    selectedToothId: null as ToothId | null,
    activeSubNav: 'chart' as 'chart' | 'xray' | 'export',
    currentPatientId: null as string | null,
    isDirty: false as boolean,
    // When true the chart is being viewed (a saved visit, not in edit mode):
    // all mutating actions become no-ops so the record can't change.
    readonly: false as boolean,
  }),

  getters: {
    selectedToothData: state => {
      if (state.selectedToothId === null) return null
      return state.teethData[state.selectedToothId] ?? null
    },

    bopPercentage: state => calculateBopPercentage(state.teethData),

    piPercentage: state => calculatePiPercentage(state.teethData),

    pdCategories: state => calculatePdCategories(state.teethData),

    summary: state => calculateChartSummary(state.teethData),

    hasChartData: state => Object.values(state.teethData).some(tooth => {
      if (tooth.extracted || tooth.implant) return true
      for (const surface of ['buccal', 'lingual'] as const) {
        const s = tooth[surface]
        if (s.pd.some(v => v !== '')) return true
        if (s.rec.some(v => v !== '')) return true
        if (s.bop.some(v => v)) return true
        if (s.pi.some(v => v)) return true
      }
      return false
    })
  },

  actions: {
    initializeChart() {
      if (Object.keys(this.teethData).length > 0) return
      this.patientInfo = createDefaultPatientInfo()
      this.teethData = createInitialChartData()
    },

    resetChart() {
      this.chartName = 'New Chart'
      this.patientInfo = createDefaultPatientInfo()
      this.teethData = createInitialChartData()
      this.selectedToothId = null
      this.activeSubNav = 'chart'
      this.currentPatientId = null
      this.isDirty = false
      this.readonly = false
      // Explicitly clear localStorage so logout wipes any unsaved draft
      try { localStorage.removeItem('periodontalChart') } catch (_) {}
    },

    updatePatientInfo(value: PatientInfo) {
      if (this.readonly) return
      this.patientInfo = { ...value }
      this.isDirty = true
    },

    selectTooth(id: ToothId) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      this.selectedToothId = this.selectedToothId === id ? null : id
    },

    toggleBop(id: ToothId, surface: Surface, site: SiteIndex) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].bop[site] = !tooth[surface].bop[site]
      this.isDirty = true
    },

    togglePi(id: ToothId, surface: Surface, site: SiteIndex) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].pi[site] = !tooth[surface].pi[site]
      this.isDirty = true
    },

    updatePd(id: ToothId, surface: Surface, site: SiteIndex, value: string) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].pd[site] = value
      this.updateCal(id, surface, site)
      this.isDirty = true
    },

    updateRec(id: ToothId, surface: Surface, site: SiteIndex, value: string) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].rec[site] = value
      this.updateCal(id, surface, site)
      this.isDirty = true
    },

    updateMobility(id: ToothId, value: string) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted || tooth.implant) return
      tooth.mo = value
      this.isDirty = true
    },

    updateKtw(id: ToothId, surface: Surface, value: string) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].ktw = value
      this.isDirty = true
    },

    updateCal(id: ToothId, surface: Surface, site: SiteIndex) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].cal[site] = calculateCal(tooth[surface].pd[site], tooth[surface].rec[site])
    },

    toggleFur(id: ToothId, surface: Surface, index: number) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted || tooth.implant) return
      tooth.fur[surface][index] = (tooth.fur[surface][index] + 1) % 4
      this.isDirty = true
    },

    toggleImplant(id: ToothId) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth.implant = !tooth.implant

      // When Implant toggles, reset the existing mobility/furcation values
      tooth.mo = ''
      tooth.fur.buccal = tooth.fur.buccal.map(() => 0)
      tooth.fur.lingual = tooth.fur.lingual.map(() => 0)
      this.isDirty = true
    },

    toggleExtracted(id: ToothId) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth) return
      tooth.extracted = !tooth.extracted

      // Clear ALL clinical data when tooth is extracted (fill black)
      if (tooth.extracted) {
        const clearSurfaceData = () => ({
          bop: [false, false, false],
          pi: [false, false, false],
          rec: ['', '', ''],
          pd: ['', '', ''],
          cal: ['', '', ''],
          ktw: ''
        })

        tooth.buccal = clearSurfaceData()
        tooth.lingual = clearSurfaceData()
        tooth.implant = false
        tooth.mo = ''
        tooth.note = ''
        tooth.prognosisKC = ''
        tooth.prognosisMN = ''
        tooth.fur.buccal = tooth.fur.buccal.map(() => 0)
        tooth.fur.lingual = tooth.fur.lingual.map(() => 0)

        if (this.selectedToothId === id) {
          this.selectedToothId = null
        }
      }
      this.isDirty = true
    },

    updateNote(id: ToothId, note: string) {
      if (this.readonly) return
      const tooth = this.teethData[id]
      if (!tooth) return
      tooth.note = note
      this.isDirty = true
    },

    async saveToBackend(completeVisit = true) {
      await saveChartWorkflow(this, completeVisit)
    },

    async loadFromBackend(visitId: string) {
      await loadChartWorkflow(this, visitId)
    },

    async loadPatientById(id: string) {
      await loadChartPatientWorkflow(this, id)
    }
  },

  persist: {
    storage: localStorage,
    pick: ['chartName', 'patientInfo', 'teethData', 'currentPatientId', 'isDirty'],
  },
})

registerSessionClearListener(() => {
  const store = usePeriodontalChartStore()
  store.resetChart()
})

