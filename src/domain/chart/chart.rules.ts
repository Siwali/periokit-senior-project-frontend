import type { Surface } from './chart.types'

export const isUpperTooth = (id: number | string) => {
  const idNum = Number(id)
  return (idNum >= 11 && idNum <= 18) || (idNum >= 21 && idNum <= 28)
}

export const getFurcationSites = (id: number | string): Record<Surface, number> => {
  const idNum = Number(id)

  if ([18, 17, 16, 26, 27, 28].includes(idNum)) return { buccal: 1, lingual: 2 }
  if ([14, 24].includes(idNum)) return { buccal: 0, lingual: 2 }
  if ([48, 47, 46, 38, 37, 36].includes(idNum)) return { buccal: 1, lingual: 1 }

  return { buccal: 0, lingual: 0 }
}
