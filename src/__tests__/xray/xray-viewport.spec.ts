import { describe, expect, it } from 'vitest'
import { useXrayViewport } from '@/composables/useXrayViewport'

describe('useXrayViewport', () => {
  it('defers fit until the stage has a size', () => {
    const viewport = useXrayViewport(() => ({ minX: 0, minY: 0, maxX: 100, maxY: 50 }))

    viewport.fit()
    viewport.setStageSize(200, 100)

    expect(viewport.viewport.value).toEqual({ x: 80, y: 40, scale: 0.4 })
  })

  it('keeps the world point under the cursor while zooming', () => {
    const viewport = useXrayViewport(() => null)
    viewport.setViewport({ x: 10, y: 20, scale: 1 })

    const before = viewport.toWorld(60, 70)
    viewport.zoomAt(60, 70, 2)

    expect(viewport.toWorld(60, 70)).toEqual(before)
    expect(viewport.viewport.value.scale).toBe(2)
  })

  it('centres an empty board in the stage', () => {
    const viewport = useXrayViewport(() => null)

    viewport.setStageSize(800, 600)
    viewport.fit()

    expect(viewport.viewport.value).toEqual({ x: 400, y: 300, scale: 1 })
  })
})
