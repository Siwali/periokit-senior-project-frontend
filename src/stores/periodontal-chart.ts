import { defineStore } from 'pinia'
import { calculateBopPercentage, calculateCal, calculateChartSummary, calculatePdCategories, calculatePiPercentage } from '@/domain/chart/chart.calculations'
import { createInitialChartData } from '@/domain/chart/chart.factory'
import type { ChartData, PatientInfo, SiteIndex, Surface, ToothId } from '@/domain/chart/chart.types'
import { useAuthStore } from './auth'

const createDefaultPatientInfo = (): PatientInfo => {
  const authStore = useAuthStore()
  const user = authStore.user

  return {
    hn: '',
    doctor: user?.first_name ? `${user.first_name} ${user.last_name}` : 'Aj. Dr. Chatchai',
    studentId: user?.student_id || '6310210000',
    patientName: '',
    age: null,
    nationality: '',
    gender: '',
    date: new Date().toISOString().split('T')[0]
  }
}

export const usePeriodontalChartStore = defineStore('periodontalChart', {
  state: () => ({
    patientInfo: createDefaultPatientInfo(),
    teethData: {} as ChartData,
    selectedToothId: null as ToothId | null,
    activeSubNav: 'chart'
  }),

  getters: {
    selectedToothData: state => {
      if (state.selectedToothId === null) return null
      return state.teethData[state.selectedToothId] ?? null
    },
    bopPercentage: state => calculateBopPercentage(state.teethData),
    piPercentage: state => calculatePiPercentage(state.teethData),
    pdCategories: state => calculatePdCategories(state.teethData),
    summary: state => calculateChartSummary(state.teethData)
  },

  actions: {
    initializeChart() {
      if (Object.keys(this.teethData).length > 0) return
      this.patientInfo = createDefaultPatientInfo()
      this.teethData = createInitialChartData()
    },

    selectTooth(id: ToothId) {
      this.selectedToothId = id
    },

    toggleBop(id: ToothId, surface: Surface, site: SiteIndex) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].bop[site] = !tooth[surface].bop[site]
    },

    togglePi(id: ToothId, surface: Surface, site: SiteIndex) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].pi[site] = !tooth[surface].pi[site]
    },

    updatePd(id: ToothId, surface: Surface, site: SiteIndex, value: string) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].pd[site] = value
      this.updateCal(id, surface, site)
    },

    updateRec(id: ToothId, surface: Surface, site: SiteIndex, value: string) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].rec[site] = value
      this.updateCal(id, surface, site)
    },

    updateMobility(id: ToothId, value: string) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted || tooth.implant) return
      tooth.mo = value
    },

    updateKtw(id: ToothId, value: string) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth.ktw = value
    },

    updateCal(id: ToothId, surface: Surface, site: SiteIndex) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted) return
      tooth[surface].cal[site] = calculateCal(tooth[surface].pd[site], tooth[surface].rec[site])
    },

    toggleFur(id: ToothId, surface: Surface, index: number) {
      const tooth = this.teethData[id]
      if (!tooth || tooth.extracted || tooth.implant) return
      tooth.fur[surface][index] = (tooth.fur[surface][index] + 1) % 4
    },

    toggleExtracted(id: ToothId) {
      const tooth = this.teethData[id]
      if (!tooth) return
      tooth.extracted = !tooth.extracted
    },

    updateNote(id: ToothId, note: string) {
      const tooth = this.teethData[id]
      if (!tooth) return
      tooth.note = note
    },

    resetChart() {
      this.patientInfo = createDefaultPatientInfo()
      this.teethData = createInitialChartData()
      this.selectedToothId = null
      this.activeSubNav = 'chart'
    }
  }
})
