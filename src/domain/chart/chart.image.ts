import { isUpperTooth } from './chart.rules'
import type { ToothData, Surface, ToothId } from './chart.types'

const TOOTH_IMAGE_TOP_OFFSETS: Record<`${number}-${Surface}`, number> = {
  '18-buccal': -2,
  '17-buccal': 0,
  '16-buccal': 4,
  '15-buccal': 5,
  '14-buccal': 4,
  '13-buccal': 4,
  '12-buccal': 5,
  '11-buccal': 14,
  '21-buccal': 12,
  '22-buccal': 6,
  '23-buccal': 3,
  '24-buccal': 0,
  '25-buccal': 5,
  '26-buccal': 4,
  '27-buccal': 0,
  '28-buccal': -2,
  '18-lingual': 23,
  '17-lingual': 24,
  '16-lingual': 22,
  '15-lingual': 17,
  '14-lingual': 17,
  '13-lingual': 16,
  '12-lingual': 18,
  '11-lingual': 12,
  '21-lingual': 11,
  '22-lingual': 17,
  '23-lingual': 15,
  '24-lingual': 16,
  '25-lingual': 16,
  '26-lingual': 21,
  '27-lingual': 24,
  '28-lingual': 23,
  '48-buccal': -4,
  '47-buccal': -4,
  '46-buccal': -1,
  '45-buccal': 3,
  '44-buccal': 4,
  '43-buccal': 7,
  '42-buccal': 3,
  '41-buccal': 1,
  '31-buccal': 1,
  '32-buccal': 3,
  '33-buccal': 7,
  '34-buccal': 3,
  '35-buccal': 1,
  '36-buccal': 0,
  '37-buccal': -4,
  '38-buccal': -3,
  '48-lingual': 24,
  '47-lingual': 22,
  '46-lingual': 23,
  '45-lingual': 20,
  '44-lingual': 13,
  '43-lingual': 12,
  '42-lingual': 15,
  '41-lingual': 19,
  '31-lingual': 19,
  '32-lingual': 15,
  '33-lingual': 12,
  '34-lingual': 13,
  '35-lingual': 20,
  '36-lingual': 23,
  '37-lingual': 21,
  '38-lingual': 21
}

const TOOTH_COLUMN_WIDTHS: Record<ToothId, number> = {
  18: 63,
  17: 63,
  16: 70,
  15: 48,
  14: 45,
  13: 45,
  12: 43,
  11: 56,
  21: 56,
  22: 42,
  23: 48,
  24: 45,
  25: 45,
  26: 70,
  27: 63,
  28: 63,
  48: 65,
  47: 65,
  46: 70,
  45: 45,
  44: 45,
  43: 45,
  42: 42,
  41: 45,
  31: 45,
  32: 42,
  33: 45,
  34: 43,
  35: 46,
  36: 70,
  37: 63,
  38: 70
}

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

export const getToothImageTopOffset = (id: ToothId, surface: Surface) => {
  return TOOTH_IMAGE_TOP_OFFSETS[`${id}-${surface}`] ?? 0
}

export const getToothColumnWidth = (id: ToothId) => {
  return TOOTH_COLUMN_WIDTHS[id] ?? 54
}
