import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyedDrafts } from '@/composables/useKeyedDrafts'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

interface Draft {
  count: number
  nested: { note: string }
}

const createDraft = (): Draft => ({ count: 0, nested: { note: '' } })

function createSubject() {
  return useKeyedDrafts<Draft>({
    create: createDraft,
    storageKey: 'drafts',
    snapshotsKey: 'snapshots',
    versionKey: 'version',
    version: '1',
    legacyKeys: ['legacy'],
  })
}

describe('useKeyedDrafts', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('window', { localStorage: storage })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('persists each key independently and restores it when reopened', async () => {
    const drafts = createSubject()
    drafts.openFor('visit:1')
    drafts.inputs.count = 2
    drafts.inputs.nested.note = 'first visit'
    await nextTick()

    drafts.openFor('visit:2')
    expect(drafts.inputs).toEqual(createDraft())

    drafts.inputs.count = 7
    await nextTick()
    drafts.openFor('visit:1')

    expect(drafts.inputs.count).toBe(2)
    expect(drafts.inputs.nested.note).toBe('first visit')
  })

  it('restores a persisted draft in a new instance', async () => {
    const first = createSubject()
    first.openFor('visit:1')
    first.inputs.count = 5
    first.inputs.nested.note = 'survives reload'
    await nextTick()

    const restored = createSubject()
    restored.openFor('visit:1')

    expect(restored.inputs).toEqual({ count: 5, nested: { note: 'survives reload' } })
  })

  it('commits, detects edits, and reverts to the saved snapshot', async () => {
    const drafts = createSubject()
    drafts.openFor('visit:1')
    drafts.inputs.count = 2
    await nextTick()
    drafts.commitSaved()

    expect(drafts.isDirty.value).toBe(false)

    drafts.inputs.count = 3
    await nextTick()
    expect(drafts.isDirty.value).toBe(true)

    drafts.revertToSaved()
    expect(drafts.inputs.count).toBe(2)
    expect(drafts.isDirty.value).toBe(false)
  })

  it('restores a saved snapshot in a new instance', async () => {
    const first = createSubject()
    first.openFor('visit:1')
    first.inputs.count = 2
    await nextTick()
    first.commitSaved()
    first.inputs.count = 8
    await nextTick()

    const restored = createSubject()
    restored.openFor('visit:1')
    expect(restored.inputs.count).toBe(8)
    expect(restored.isDirty.value).toBe(true)

    restored.revertToSaved()
    expect(restored.inputs.count).toBe(2)
    expect(restored.isDirty.value).toBe(false)
  })

  it('moves both the draft and saved snapshot to a newly created visit key', async () => {
    const drafts = createSubject()
    drafts.openFor('draft:patient-1')
    drafts.inputs.count = 4
    await nextTick()
    drafts.commitSaved()

    drafts.rekey('draft:patient-1', 'visit:99')

    expect(drafts.currentKey.value).toBe('visit:99')
    expect(drafts.records.value['draft:patient-1']).toBeUndefined()
    expect(drafts.records.value['visit:99']?.count).toBe(4)
    expect(drafts.savedSnapshots.value['draft:patient-1']).toBeUndefined()
    expect(drafts.savedSnapshots.value['visit:99']).toBeDefined()
  })

  it('discards incompatible persisted data when the version changes', () => {
    storage.setItem('version', 'old')
    storage.setItem('drafts', JSON.stringify({ stale: { count: 9 } }))
    storage.setItem('snapshots', JSON.stringify({ stale: '{}' }))
    storage.setItem('legacy', JSON.stringify({ stale: true }))

    const drafts = createSubject()

    expect(drafts.records.value).toEqual({})
    expect(drafts.savedSnapshots.value).toEqual({})
    expect(storage.getItem('version')).toBe('1')
    expect(storage.getItem('legacy')).toBeNull()
  })

  it('clears current and legacy draft storage on sign-out', async () => {
    const drafts = createSubject()
    drafts.openFor('visit:1')
    drafts.inputs.count = 3
    await nextTick()
    drafts.commitSaved()
    storage.setItem('legacy', JSON.stringify({ stale: true }))

    drafts.clearAll()

    expect(drafts.records.value).toEqual({})
    expect(drafts.savedSnapshots.value).toEqual({})
    expect(drafts.currentKey.value).toBeNull()
    expect(drafts.inputs).toEqual(createDraft())
    expect(storage.getItem('drafts')).toBeNull()
    expect(storage.getItem('snapshots')).toBeNull()
    expect(storage.getItem('legacy')).toBeNull()
  })
})
