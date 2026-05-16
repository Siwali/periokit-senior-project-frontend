import type { ChartData, ChartSummary, PdCategories, Surface } from './chart.types'

const toNumber = (value: string) => Number.parseInt(value, 10) || 0

export const calculateCal = (pd: string, rec: string) => String(toNumber(pd) + toNumber(rec))

const getActiveTeeth = (chartData: ChartData) => Object.values(chartData).filter(tooth => !tooth.extracted)

const countSites = (chartData: ChartData, key: 'bop' | 'pi') => {
  const activeTeeth = getActiveTeeth(chartData)
  const totalSites = activeTeeth.length * 6
  const markedSites = activeTeeth.reduce((sum, tooth) => {
    return sum + tooth.buccal[key].filter(Boolean).length + tooth.lingual[key].filter(Boolean).length
  }, 0)

  return { markedSites, totalSites }
}

const calculatePercentage = (markedSites: number, totalSites: number) => {
  if (totalSites === 0) return 0
  return Math.round((markedSites / totalSites) * 100)
}

export const calculateBopPercentage = (chartData: ChartData) => {
  const { markedSites, totalSites } = countSites(chartData, 'bop')
  return calculatePercentage(markedSites, totalSites)
}

export const calculatePiPercentage = (chartData: ChartData) => {
  const { markedSites, totalSites } = countSites(chartData, 'pi')
  return calculatePercentage(markedSites, totalSites)
}

export const calculatePdCategories = (chartData: ChartData): PdCategories => {
  const categories = { healthy: 0, warning: 0, deep: 0 }
  const surfaces: Surface[] = ['buccal', 'lingual']

  getActiveTeeth(chartData).forEach(tooth => {
    surfaces.forEach(surface => {
      tooth[surface].pd.forEach(value => {
        const pd = toNumber(value)
        if (pd <= 0) return
        if (pd <= 3) categories.healthy += 1
        else if (pd <= 5) categories.warning += 1
        else categories.deep += 1
      })
    })
  })

  return categories
}

export const calculateChartSummary = (chartData: ChartData): ChartSummary => ({
  totalTeeth: Object.keys(chartData).length,
  missingTeeth: Object.values(chartData).filter(tooth => tooth.extracted).length,
  implantTeeth: Object.values(chartData).filter(tooth => tooth.implant).length,
  bopPercentage: calculateBopPercentage(chartData),
  piPercentage: calculatePiPercentage(chartData),
  pdCategories: calculatePdCategories(chartData)
})
