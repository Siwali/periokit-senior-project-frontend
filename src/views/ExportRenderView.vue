<script setup lang="ts">
import { computed, nextTick, onErrorCaptured, onMounted, ref } from 'vue'
import PatientChartHeader from '@/components/chart/PatientChartHeader.vue'
import PeriodontalChartGrid from '@/components/chart/PeriodontalChartGrid.vue'
import ExportReportPage from '@/components/export/ExportReportPage.vue'
import {
  EXPORT_RENDERER_PROTOCOL_VERSION,
  boardObjectsForPage,
  mapSnapshotChart,
  readExportRenderModel,
  rendererChartSummary,
  rendererPatientInfo,
  type ExportBoardObject,
  type ExportRenderModel,
} from '@/domain/export/export-renderer'

const model = ref<ExportRenderModel | null>(null)
const renderError = ref<string | null>(null)
const chartData = computed(() => mapSnapshotChart(model.value?.chart ?? null))
const chartSummary = computed(() => rendererChartSummary(chartData.value))
const patientInfo = computed(() => model.value ? rendererPatientInfo(model.value) : null)

const setStatus = (state: 'loading' | 'ready' | 'error', code?: string) => {
  window.__PERIOKIT_EXPORT_STATUS__ = { state, protocolVersion: EXPORT_RENDERER_PROTOCOL_VERSION, ...(code ? { code } : {}) }
}
setStatus('loading')

const diagnosisRows = computed(() => {
  const complexity = model.value?.diagnosis?.complexity
  if (!complexity || typeof complexity !== 'object' || Array.isArray(complexity)) return []
  return Object.entries(complexity as Record<string, unknown>).map(([key, value]) => ({
    key: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' '),
    value: value === null || value === '' ? 'Not recorded' : String(value).replace(/_/g, ' '),
  }))
})

const boardAsset = (id: string | null) => model.value?.imageBoard?.assets.find(asset => asset.id === id)?.source
const boardObjects = computed(() => model.value ? boardObjectsForPage(model.value, 'images') : [])
const boardNotes = computed(() => model.value ? boardObjectsForPage(model.value, 'imageNotes') : [])
const boardBounds = computed(() => {
  const objects = model.value?.imageBoard?.objects ?? []
  if (!objects.length) return { minX: 0, minY: 0, width: 1, height: 1 }
  const minX = Math.min(...objects.map(object => object.posX))
  const minY = Math.min(...objects.map(object => object.posY))
  const maxX = Math.max(...objects.map(object => object.posX + object.width))
  const maxY = Math.max(...objects.map(object => object.posY + object.height))
  return { minX, minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
})
const boardObjectStyle = (object: ExportBoardObject) => ({
  left: `${((object.posX - boardBounds.value.minX) / boardBounds.value.width) * 100}%`,
  top: `${((object.posY - boardBounds.value.minY) / boardBounds.value.height) * 100}%`,
  width: `${(object.width / boardBounds.value.width) * 100}%`,
  height: `${(object.height / boardBounds.value.height) * 100}%`,
  zIndex: object.zIndex,
  transform: `rotate(${object.rotation}deg)`,
  backgroundColor: object.noteColor ?? undefined,
  fontSize: object.noteFontSize ? `${Math.max(7, object.noteFontSize * 0.55)}px` : undefined,
})

async function inlineImages() {
  await Promise.all(Array.from(document.images).map(async image => {
    if (!image.complete) await new Promise<void>((resolve, reject) => {
      image.addEventListener('load', () => resolve(), { once: true })
      image.addEventListener('error', () => reject(new Error('RENDER_IMAGE_LOAD_FAILED')), { once: true })
    })
    if (image.src.startsWith('data:')) return
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0)
    image.src = canvas.toDataURL('image/png')
  }))
}

function fail(error: unknown) {
  const code = error instanceof Error && /^[A-Z0-9_]+$/.test(error.message) ? error.message : 'RENDER_FAILED'
  renderError.value = code
  setStatus('error', code)
}

onErrorCaptured(error => { fail(error); return false })
onMounted(async () => {
  try {
    model.value = readExportRenderModel()
    await nextTick()
    await document.fonts.ready
    await inlineImages()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    setStatus('ready')
  } catch (error) { fail(error) }
})
</script>

