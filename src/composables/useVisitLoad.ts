import { useDiagnosisStore } from '@/stores/diagnosis'
import { usePeriodontalChartStore } from '@/stores/periodontal-chart'

/** Loads both parts of the visit document without coupling their stores. */
export function useVisitLoad() {
  const chartStore = usePeriodontalChartStore()
  const diagnosisStore = useDiagnosisStore()

  async function loadVisit(visitId: string) {
    const diagnosis = await chartStore.loadFromBackend(visitId)
    // undefined means this response became stale while another visit opened.
    if (diagnosis === undefined) return false

    diagnosisStore.openFor(visitId, chartStore.currentPatientId)
    if (diagnosis) diagnosisStore.hydrateFromBackend(diagnosis)
    return true
  }

  return { loadVisit }
}
