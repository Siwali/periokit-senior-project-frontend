import { describe, expect, it } from 'vitest'
import { boardObjectsForPage, buildBrowserRenderModel, mapSnapshotChart, type ExportChartSnapshot, type ExportRenderModel } from './export-renderer'
import type { ExportSource } from '@/services/api/export.api'

const chart = (teeth: ExportChartSnapshot['teeth']): ExportChartSnapshot => ({
  id: 'chart', name: 'Saved chart', status: 'saved', updatedAt: '2026-10-19T00:00:00Z', summary: null, teeth,
})

describe('export renderer chart adapter', () => {
  it('maps persisted sites, surfaces, status and furcations to the shared chart component model', () => {
    const result = mapSnapshotChart(chart([{
      number: 16, arch: 'upper', status: 'implant', mobility: 2, prognosisKc: 'Good', prognosisMn: null, note: 'watch',
      surfaces: [{ surface: 'palatal', ktwMm: 1.5 }],
      sites: [{ surface: 'palatal', position: 'DP', pdMm: 6, recessionMm: 2, calMm: 8, bop: true, plaque: true }],
      furcations: [{ surface: 'palatal', siteIndex: 0, grade: 'grade_2' }],
    }]))

    expect(result[16]).toMatchObject({ implant: true, extracted: false, mo: '2', prognosisKC: 'Good', note: 'watch' })
    expect(result[16].lingual).toMatchObject({ ktw: '1.5', pd: ['', '', '6'], rec: ['', '', '2'], cal: ['', '', '8'] })
    expect(result[16].lingual.bop[2]).toBe(true)
    expect(result[16].lingual.pi[2]).toBe(true)
    expect(result[16].fur.lingual[0]).toBe(2)
  })

  it('keeps all chart teeth available when a persisted record is absent', () => {
    expect(Object.keys(mapSnapshotChart(null))).toHaveLength(32)
  })
})

describe('export renderer image sections', () => {
  const renderModel = (sections: ExportRenderModel['pages'][number]['section'][]): ExportRenderModel => ({
    protocolVersion: '1.0', snapshotVersion: 'snapshot', generatedAt: '2026-10-19T00:00:00Z',
    options: { format: 'pdf', paperSize: 'a4', grayscale: false },
    pages: sections.map((section, index) => ({ id: `${index}-${section}`, section, title: section, pageNumber: index + 1, pageCount: sections.length, widthMm: 210, heightMm: 297, orientation: 'portrait' })),
    patient: { hn: '1', firstName: 'A', lastName: 'B', age: null, gender: null, nationality: null, note: null },
    visit: { date: '2026-10-19', phase: 'before_hygienic', doctorName: null, studentId: null, clinicalNote: null, status: 'saved' },
    chart: null, diagnosis: null,
    imageBoard: {
      status: 'saved', assets: [],
      objects: [
        { id: 'image', objectType: 'image', zIndex: 0, posX: 0, posY: 0, width: 10, height: 10, rotation: 0, assetId: 'asset', slotCode: null, noteText: null, noteColor: null, noteFontSize: null },
        { id: 'note', objectType: 'note', zIndex: 1, posX: 0, posY: 0, width: 10, height: 10, rotation: 0, assetId: null, slotCode: null, noteText: 'note', noteColor: '#ffffff', noteFontSize: 12 },
      ],
    },
  })

  it('removes note objects from the image board when imageNotes is unchecked', () => {
    expect(boardObjectsForPage(renderModel(['images']), 'images').map(object => object.id)).toEqual(['image'])
  })

  it('keeps placed notes when imageNotes is selected', () => {
    expect(boardObjectsForPage(renderModel(['images', 'imageNotes']), 'images').map(object => object.id)).toEqual(['image', 'note'])
  })
})

describe('buildBrowserRenderModel', () => {
  it('applies page settings locally without mutating the saved source', () => {
    const source: ExportSource = {
      protocolVersion: '1.0', snapshotVersion: 'snapshot', rendererVersion: 'legacy',
      generatedAt: '2026-10-20T00:00:00Z', availability: {},
      patient: { hn: '1', firstName: 'A', lastName: 'B', age: null, gender: null, nationality: null, note: null },
      visit: { date: '2026-10-20', phase: 'before', doctorName: null, studentId: null, clinicalNote: null, status: 'saved' },
      chart: null, diagnosis: null, imageBoard: null,
    }
    const before = structuredClone(source)
    const model = buildBrowserRenderModel(source, {
      format: 'pdf', sections: ['chart', 'diagnosis'], paperSize: 'letter',
      orientations: { chart: 'landscape', diagnosis: 'portrait' }, grayscale: true, baseFilename: 'report',
    })
    expect(model.pages).toMatchObject([
      { section: 'chart', widthMm: 279.4, heightMm: 215.9, pageCount: 2 },
      { section: 'diagnosis', widthMm: 215.9, heightMm: 279.4, pageCount: 2 },
    ])
    expect(model.options.grayscale).toBe(true)
    expect(source).toEqual(before)
  })
})
