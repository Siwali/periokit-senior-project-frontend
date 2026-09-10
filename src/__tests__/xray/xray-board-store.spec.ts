import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
  notifyWarning: vi.fn(),
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({
    error: mocks.notifyError,
    success: mocks.notifySuccess,
    warning: mocks.notifyWarning,
  }),
}))

vi.mock('@/services/api/xray.api', () => ({
  xrayApi: {
    getByVisit: vi.fn(),
    refreshUrls: vi.fn(),
    save: vi.fn(),
  },
  xrayAssetApi: { upload: vi.fn() },
  toBoardFailure: vi.fn(() => ({ title: 'Save failed', detail: '' })),
  toUploadFailure: vi.fn(() => ({
    title: 'Upload failed',
    detail: '',
    canRetry: true,
    needsSignIn: false,
    stopsBatch: false,
  })),
}))

import { useXrayBoardStore } from '@/stores/xray-board'

describe('X-ray board store interface', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('owns note editing through intent-based actions', async () => {
    const board = useXrayBoardStore()
    await board.loadBoard('patient::new', null)
    const note = board.addNote(100, 100)

    expect(board.finishNoteEditing()).toBe(true)
    expect(board.editingNoteId).toBeNull()
    expect(board.startNoteEditing(note.id)).toBe(true)
    expect(board.selectedId).toBe(note.id)
    expect(board.editingNoteId).toBe(note.id)
  })

  it('updates a complete geometry frame and rejects invalid values atomically', async () => {
    const board = useXrayBoardStore()
    await board.loadBoard('patient::new', null)
    const note = board.addNote(100, 100)
    const original = { posX: note.posX, posY: note.posY, rotation: note.rotation }

    expect(board.updateObjectGeometry(note.id, { posX: 20, posY: 30, rotation: 45 })).toBe(true)
    expect(note).toMatchObject({ posX: 20, posY: 30, rotation: 45 })

    expect(board.updateObjectGeometry(note.id, { posX: 90, rotation: Number.NaN })).toBe(false)
    expect(note).toMatchObject({ posX: 20, posY: 30, rotation: 45 })
    expect(original).not.toEqual({ posX: note.posX, posY: note.posY, rotation: note.rotation })
  })

  it('does not expose lifecycle details that have no external consumer', () => {
    const board = useXrayBoardStore()

    expect('boardKey' in board).toBe(false)
    expect('visitId' in board).toBe(false)
    expect('loadState' in board).toBe(false)
    expect('stageSize' in board).toBe(false)
    expect('selectedObject' in board).toBe(false)
  })
})
