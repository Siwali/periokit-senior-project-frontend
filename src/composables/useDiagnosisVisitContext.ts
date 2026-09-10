import { ref } from 'vue'
import { useDiagnosisStore } from '@/stores/diagnosis'
import { usePeriodontalChartStore } from '@/stores/periodontal-chart'
import { useVisitStore } from '@/stores/visit'

export type DiagnosisLoadStatus = 'loading' | 'loaded' | 'error'

/**
 * Keeps the route, active visit, chart and diagnosis worksheet on the same
 * visit. The page can stay mounted while the drawer changes its query, so this
 * is a repeatable workflow rather than mount-only setup.
 */
export function useDiagnosisVisitContext() {
  const chartStore = usePeriodontalChartStore()
  const visitStore = useVisitStore()
  const diagnosisStore = useDiagnosisStore()
  const loadStatus = ref<DiagnosisLoadStatus>('loading')
  let requestId = 0

  chartStore.initializeChart()

  async function open(visitId: string | null, patientId: string | null) {
    const currentRequest = ++requestId
    diagnosisStore.openFor(visitId, patientId)

    const contextAlreadyOpen =
      visitStore.activeVisitId === visitId &&
      (!patientId || chartStore.currentPatientId === patientId)
    if (contextAlreadyOpen) {
      loadStatus.value = 'loaded'
      return
    }

    loadStatus.value = 'loading'

    try {
      if (visitId === 'new') {
        // A draft has no server chart to replace the previous visit with.
        chartStore.resetChart()
        visitStore.setActiveVisit('new')
        if (patientId) await chartStore.loadPatientById(patientId)
      } else if (visitId) {
        // Set this before the request so the chart store can reject a response
        // belonging to a visit the user has already moved away from.
        visitStore.setActiveVisit(visitId)
        if (patientId && chartStore.currentPatientId !== patientId) {
          await chartStore.loadPatientById(patientId)
        }
        if (currentRequest !== requestId) return
        await chartStore.loadFromBackend(visitId)
      } else {
        visitStore.setActiveVisit(null)
      }

      if (currentRequest === requestId) loadStatus.value = 'loaded'
    } catch (error) {
      if (currentRequest !== requestId) return
      console.error('Failed to load visit for diagnosis:', error)
      loadStatus.value = 'error'
    }
  }

  return { loadStatus, open }
}
