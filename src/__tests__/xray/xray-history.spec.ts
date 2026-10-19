import { describe, expect, it } from 'vitest'
import { useXrayHistory } from '@/composables/useXrayHistory'

describe('useXrayHistory', () => {
  it('steps backward and forward through snapshots', () => {
    let current = 'initial'
    const history = useXrayHistory(
      () => current,
      snapshot => {
        current = snapshot
      },
    )

    history.reset()
    current = 'first edit'
    history.push()
    current = 'second edit'
    history.push()

    history.undo()
    expect(current).toBe('first edit')
    history.undo()
    expect(current).toBe('initial')
    expect(history.canUndo.value).toBe(false)

    history.redo()
    expect(current).toBe('first edit')
    expect(history.canRedo.value).toBe(true)
  })

  it('drops the redo branch after a new edit', () => {
    let current = 'initial'
    const history = useXrayHistory(
      () => current,
      snapshot => {
        current = snapshot
      },
    )

    history.reset()
    current = 'first edit'
    history.push()
    current = 'second edit'
    history.push()
    history.undo()

    current = 'replacement edit'
    history.push()

    expect(history.canRedo.value).toBe(false)
    history.undo()
    expect(current).toBe('first edit')
  })

  it('keeps only the configured history window', () => {
    let current = '0'
    const history = useXrayHistory(
      () => current,
      snapshot => {
        current = snapshot
      },
    )

    history.reset()
    for (let index = 1; index <= 35; index += 1) {
      current = String(index)
      history.push()
    }
    for (let index = 0; index < 40; index += 1) history.undo()

    expect(current).toBe('5')
    expect(history.canUndo.value).toBe(false)
  })
})
