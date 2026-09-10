import { beforeEach, describe, expect, it, vi } from 'vitest'

const fakes = vi.hoisted(() => ({
  chart: {
    currentPatientId: null as string | null,
    initializeChart: vi.fn(),
    resetChart: vi.fn(),
    loadPatientById: vi.fn(),
    loadFromBackend: vi.fn(),
  },
  visits: {
    activeVisitId: null as string | null,
    setActiveVisit: vi.fn((id: string | null) => {
      fakes.visits.activeVisitId = id
    }),
  },
  diagnosis: { openFor: vi.fn() },
}))

vi.mock('@/stores/periodontal-chart', () => ({
  usePeriodontalChartStore: () => fakes.chart,
}))
vi.mock('@/stores/visit', () => ({ useVisitStore: () => fakes.visits }))
vi.mock('@/stores/diagnosis', () => ({ useDiagnosisStore: () => fakes.diagnosis }))

import { useDiagnosisVisitContext } from '@/composables/useDiagnosisVisitContext'

describe('Diagnosis visit context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fakes.chart.currentPatientId = null
    fakes.visits.activeVisitId = null
    fakes.chart.loadPatientById.mockImplementation(async (id: string) => {
      fakes.chart.currentPatientId = id
    })
    fakes.chart.loadFromBackend.mockResolvedValue(undefined)
  })

  it('switches the active visit and reloads its chart with its diagnosis draft', async () => {
    const context = useDiagnosisVisitContext()

    await context.open('visit-2', 'patient-1')

    expect(fakes.diagnosis.openFor).toHaveBeenCalledWith('visit-2', 'patient-1')
    expect(fakes.visits.setActiveVisit).toHaveBeenCalledWith('visit-2')
    expect(fakes.chart.loadPatientById).toHaveBeenCalledWith('patient-1')
    expect(fakes.chart.loadFromBackend).toHaveBeenCalledWith('visit-2')
    expect(context.loadStatus.value).toBe('loaded')
  })

  it('clears the previous chart when switching to a new draft visit', async () => {
    fakes.chart.currentPatientId = 'patient-1'
    fakes.visits.activeVisitId = 'visit-1'
    const context = useDiagnosisVisitContext()

    await context.open('new', 'patient-1')

    expect(fakes.chart.resetChart).toHaveBeenCalledOnce()
    expect(fakes.visits.setActiveVisit).toHaveBeenCalledWith('new')
    expect(fakes.chart.loadFromBackend).not.toHaveBeenCalled()
  })

  it('does not let an older request decide the final load state', async () => {
    let finishFirst!: () => void
    fakes.chart.loadFromBackend
      .mockImplementationOnce(() => new Promise<void>(resolve => { finishFirst = resolve }))
      .mockResolvedValueOnce(undefined)
    const context = useDiagnosisVisitContext()

    const first = context.open('visit-1', 'patient-1')
    await Promise.resolve()
    const second = context.open('visit-2', 'patient-1')
    await second
    finishFirst()
    await first

    expect(fakes.visits.activeVisitId).toBe('visit-2')
    expect(context.loadStatus.value).toBe('loaded')
  })
})
