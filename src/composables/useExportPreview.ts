import { onScopeDispose, ref, shallowRef, watch, type Ref } from 'vue'
import {
  ExportApiError,
  fetchExportPreview,
  fetchExportSource,
  type ExportPreview,
  type ExportPreviewRequest,
  type ExportSource,
} from '@/services/api/export.api'
import { exportErrorMessage, type SectionAvailability } from '@/domain/export/export.mapping'
import { buildBrowserRenderModel } from '@/domain/export/export-renderer'
import type { SectionId } from '@/domain/export/export.constants'

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

/** Settings that can change the visible preview. Download-only options are deliberately excluded. */
export const previewVisualKey = (request: ExportPreviewRequest | null) => {
  if (!request) return 'null'
  return JSON.stringify({
    sections: request.sections,
    includePatientDetails: request.includePatientDetails,
    includeImageNotes: request.includeImageNotes,
    paperSize: request.paperSize,
    orientations: request.orientations,
    grayscale: request.grayscale,
  })
}

/**
 * Loads one authorized saved source per visit, then renders option changes in
 * the browser. The legacy preview endpoint remains a deployment-order fallback.
 */
export function useExportPreview(
  visitId: Ref<string | null>,
  request: Ref<ExportPreviewRequest | null>,
  availability: Ref<SectionAvailability>,
  debounceMs = 800,
) {
  const preview = shallowRef<ExportPreview | null>(null)
  const source = shallowRef<ExportSource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let controller: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let legacyFallback = false
  let seq = 0

  function cancel() {
    if (timer) clearTimeout(timer)
    timer = null
    controller?.abort()
    controller = null
    seq += 1
    loading.value = false
  }

  function renderLocal() {
    const currentSource = source.value
    const body = request.value
    if (!currentSource || !body) return
    const model = buildBrowserRenderModel(currentSource, body)
    preview.value = {
      snapshotVersion: currentSource.snapshotVersion,
      rendererVersion: currentSource.rendererVersion,
      availability: currentSource.availability,
      pageCount: model.pages.length,
      pages: model.pages.map(page => ({ ...page, section: page.section as SectionId, html: '' })),
      warnings: [],
      model,
    }
    error.value = null
  }

  async function loadLegacy() {
    cancel()
    const id = visitId.value
    const body = request.value
    if (!id || id === 'new' || !body || !body.sections.length) {
      preview.value = null
      error.value = null
      return
    }
    const mine = seq
    controller = new AbortController()
    loading.value = true
    error.value = null
    try {
      const result = await fetchExportPreview(id, body, controller.signal)
      if (mine !== seq) return
      availability.value = result.availability
      preview.value = result
    } catch (err) {
      if (mine !== seq || isAbort(err)) return
      if (err instanceof ExportApiError && err.code === 'EXPORT_DATA_UNAVAILABLE') {
        const unavailable = (err.details as { unavailable?: { section: string; reason: string | null }[] })?.unavailable ?? []
        availability.value = {
          ...availability.value,
          ...Object.fromEntries(unavailable.map((item) => [item.section, { available: false, reason: item.reason }])),
        }
        return
      }
      preview.value = null
      error.value = exportErrorMessage(err)
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  function scheduleLegacy() {
    cancel()
    loading.value = true
    timer = setTimeout(loadLegacy, debounceMs)
  }

  async function loadSource() {
    cancel()
    source.value = null
    preview.value = null
    availability.value = {}
    legacyFallback = false
    const id = visitId.value
    if (!id || id === 'new') {
      error.value = null
      return
    }
    const mine = seq
    controller = new AbortController()
    loading.value = true
    error.value = null
    try {
      const result = await fetchExportSource(id, controller.signal)
      if (mine !== seq) return
      if (result.protocolVersion !== '1.0') throw new Error('Unsupported export source version')
      source.value = result
      availability.value = result.availability
      renderLocal()
    } catch (err) {
      if (mine !== seq || isAbort(err)) return
      if (err instanceof ExportApiError && err.status === 404 && err.code === 'EXPORT_FAILED') {
        legacyFallback = true
        scheduleLegacy()
        return
      }
      error.value = exportErrorMessage(err)
    } finally {
      if (mine === seq && !legacyFallback) loading.value = false
    }
  }

  watch(visitId, loadSource, { immediate: true })
  watch(() => previewVisualKey(request.value), () => {
    if (source.value) renderLocal()
    else if (legacyFallback) scheduleLegacy()
  })
  onScopeDispose(cancel)

  return { preview, loading, error, refresh: loadSource, cancel }
}
