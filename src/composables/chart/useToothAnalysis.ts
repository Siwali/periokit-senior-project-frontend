import { computed, type Ref } from 'vue'
import {
  calculatePrognosisKC,
  calculatePrognosisMN,
  getSafePDValues,
  getSafeCALValues,
  calculateToothBopPercentage,
  calculateToothPiPercentage,
} from '@/utils/calculations'
import { isUpperTooth } from '@/domain/chart/chart.rules'
import type { ToothData, ToothId } from '@/domain/chart/chart.types'

export function useToothAnalysis(options: {
  toothId: Ref<ToothId | null>
  toothData: Ref<ToothData | null>
}) {
  const { toothId, toothData } = options

  const innerSurfaceLabel = computed(() => {
    if (!toothId.value) return 'Palatal'
    return isUpperTooth(toothId.value) ? 'Palatal' : 'Lingual'
  })

  const analysisData = computed(() => {
    if (!toothData.value) return null

    const allFur = [
      ...(toothData.value.fur?.buccal || []),
      ...(toothData.value.fur?.lingual || []),
    ].map(v => Number(v) || 0)

    const maxFur = allFur.length > 0 ? Math.max(0, ...allFur) : 0

    return {
      prognosisKC: calculatePrognosisKC(toothData.value),
      prognosisMN: calculatePrognosisMN(toothData.value),
      buccalKTW: toothData.value.buccal?.ktw || '0',
      innerSurfaceKTW: toothData.value.lingual?.ktw || '0',
      mobility: toothData.value.mo || '0',
      furcation: maxFur,
      buccalPD: getSafePDValues(toothData.value.buccal?.pd),
      innerSurfacePD: getSafePDValues(toothData.value.lingual?.pd),
      buccalCAL: getSafeCALValues(toothData.value.buccal?.cal),
      innerSurfaceCAL: getSafeCALValues(toothData.value.lingual?.cal),
      bopPercentage: calculateToothBopPercentage(toothData.value),
      piPercentage: calculateToothPiPercentage(toothData.value),
    }
  })

  return {
    innerSurfaceLabel,
    analysisData,
  }
}
