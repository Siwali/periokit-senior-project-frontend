import { describe, expect, it } from 'vitest'
import { buildExportRequest, exportErrorMessage, filenameFromDisposition } from './export.mapping'
import type { ExportState } from './export.constants'

const state = (patch: Partial<ExportState> = {}): ExportState => ({
  format: 'pdf',
  includePatientDetails: true,
  paper: 'a4',
  pngDpi: 150,
  orient: { chart: 'landscape', diagnosis: 'portrait', images: 'landscape', imageNotes: 'portrait' },
  on: { chart: true, diagnosis: true, images: true, imageNotes: true },
  gray: false,
  ...patch,
})

describe('buildExportRequest', () => {
  it('maps ticked sections, their orientations and options', () => {
    expect(buildExportRequest(state({ gray: true }), {}, ' HN-1_report ')).toEqual({
      format: 'pdf',
      includePatientDetails: true,
      includeImageNotes: true,
      sections: ['chart', 'diagnosis', 'images'],
      paperSize: 'a4',
      orientations: { chart: 'landscape', diagnosis: 'portrait', images: 'landscape' },
      grayscale: true,
      baseFilename: 'HN-1_report',
    })
  })

  it('sends pngDpi only for PNG', () => {
    expect(buildExportRequest(state(), {}, 'a').pngDpi).toBeUndefined()
    expect(buildExportRequest(state({ format: 'png', pngDpi: 300 }), {}, 'a').pngDpi).toBe(300)
  })

  it('drops unavailable sections and children of unticked parents', () => {
    const s = state()
    s.on.images = false
    const req = buildExportRequest(s, { diagnosis: { available: false, reason: 'No saved diagnosis' } }, '')
    expect(req.sections).toEqual(['chart'])
    expect(req.baseFilename).toBe('periodontal-report')
  })

  it('limits Excel exports to the chart regardless of other section selections', () => {
    const req = buildExportRequest(
      state({ format: 'excel', on: { chart: false, diagnosis: true, images: true, imageNotes: true }, gray: true }),
      {},
      'patient-report',
    )

    expect(req.sections).toEqual(['chart'])
    expect(req.orientations).toEqual({})
    expect(req.grayscale).toBe(false)
  })

  it('does not request an unavailable chart for Excel', () => {
    const req = buildExportRequest(
      state({ format: 'excel' }),
      { chart: { available: false, reason: 'No saved chart' } },
      'patient-report',
    )

    expect(req.sections).toEqual([])
  })

  it('maps the patient and visit details preference', () => {
    expect(buildExportRequest(state({ includePatientDetails: false }), {}, 'report').includePatientDetails).toBe(false)
  })

  it('treats X-ray notes as an overlay option instead of a separate page', () => {
    const req = buildExportRequest(state(), {}, 'report')
    expect(req.includeImageNotes).toBe(true)
    expect(req.sections).not.toContain('imageNotes')

    const withoutNotes = state()
    withoutNotes.on.imageNotes = false
    expect(buildExportRequest(withoutNotes, {}, 'report').includeImageNotes).toBe(false)
  })
})

describe('filenameFromDisposition', () => {
  it('prefers the UTF-8 filename', () => {
    const header = `attachment; filename="HN-___.pdf"; filename*=UTF-8''HN-%E0%B8%81.pdf`
    expect(filenameFromDisposition(header, 'x')).toBe('HN-ก.pdf')
  })
  it('falls back to the ASCII filename, then the default', () => {
    expect(filenameFromDisposition('attachment; filename="a.zip"', 'x')).toBe('a.zip')
    expect(filenameFromDisposition(null, 'x')).toBe('x')
  })
})

describe('exportErrorMessage', () => {
  it('maps known codes and 429', () => {
    expect(exportErrorMessage({ code: 'EXPORT_SOURCE_CHANGED' })).toMatch(/changed/)
    expect(exportErrorMessage({ status: 429, code: 'X' })).toMatch(/busy/)
    expect(exportErrorMessage({ message: 'boom' })).toBe('boom')
  })
})
