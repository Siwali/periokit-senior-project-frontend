import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getByVisit: vi.fn(),
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
    getByVisit: mocks.getByVisit,
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
    mocks.getByVisit.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  it('represents load and retry as one consistent lifecycle', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.getByVisit.mockRejectedValueOnce(new Error('offline'))
    const board = useXrayBoardStore()

    await board.loadBoard('patient::visit-1', 'visit-1')

    expect(board.isLoading).toBe(false)
    expect(board.loadFailed).toBe(true)
    expect(board.isRetrying).toBe(false)
    expect(board.retryFailed).toBe(false)
    expect(board.editable).toBe(false)

    let rejectRetry!: (reason: Error) => void
    mocks.getByVisit.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectRetry = reject
        }),
    )
    const retry = board.retryLoad()

    expect(board.isLoading).toBe(true)
    expect(board.loadFailed).toBe(false)
    expect(board.isRetrying).toBe(true)
    expect(board.retryFailed).toBe(false)

    rejectRetry(new Error('still offline'))
    await retry

    expect(board.isLoading).toBe(false)
    expect(board.loadFailed).toBe(true)
    expect(board.isRetrying).toBe(false)
    expect(board.retryFailed).toBe(true)

    mocks.getByVisit.mockResolvedValueOnce({ data: { xrayBoardByVisit: null } })
    await board.retryLoad()

    expect(board.isLoading).toBe(false)
    expect(board.loadFailed).toBe(false)
    expect(board.isRetrying).toBe(false)
    expect(board.retryFailed).toBe(false)
    expect(board.editable).toBe(true)
  })
})
