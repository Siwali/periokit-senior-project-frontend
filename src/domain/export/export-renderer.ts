import { createInitialChartData } from '@/domain/chart/chart.factory'
import { calculateChartSummary } from '@/domain/chart/chart.calculations'
import type { ChartData, PatientInfo, Surface } from '@/domain/chart/chart.types'
import { deriveDiagnosisAssessment, type DiagnosisAssessment } from '@/domain/diagnosis/diagnosis.assessment'
import { collectChartFindings } from '@/domain/diagnosis/diagnosis.findings'
import type { DiagnosisComplexityInputDto, DiagnosisResponseDto } from '@/domain/diagnosis/diagnosis.api-mapper'
import { fromDiagnosisResponseDto } from '@/domain/diagnosis/diagnosis.api-mapper'
import type { ChartFindings, DiagnosisInputs } from '@/domain/diagnosis/diagnosis.types'
import { PAPER_SIZES, type ExportFormat, type PaperSize, type SectionId } from './export.constants'
import type { ExportPreviewRequest, ExportSource } from '@/services/api/export.api'

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
  options: { format: ExportFormat; paperSize: PaperSize; grayscale: boolean }
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

const nullableNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const nullableEnum = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  typeof value === 'string' && allowed.includes(value as T) ? value as T : null

function normalizeDiagnosisComplexity(value: unknown): DiagnosisComplexityInputDto {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const stageValues = ['stage_1', 'stage_2', 'stage_3', 'stage_4'] as const
  return {
    boneLossPercent: nullableNumber(source.boneLossPercent),
    teethLostToPerio: nullableNumber(source.teethLostToPerio),
    directEvidence: nullableEnum(source.directEvidence, ['no_loss', 'lt_2mm', 'gte_2mm'] as const),
    phenotype: nullableEnum(source.phenotype, ['heavy_biofilm', 'commensurate', 'exceeds'] as const),
    smoking: nullableEnum(source.smoking, ['non_smoker', 'lt_10', 'gte_10'] as const),
    diabetes: nullableEnum(source.diabetes, ['none', 'hba1c_lt_7', 'hba1c_gte_7'] as const),
    ageYears: nullableNumber(source.ageYears),
    calStageOverride: nullableEnum(source.calStageOverride, stageValues),
    boneLossStageOverride: nullableEnum(source.boneLossStageOverride, stageValues),
    toothLossStageOverride: nullableEnum(source.toothLossStageOverride, stageValues),
    complexityStageOverride: nullableEnum(source.complexityStageOverride, stageValues),
  }
}

export interface ExportDiagnosisReportModel {
  inputs: DiagnosisInputs
  findings: ChartFindings
  assessment: DiagnosisAssessment
}

export function rendererDiagnosisReport(model: ExportRenderModel): ExportDiagnosisReportModel | null {
  if (!model.diagnosis) return null
  const response: DiagnosisResponseDto = {
    extent: nullableEnum(model.diagnosis.extent, ['localized', 'generalized', 'molar_incisor'] as const),
    complexity: normalizeDiagnosisComplexity(model.diagnosis.complexity),
  }
  const inputs: DiagnosisInputs = {
    boneLossPercent: null,
    teethLostToPerio: null,
    extent: null,
    stageMarks: { cal: null, boneLoss: null, toothLoss: null, complexity: null },
    directEvidence: null,
    ageYears: null,
    phenotype: null,
    smoking: null,
    diabetes: null,
    ...fromDiagnosisResponseDto(response),
  }
  const findings = collectChartFindings(mapSnapshotChart(model.chart))
  return {
    inputs,
    findings,
    assessment: deriveDiagnosisAssessment(inputs, findings, model.patient.age),
  }
}

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

const PAGE_TITLES: Record<SectionId, string> = {
  chart: 'Periodontal chart',
  diagnosis: 'Periodontal diagnosis',
  images: 'Images',
  imageNotes: 'Image notes',
}

export function buildBrowserRenderModel(
  source: ExportSource,
  request: ExportPreviewRequest,
): ExportRenderModel {
  const paper = PAPER_SIZES.find(item => item.id === request.paperSize)
  if (!paper) throw new Error('RENDER_PAPER_SIZE_INVALID')
  const pageCount = request.sections.length
  const pages = request.sections.map((section, index) => {
    const orientation = request.orientations[section]
      ?? (section === 'images' ? 'landscape' : 'portrait')
    const [portraitWidth, portraitHeight] = paper.mm
    const [widthMm, heightMm] = orientation === 'portrait'
      ? [portraitWidth, portraitHeight]
      : [portraitHeight, portraitWidth]
    return {
      id: `${index + 1}-${section}`,
      section,
      title: PAGE_TITLES[section],
      pageNumber: index + 1,
      pageCount,
      widthMm,
      heightMm,
      orientation,
    }
  })
  const { rendererVersion: _rendererVersion, availability: _availability, ...modelSource } = source
  return {
    ...modelSource,
    options: { format: request.format, paperSize: request.paperSize, grayscale: request.grayscale },
    pages,
  }
}
