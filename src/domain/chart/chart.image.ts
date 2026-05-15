import { isUpperTooth } from './chart.rules'
import type { ToothData, Surface } from './chart.types'

export const getFurImage = (grade: number) => {
  if (grade === 1) return '/images/teeth/vacio.png'
  if (grade === 2) return '/images/teeth/mediolleno.png'
  if (grade === 3) return '/images/teeth/lleno.png'
  return ''
}

export const getToothImage = (id: number | string, surface: Surface, data?: ToothData) => {
  const arch = isUpperTooth(id) ? 'arriba' : 'abajo'
  const suffix = surface === 'lingual' ? 'b' : ''

  let state = ''
  if (data?.extracted) state = 'tachados-'
  else if (data?.implant) state = 'tornillo-'

  return `/images/teeth/periodontograma-dientes-${arch}-${state}${id}${suffix}.png`
}
