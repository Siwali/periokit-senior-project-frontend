import { describe, expect, it } from 'vitest'
import { calculateContainScale, calculateFitScale } from './fit-scale'

describe('calculateFitScale', () => {
  it('keeps a safe inset when content must be scaled to its container', () => {
    const scale = calculateFitScale(730, 1120, 0.65, 2)
    expect(scale).toBe(0.65)
    expect(1120 * scale).toBeLessThanOrEqual(728)
  })

  it('shrinks below the preferred export scale on narrower pages', () => {
    const scale = calculateFitScale(700, 1120, 0.65, 2)
    expect(scale).toBeCloseTo(698 / 1120)
    expect(1120 * scale).toBeLessThanOrEqual(698)
  })

  it('uses the smaller axis so tall content remains inside the page', () => {
    const scale = calculateContainScale(1058, 710, 1120, 1800, 0.65, 2)
    expect(scale).toBeCloseTo(708 / 1800)
    expect(1120 * scale).toBeLessThanOrEqual(1056)
    expect(1800 * scale).toBeLessThanOrEqual(708)
  })
})
