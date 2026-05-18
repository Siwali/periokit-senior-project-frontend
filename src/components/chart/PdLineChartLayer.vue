<script setup lang="ts">
import { computed } from 'vue'
import { getToothColumnWidth } from '@/domain/chart/chart.image'
import type { ChartData, Surface } from '@/domain/chart/chart.types'

const props = defineProps<{
  arch: number[][]
  chartData: ChartData
  surface: Surface
  groupGapClass: string
  baselineY?: number
}>()

const toNumber = (value: string) => Number.parseInt(value, 10) || 0

interface BaselinePoint {
  x: number
  y: number
}

// Get gap width in pixels based on Tailwind class
const getGapWidth = (gapClass: string): number => {
  if (gapClass === 'w-4') return 16
  if (gapClass === 'w-6') return 24
  return 16
}

// Calculate baseline points based on REC values
const baselinePoints = computed(() => {
  const points: BaselinePoint[] = []
  let currentX = 0
  const gapWidth = getGapWidth(props.groupGapClass)
  const defaultY = props.baselineY ?? 60

  for (let gIdx = 0; gIdx < props.arch.length; gIdx++) {
    const group = props.arch[gIdx]

    for (const toothId of group) {
      const tooth = props.chartData[toothId]
      if (!tooth || tooth.extracted) {
        currentX += getToothColumnWidth(toothId)
        continue
      }

      const toothCenter = currentX + getToothColumnWidth(toothId) / 2
      const siteXOffsets = [-12, 0, 12]

      for (const site of [0, 1, 2] as const) {
        const recValue = toNumber(tooth[props.surface].rec[site])
        // Y position: baseline adjusted by recession (higher REC = lower Y)
        const y = defaultY + (recValue * 6)

        points.push({
          x: toothCenter + siteXOffsets[site],
          y
        })
      }

      currentX += getToothColumnWidth(toothId)
    }

    if (gIdx < props.arch.length - 1) {
      currentX += gapWidth
    }
  }

  return points
})

// Generate polyline points string
const baselinePolylinePoints = computed(() => {
  return baselinePoints.value
    .map(p => `${p.x},${p.y}`)
    .join(' ')
})

// GM Points (Gingival Margin) - สำหรับสร้างเส้นสีเขียว
// y = cejY - (recValue * 6)
// REC + (เหงือกร่น) → GM อยู่ใต้ CEJ, REC - (เหงือกบวม) → GM อยู่เหนือ CEJ
const gmPoints = computed(() => {
  const points: BaselinePoint[] = []
  let currentX = 0
  const gapWidth = getGapWidth(props.groupGapClass)
  const cejY = props.baselineY ?? 60

  for (let gIdx = 0; gIdx < props.arch.length; gIdx++) {
    const group = props.arch[gIdx]
    for (const toothId of group) {
      const tooth = props.chartData[toothId]
      if (!tooth || tooth.extracted) {
        currentX += getToothColumnWidth(toothId)
        continue
      }
      const toothCenter = currentX + getToothColumnWidth(toothId) / 2
      const siteXOffsets = [-12, 0, 12]
      for (const site of [0, 1, 2] as const) {
        const recValue = toNumber(tooth[props.surface].rec[site])
        const y = cejY - (recValue * 6)
        points.push({ x: toothCenter + siteXOffsets[site], y })
      }
      currentX += getToothColumnWidth(toothId)
    }
    if (gIdx < props.arch.length - 1) {
      currentX += gapWidth
    }
  }
  return points
})

// CAL Points (Clinical Attachment Level) - สำหรับสร้างเส้นสีน้ำเงิน (ระดับกระดูก)
// y = cejY + (calValue * 6)
// CAL = PD + REC, เป็นระยะลงมาจาก CEJ
const calPoints = computed(() => {
  const points: BaselinePoint[] = []
  let currentX = 0
  const gapWidth = getGapWidth(props.groupGapClass)
  const cejY = props.baselineY ?? 60

  for (let gIdx = 0; gIdx < props.arch.length; gIdx++) {
    const group = props.arch[gIdx]
    for (const toothId of group) {
      const tooth = props.chartData[toothId]
      if (!tooth || tooth.extracted) {
        currentX += getToothColumnWidth(toothId)
        continue
      }
      const toothCenter = currentX + getToothColumnWidth(toothId) / 2
      const siteXOffsets = [-12, 0, 12]
      for (const site of [0, 1, 2] as const) {
        const calValue = toNumber(tooth[props.surface].cal[site])
        const y = cejY + (calValue * 6)
        points.push({ x: toothCenter + siteXOffsets[site], y })
      }
      currentX += getToothColumnWidth(toothId)
    }
    if (gIdx < props.arch.length - 1) {
      currentX += gapWidth
    }
  }
  return points
})

// Generate polyline strings for GM and CAL
const gmPolylinePoints = computed(() => gmPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const calPolylinePoints = computed(() => calPoints.value.map(p => `${p.x},${p.y}`).join(' '))

// Calculate total width for SVG viewBox
const svgWidth = computed(() => {
  let width = 0
  const gapWidth = getGapWidth(props.groupGapClass)

  for (let gIdx = 0; gIdx < props.arch.length; gIdx++) {
    const group = props.arch[gIdx]
    for (const toothId of group) {
      width += getToothColumnWidth(toothId)
    }
    if (gIdx < props.arch.length - 1) {
      width += gapWidth
    }
  }
  return width
})
</script>

<template>
  <div class="pd-line-chart-layer absolute inset-0 pointer-events-none z-20">
    <svg
      :viewBox="`0 0 ${svgWidth} 150`"
      class="w-full h-full"
      preserveAspectRatio="xMidYMin meet"
    >
      <!-- CAL Line (Bone Level) - สีน้ำเงิน - ระดับกระดูก -->
      <polyline
        v-if="calPoints.length > 1"
        :points="calPolylinePoints"
        fill="none"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- GM Line (Gingival Margin) - สีเขียว - ขอบเหงือก -->
      <polyline
        v-if="gmPoints.length > 1"
        :points="gmPolylinePoints"
        fill="none"
        stroke="#22c55e"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- CEJ Baseline - สีแดง - เส้นอ้างอิง -->
      <polyline
        v-if="baselinePoints.length > 1"
        :points="baselinePolylinePoints"
        fill="none"
        stroke="#ef4444"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.pd-line-chart-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}
</style>
