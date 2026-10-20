import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import type { ExportPreviewRequest, ExportSource } from '@/services/api/export.api'
import type { SectionAvailability } from '@/domain/export/export.mapping'

const fetchExportPreview = vi.fn()
const fetchExportSource = vi.fn()
vi.mock('@/services/api/export.api', async () => {
  const { ExportApiError } = await vi.importActual<typeof import('@/services/api/export.api')>('@/services/api/export.api')
  return { ExportApiError, fetchExportPreview, fetchExportSource }
})
vi.mock('@/services/session', () => ({ handleUnauthorizedSession: vi.fn() }))
vi.mock('@/services/token-storage', () => ({ getAuthHeaders: () => ({}) }))

const { useExportPreview } = await import('./useExportPreview')
const { ExportApiError } = await import('@/services/api/export.api')

const req = (): ExportPreviewRequest => ({
  format: 'pdf', sections: ['chart'], paperSize: 'a4', orientations: {}, grayscale: false, baseFilename: 'r',
})
const source = (snapshotVersion: string): ExportSource => ({
  protocolVersion: '1.0',
  snapshotVersion,
  rendererVersion: 'legacy',
  generatedAt: '2026-10-20T00:00:00.000Z',
  availability: { chart: { available: true, reason: null } },
  patient: { hn: '1', firstName: 'Ada', lastName: 'L', age: 30, gender: null, nationality: null, note: null },
  visit: { date: '2026-10-20', phase: 'before', doctorName: null, studentId: null, clinicalNote: null, status: 'saved' },
  chart: {
    id: 'chart', name: 'Baseline', status: 'saved', updatedAt: '2026-10-20T00:00:00.000Z',
    summary: null, teeth: [],
  },
  diagnosis: null,
  imageBoard: null,
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

function setup(visitId = 'v1', initial = req()) {
  const visit = ref<string | null>(visitId)
  const body = ref<ExportPreviewRequest | null>(initial)
  const availability = ref<SectionAvailability>({})
  const scope = effectScope()
  const api = scope.run(() => useExportPreview(visit, body, availability, 100))!
  return { visit, body, availability, scope, ...api }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('useExportPreview', () => {
  it('loads one source and renders visual option changes locally', async () => {
    fetchExportSource.mockResolvedValue(source('a'))
    const preview = setup()
    await vi.runAllTimersAsync()
    expect(fetchExportSource).toHaveBeenCalledTimes(1)
    expect(preview.preview.value?.pages[0]?.widthMm).toBe(297)

    preview.body.value = { ...req(), paperSize: 'letter', orientations: { chart: 'portrait' } }
    await nextTick()

    expect(fetchExportSource).toHaveBeenCalledTimes(1)
    expect(fetchExportPreview).not.toHaveBeenCalled()
    expect(preview.preview.value?.pages[0]).toMatchObject({ widthMm: 215.9, heightMm: 279.4 })
  })

  it('does not reload for download-only changes', async () => {
    fetchExportSource.mockResolvedValue(source('a'))
    const preview = setup()
    await vi.runAllTimersAsync()
    preview.body.value = { ...req(), format: 'png', pngDpi: 300, baseFilename: 'new-name' }
    await nextTick()
    expect(fetchExportSource).toHaveBeenCalledTimes(1)
    expect(fetchExportPreview).not.toHaveBeenCalled()
  })

  it('aborts the old source request after a visit change', async () => {
    const first = deferred<ExportSource>()
    fetchExportSource.mockReturnValueOnce(first.promise).mockResolvedValueOnce(source('v2'))
    const preview = setup()
    await nextTick()
    const firstSignal = fetchExportSource.mock.calls[0]![1] as AbortSignal
    preview.visit.value = 'v2'
    await vi.runAllTimersAsync()
    expect(firstSignal.aborted).toBe(true)
    expect(preview.preview.value?.snapshotVersion).toBe('v2')
  })

  it('does not load a new unsaved visit', async () => {
    setup('new')
    await vi.runAllTimersAsync()
    expect(fetchExportSource).not.toHaveBeenCalled()
  })

  it('falls back to the legacy preview endpoint during rolling deployment', async () => {
    fetchExportSource.mockRejectedValueOnce(new ExportApiError('missing', 404, 'EXPORT_FAILED'))
    fetchExportPreview.mockResolvedValueOnce({
      snapshotVersion: 'legacy', rendererVersion: 'legacy', availability: {}, pageCount: 0, pages: [], warnings: [],
    })
    const preview = setup()
    await vi.runAllTimersAsync()
    expect(fetchExportPreview).toHaveBeenCalledTimes(1)
    expect(preview.preview.value?.snapshotVersion).toBe('legacy')
  })

  it('aborts on scope dispose', async () => {
    fetchExportSource.mockReturnValueOnce(new Promise(() => {}))
    const preview = setup()
    await nextTick()
    preview.scope.stop()
    expect((fetchExportSource.mock.calls[0]![1] as AbortSignal).aborted).toBe(true)
  })
})
