import { ALL_TEETH } from './chart.constants'
import { getFurcationSites } from './chart.rules'
import type { ChartData, ToothData } from './chart.types'

const createSurfaceData = () => ({
  bop: [false, false, false],
  pi: [false, false, false],
  rec: ['', '', ''],
  pd: ['', '', ''],
  cal: ['', '', '']
})

const createToothData = (id: number): ToothData => {
  const furConfig = getFurcationSites(id)

  return {
    implant: false,
    mo: '',
    ktw: '',
    fur: {
      buccal: new Array(furConfig.buccal).fill(0),
      lingual: new Array(furConfig.lingual).fill(0)
    },
    extracted: false,
    prognosisKC: '',
    prognosisMN: '',
    buccal: createSurfaceData(),
    lingual: createSurfaceData(),
    note: ''
  }
}

export const createInitialChartData = (): ChartData => {
  return ALL_TEETH.reduce<ChartData>((chartData, id) => {
    chartData[id] = createToothData(id)
    return chartData
  }, {})
}