<template>
  <div v-if="model" id="export-render-root" class="bg-slate-100">
    <ExportReportPage v-for="page in model.pages" :key="page.id" :page="page" :model="model">
      <div v-if="page.section === 'patientDetails'" class="grid h-full grid-cols-2 gap-4 content-start pt-3 text-[11px]">
        <div class="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Patient</p>
          <p class="mt-1 text-xl font-black">{{ model.patient.firstName }} {{ model.patient.lastName }}</p>
          <p class="mt-1 text-slate-500">HN {{ model.patient.hn }}</p>
        </div>
        <dl v-for="item in [
          ['Visit date', model.visit.date], ['Treatment phase', model.visit.phase],
          ['Clinician', model.visit.doctorName], ['Clinician ID', model.visit.studentId],
          ['Age', model.patient.age], ['Gender', model.patient.gender],
          ['Nationality', model.patient.nationality], ['Visit status', model.visit.status],
        ]" :key="String(item[0])" class="rounded-lg border border-slate-200 p-3">
          <dt class="text-[8px] font-bold uppercase text-slate-400">{{ item[0] }}</dt><dd class="mt-1 font-semibold">{{ item[1] ?? 'Not recorded' }}</dd>
        </dl>
        <div v-if="model.visit.clinicalNote || model.patient.note" class="col-span-2 rounded-lg border border-slate-200 p-4 whitespace-pre-wrap">
          <p class="text-[8px] font-bold uppercase text-slate-400">Clinical notes</p>{{ model.visit.clinicalNote || model.patient.note }}
        </div>
      </div>

      <div v-else-if="page.section === 'chart' && patientInfo" class="export-chart-stage">
        <div class="export-chart-content">
          <PatientChartHeader :patient-info="patientInfo" :summary="chartSummary" patient-fields-disabled visit-fields-disabled />
          <PeriodontalChartGrid class="mt-3" :chart-data="chartData" :selected-tooth-id="null" readonly fit-width />
        </div>
      </div>

      <div v-else-if="page.section === 'diagnosis'" class="h-full pt-3 text-[10px]">
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p class="text-[8px] font-bold uppercase tracking-wider text-blue-600">Extent</p>
          <p class="mt-1 text-lg font-black capitalize">{{ model.diagnosis?.extent?.replace('_', ' ') || 'Not recorded' }}</p>
        </div>
        <div class="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div v-for="row in diagnosisRows" :key="row.key" class="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5 last:border-0">
            <span class="capitalize text-slate-500">{{ row.key }}</span><b class="capitalize">{{ row.value }}</b>
          </div>
          <p v-if="!diagnosisRows.length" class="p-5 text-slate-500">No diagnosis details were recorded.</p>
        </div>
      </div>

      <div v-else-if="page.section === 'images'" class="export-board">
        <template v-for="object in boardObjects" :key="object.id">
          <img v-if="object.objectType === 'image' && boardAsset(object.assetId)" :src="boardAsset(object.assetId)" :style="boardObjectStyle(object)" class="export-board-object object-contain" />
          <div v-else-if="object.objectType === 'note'" :style="boardObjectStyle(object)" class="export-board-object overflow-hidden whitespace-pre-wrap p-2">{{ object.noteText }}</div>
        </template>
      </div>

      <div v-else-if="page.section === 'imageNotes'" class="space-y-3 pt-3 text-[10px]">
        <div v-for="(note, index) in boardNotes" :key="note.id" class="rounded-lg border border-slate-200 p-4 whitespace-pre-wrap">
          <p class="mb-1 text-[8px] font-bold uppercase text-slate-400">Image note {{ index + 1 }}</p>{{ note.noteText }}
        </div>
        <p v-if="!boardNotes.length" class="text-slate-500">No image notes were recorded.</p>
      </div>

      <div v-else class="pt-3 text-[11px] whitespace-pre-wrap">{{ model.visit.clinicalNote || model.patient.note || 'No notes were recorded.' }}</div>
    </ExportReportPage>
  </div>
  <p v-else-if="renderError" class="p-6 font-mono text-red-700">{{ renderError }}</p>
</template>

<style>
html:has(#export-render-root), body:has(#export-render-root), body:has(#export-render-root) #app { margin: 0; min-width: 0; background: #f1f5f9; }
#export-render-root { min-height: 100vh; }
#export-render-root > main { margin: 0 auto 16px; }
.export-chart-stage { position: relative; width: 100%; height: 100%; overflow: hidden; }
.export-chart-content { width: 1120px; transform: scale(.65); transform-origin: left top; }
.export-board { position: relative; width: 100%; height: 100%; overflow: hidden; background: #101827; border-radius: 8px; }
.export-board-object { position: absolute; transform-origin: center; border-radius: 4px; }
@media print { #export-render-root > main { margin: 0; break-after: page; } }
</style>
