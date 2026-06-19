import { createInitialChartData } from '@/domain/chart/chart.factory'
import { mapChartToPayload, mapPayloadToChart } from '@/domain/chart/chart.mapper'
import type { ChartData, PatientInfo } from '@/domain/chart/chart.types'
import { chartApi } from '@/services/api/chart.api'
import { patientApi } from '@/services/api/patient.api'
import { useNotificationStore } from '@/stores/notification'
import { useVisitStore } from '@/stores/visit'

interface ChartWorkflowState {
  chartName: string
  patientInfo: PatientInfo
  teethData: ChartData
  selectedToothId: number | null
  currentPatientId: string | null
  isDirty: boolean
}

export async function saveChartWorkflow(
  chart: ChartWorkflowState,
  completeVisit = true,
) {
  const visitStore = useVisitStore()
  const notifStore = useNotificationStore()
  const visitId = visitStore.activeVisitId === 'new' ? undefined : visitStore.activeVisitId

  const { patientInfo } = chart

  if (!patientInfo.hn) {
    notifStore.error('Please enter HN before saving')
    throw new Error('HN is required')
  }

  if (!patientInfo.patientName) {
    notifStore.error('Please enter patient name before saving')
    throw new Error('Patient name is required')
  }

  const payload = mapChartToPayload({
    name: chart.chartName,
    patientInfo: chart.patientInfo,
    teethData: chart.teethData,
  })

  const names = patientInfo.patientName.trim().split(/\s+/)
  const patientGender = patientInfo.gender?.trim().toLowerCase() || null
  const patientNationality = patientInfo.nationality?.trim() || null

  try {
    const { data } = await chartApi.save({
      visitId,
      chartName: chart.chartName,
      teethData: payload,
      patientHn: patientInfo.hn,
      patientFirstName: names[0] ?? '',
      patientLastName: names.length > 1 ? names.slice(1).join(' ') : '',
      patientAge: patientInfo.age ?? null,
      patientGender,
      patientNationality,
      visitDate: patientInfo.date,
      visitPhase: patientInfo.visitPhase || 'before_hygienic',
      completeVisit,
    })

    const savedChart = data?.saveChart
    if (savedChart?.visitId) {
      visitStore.setActiveVisit(savedChart.visitId)
    }

    if (savedChart?.patientId) {
      chart.currentPatientId = savedChart.patientId
    }

    chart.isDirty = false
    notifStore.success('Chart saved successfully')

    if (chart.currentPatientId) {
      const fetchedVisits = await visitStore.loadVisits(chart.currentPatientId)
      if (savedChart?.visitId) {
        const newRealVisit = fetchedVisits.find(visit => visit.id === savedChart.visitId)
        if (newRealVisit) {
          const newIdx = visitStore.visits.findIndex(visit => visit.id === 'new')
          if (newIdx !== -1) {
            visitStore.visits[newIdx] = newRealVisit
          } else {
            const existingIdx = visitStore.visits.findIndex(visit => visit.id === savedChart.visitId)
            if (existingIdx !== -1) {
              visitStore.visits[existingIdx] = newRealVisit
            } else {
              visitStore.visits.push(newRealVisit)
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Save chart error:', err)
    notifStore.error('Failed to save chart, please try again')
    throw err
  }
}

export async function loadChartWorkflow(chart: ChartWorkflowState, visitId: string) {
  try {
    const { data } = await chartApi.getByVisit(visitId)
    const chartData = data?.chartByVisit

    if (chartData?.patientId) {
      chart.currentPatientId = chartData.patientId
    }

    if (!chartData || !chartData.teethData) {
      chart.chartName = 'New Chart'
      chart.teethData = createInitialChartData()
      chart.selectedToothId = null
      chart.isDirty = false
      return
    }

    const chartPayload = {
      chart_name: chartData.chartName || 'Chart',
      patient_info: chartData.patientInfo || chart.patientInfo,
      teeth: chartData.teethData,
      summary: chartData.summary || {
        total_teeth: 0,
        total_sites: 0,
        bop_site_count: 0,
        bop_percentage: 0,
        plaque_site_count: 0,
        plaque_percentage: 0,
      },
    }

    const rehydrated = mapPayloadToChart(chartPayload)

    chart.chartName = chartData.chartName || rehydrated.name || chart.chartName
    chart.teethData = rehydrated.teethData || chart.teethData

    if (chartData.patientInfo) {
      const pi = chartData.patientInfo
      chart.patientInfo = {
        hn: pi.hn || '',
        patientName: pi.patientName || '',
        age: pi.age ?? null,
        gender: pi.gender || '',
        nationality: pi.nationality || '',
        date: pi.date || new Date().toISOString().split('T')[0],
        doctor: pi.doctor || '',
        studentId: pi.studentId || '',
        visitPhase: pi.visitPhase || 'before_hygienic',
      }
    } else {
      chart.patientInfo = rehydrated.patientInfo || chart.patientInfo
    }

    chart.isDirty = false
  } catch (error) {
    console.error('Failed to load chart from backend:', error)
    throw error
  }
}

export async function loadChartPatientWorkflow(
  chart: ChartWorkflowState,
  id: string,
) {
  chart.currentPatientId = id
  const patient = await patientApi.getById(id)

  if (!patient) return

  const genderRaw = patient.gender || ''
  chart.patientInfo = {
    hn: patient.hn || '',
    doctor: chart.patientInfo.doctor,
    studentId: chart.patientInfo.studentId,
    patientName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
    age: patient.age ?? null,
    nationality: patient.nationality || '',
    gender: genderRaw ? genderRaw.charAt(0).toUpperCase() + genderRaw.slice(1) : '',
    date: patient.lastVisitDate ? patient.lastVisitDate.split('T')[0] : new Date().toISOString().split('T')[0],
    visitPhase: chart.patientInfo.visitPhase || 'before_hygienic',
  }
}
