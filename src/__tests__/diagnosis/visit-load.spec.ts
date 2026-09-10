import { beforeEach, describe, expect, it, vi } from 'vitest'

const fakes = vi.hoisted(() => ({
  chart: {
    currentPatientId: 'patient-1',
    loadFromBackend: vi.fn(),
  },
  diagnosis: {
    openFor: vi.fn(),
    hydrateFromBackend: vi.fn(),
  },
}))

vi.mock('@/stores/periodontal-chart', () => ({
  usePeriodontalChartStore: () => fakes.chart,
}))
vi.mock('@/stores/diagnosis', () => ({
  useDiagnosisStore: () => fakes.diagnosis,
}))

import { useVisitLoad } from '@/composables/useVisitLoad'

describe('visit load orchestration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hydrates the diagnosis returned with the chart', async () => {
    const response = { extent: 'localized', complexity: {} }
    fakes.chart.loadFromBackend.mockResolvedValue(response)
    const { loadVisit } = useVisitLoad()

    await expect(loadVisit('visit-1')).resolves.toBe(true)

    expect(fakes.diagnosis.openFor).toHaveBeenCalledWith('visit-1', 'patient-1')
    expect(fakes.diagnosis.hydrateFromBackend).toHaveBeenCalledWith(response)
  })

  it('keeps a local worksheet when the chart has no saved diagnosis', async () => {
    fakes.chart.loadFromBackend.mockResolvedValue(null)
    const { loadVisit } = useVisitLoad()

    await expect(loadVisit('visit-1')).resolves.toBe(true)

    expect(fakes.diagnosis.openFor).toHaveBeenCalledOnce()
    expect(fakes.diagnosis.hydrateFromBackend).not.toHaveBeenCalled()
  })

  it('ignores a stale chart response', async () => {
    fakes.chart.loadFromBackend.mockResolvedValue(undefined)
    const { loadVisit } = useVisitLoad()

    await expect(loadVisit('visit-1')).resolves.toBe(false)

    expect(fakes.diagnosis.openFor).not.toHaveBeenCalled()
    expect(fakes.diagnosis.hydrateFromBackend).not.toHaveBeenCalled()
  })
})
