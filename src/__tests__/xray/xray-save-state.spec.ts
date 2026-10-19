import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useXraySaveState } from '@/composables/useXraySaveState'

describe('useXraySaveState', () => {
  it('keeps an unreadable board locked and treats a populated draft as dirty', () => {
    const readable = ref(false)
    const objects = ref<{ id: string }[]>([])
    const state = useXraySaveState({
      take: () => JSON.stringify({ objects: objects.value }),
      fingerprint: () => JSON.stringify(objects.value),
      isEmpty: () => objects.value.length === 0,
      isReadable: () => readable.value,
    })

    expect(state.editable.value).toBe(false)
    expect(state.isDirty.value).toBe(false)

    readable.value = true
    objects.value = [{ id: 'film-1' }]

    expect(state.editable.value).toBe(true)
    expect(state.isDirty.value).toBe(true)
  })

  it('tracks the saved fingerprint and the objects belonging to it', () => {
    const objects = ref([{ id: 'film-1' }])
    const state = useXraySaveState({
      take: () => JSON.stringify({ objects: objects.value }),
      fingerprint: () => JSON.stringify(objects.value),
      isEmpty: () => objects.value.length === 0,
      isReadable: () => true,
    })

    state.markSaved()
    state.saved.value = true

    expect(state.isDirty.value).toBe(false)
    expect(state.wasSaved('film-1')).toBe(true)
    expect(state.editable.value).toBe(false)

    state.editMode.value = true
    objects.value = [...objects.value, { id: 'film-2' }]

    expect(state.editable.value).toBe(true)
    expect(state.isDirty.value).toBe(true)
    expect(state.wasSaved('film-2')).toBe(false)
  })

  it('clears the complete save lifecycle', () => {
    const objects = ref([{ id: 'film-1' }])
    const state = useXraySaveState({
      take: () => JSON.stringify({ objects: objects.value }),
      fingerprint: () => JSON.stringify(objects.value),
      isEmpty: () => false,
      isReadable: () => true,
    })

    state.markSaved()
    state.saved.value = true
    state.savedAt.value = new Date('2026-01-01T00:00:00Z')
    state.editMode.value = true
    state.clear()

    expect(state.saved.value).toBe(false)
    expect(state.savedAt.value).toBeNull()
    expect(state.savedSnapshot.value).toBeNull()
    expect(state.editMode.value).toBe(false)
    expect(state.isDirty.value).toBe(true)
  })
})
