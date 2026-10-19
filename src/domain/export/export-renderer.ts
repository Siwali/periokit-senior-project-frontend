import { createInitialChartData } from '@/domain/chart/chart.factory'
import { calculateChartSummary } from '@/domain/chart/chart.calculations'
import type { ChartData, PatientInfo, Surface } from '@/domain/chart/chart.types'

export const EXPORT_RENDERER_PROTOCOL_VERSION = '1.0' as const

export type ExportPageSection = 'patientDetails' | 'chart' | 'diagnosis' | 'images' | 'imageNotes' | 'notes'

export interface ExportRenderPageModel {
  id: string
  section: ExportPageSection
  title: string
  pageNumber: number
  pageCount: number
  widthMm: number
  heightMm: number
  orientation: 'portrait' | 'landscape'
}

export interface ExportChartSnapshot {
  id: string
  name: string | null
  status: string
  updatedAt: string
  summary: { totalTeeth: number | null; bopPercentage: number | null; plaquePercentage: number | null } | null
  teeth: Array<{
    number: number
    arch: string
    status: string
    mobility: number | null
    prognosisKc: string | null
    prognosisMn: string | null
    note: string | null
    surfaces: Array<{ surface: string; ktwMm: number | null }>
    sites: Array<{
      surface: string
      position: string
      pdMm: number | null
      recessionMm: number | null
      calMm: number | null
      bop: boolean
      plaque: boolean
    }>
    furcations: Array<{ surface: string; siteIndex: number; grade: string }>
  }>
}

export interface ExportBoardObject {
  id: string
  objectType: 'image' | 'note'
  zIndex: number
  posX: number
  posY: number
  width: number
  height: number
  rotation: number
  assetId: string | null
  slotCode: string | null
  noteText: string | null
  noteColor: string | null
  noteFontSize: number | null
}

export interface ExportRenderModel {
  protocolVersion: typeof EXPORT_RENDERER_PROTOCOL_VERSION
  snapshotVersion: string
  generatedAt: string
  options: { format: 'pdf' | 'png' | 'excel'; paperSize: 'a4' | 'letter' | 'legal'; grayscale: boolean }
  pages: ExportRenderPageModel[]
  patient: {
    hn: string
    firstName: string
    lastName: string
    age: number | null
    gender: string | null
    nationality: string | null
    note: string | null
  }
  visit: {
    date: string
    phase: string
    doctorName: string | null
    studentId: string | null
    clinicalNote: string | null
    status: string
  }
  chart: ExportChartSnapshot | null
  diagnosis: { id: string; extent: string | null; complexity: unknown; updatedAt: string } | null
  imageBoard: null | {
    status: string
    objects: ExportBoardObject[]
    assets: Array<{ id: string; source: string; naturalWidth: number; naturalHeight: number }>
  }
}

declare global {
  interface Window {
    __PERIOKIT_EXPORT_INPUT__?: ExportRenderModel
    __PERIOKIT_EXPORT_STATUS__?: {
      state: 'loading' | 'ready' | 'error'
      protocolVersion: typeof EXPORT_RENDERER_PROTOCOL_VERSION
      code?: string
    }
  }
}

const surfaceOf = (surface: string): Surface => surface === 'buccal' ? 'buccal' : 'lingual'
const value = (input: number | null) => input === null ? '' : String(input)
const siteIndex = (position: string) => position.startsWith('D') ? 2 : position.startsWith('M') ? 0 : 1

export function mapSnapshotChart(snapshot: ExportChartSnapshot | null): ChartData {
  const chart = createInitialChartData()
  if (!snapshot) return chart

  for (const tooth of snapshot.teeth) {
    const target = chart[tooth.number]
    if (!target) continue
    target.extracted = tooth.status === 'missing'
    target.implant = tooth.status === 'implant'
    target.mo = value(tooth.mobility)
    target.prognosisKC = tooth.prognosisKc ?? ''
    target.prognosisMN = tooth.prognosisMn ?? ''
    target.note = tooth.note ?? ''
    for (const item of tooth.surfaces) target[surfaceOf(item.surface)].ktw = value(item.ktwMm)
    for (const item of tooth.sites) {
      const site = target[surfaceOf(item.surface)]
      const index = siteIndex(item.position)
      site.pd[index] = value(item.pdMm)
      site.rec[index] = value(item.recessionMm)
      site.cal[index] = value(item.calMm)
      site.bop[index] = item.bop
      site.pi[index] = item.plaque
    }
    for (const item of tooth.furcations) {
      const sites = target.fur[surfaceOf(item.surface)]
      if (item.siteIndex < sites.length) sites[item.siteIndex] = Number(item.grade.replace('grade_', '')) || 0
    }
  }
  return chart
}

export function rendererPatientInfo(model: ExportRenderModel): PatientInfo {
  return {
    hn: model.patient.hn,
    doctor: model.visit.doctorName ?? '',
    studentId: model.visit.studentId ?? '',
    patientName: [model.patient.firstName, model.patient.lastName].filter(Boolean).join(' '),
    age: model.patient.age,
    nationality: model.patient.nationality ?? '',
    gender: model.patient.gender ?? '',
    date: model.visit.date,
    visitPhase: model.visit.phase,
  }
}

export const rendererChartSummary = (chart: ChartData) => calculateChartSummary(chart)

export function boardObjectsForPage(
  model: ExportRenderModel,
  section: 'images' | 'imageNotes',
): ExportBoardObject[] {
  const objects = model.imageBoard?.objects ?? []
  if (section === 'imageNotes') return objects.filter(object => object.objectType === 'note')
  const includesNotes = model.pages.some(page => page.section === 'imageNotes')
  return includesNotes ? objects : objects.filter(object => object.objectType === 'image')
}

export function readExportRenderModel(): ExportRenderModel {
  const model = window.__PERIOKIT_EXPORT_INPUT__
  if (!model) throw new Error('RENDER_INPUT_MISSING')
  if (model.protocolVersion !== EXPORT_RENDERER_PROTOCOL_VERSION) throw new Error('RENDER_PROTOCOL_MISMATCH')
  if (!Array.isArray(model.pages) || model.pages.length === 0) throw new Error('RENDER_PAGES_MISSING')
  return model
}
