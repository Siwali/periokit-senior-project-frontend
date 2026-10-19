import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { XrayUploadItem } from '@/domain/xray/xray.types'

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  toUploadFailure: vi.fn(),
  notifyError: vi.fn(),
}))

vi.mock('@/services/api/xray.api', () => ({
  xrayAssetApi: { upload: mocks.upload },
  toUploadFailure: mocks.toUploadFailure,
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: () => ({ error: mocks.notifyError }),
}))

import { useXrayUploadQueue } from '@/composables/useXrayUploadQueue'

function uploadedAsset(id: string, uploadId: string) {
  return {
    id,
    uploadId,
    fileName: 'film.png',
    mimeType: 'image/png',
    fileSize: 4,
    naturalWidth: 120,
    naturalHeight: 80,
    status: 'pending',
    signedUrl: '',
    urlExpiresAt: '',
  }
}

function createSubject() {
  let key: string | null = 'patient::visit'
  let canUpload = true
  let saving = false
  const landed: string[] = []
  const onLanded = vi.fn()
  const onReset = vi.fn()

  const queue = useXrayUploadQueue({
    visitId: () => 'visit-1',
    canUpload: () => canUpload,
    isSaving: () => saving,
    currentKey: () => key,
    land: async (item: XrayUploadItem) => {
      item.status = 'done'
      item.progress = 100
      landed.push(item.assetId ?? item.uploadId)
      return 'placed'
    },
    onLanded,
    onReset,
  })

  return {
    queue,
    landed,
    onLanded,
    onReset,
    setKey: (value: string | null) => {
      key = value
    },
    setCanUpload: (value: boolean) => {
      canUpload = value
    },
    setSaving: (value: boolean) => {
      saving = value
    },
  }
}

describe('useXrayUploadQueue', () => {
  beforeEach(() => {
    mocks.upload.mockReset()
    mocks.toUploadFailure.mockReset()
    mocks.notifyError.mockReset()
    mocks.toUploadFailure.mockReturnValue({
      title: 'Upload failed',
      detail: 'Try again',
      canRetry: true,
      needsSignIn: false,
      stopsBatch: false,
    })
  })

  it('uploads each accepted file and lands it once', async () => {
    mocks.upload.mockImplementation(
      async (_visitId: string, _files: File[], uploadIds: string[]) => ({
        uploaded: [uploadedAsset(`asset-${uploadIds[0]}`, uploadIds[0])],
        rejected: [],
      }),
    )
    const subject = createSubject()
    const files = [
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.png', { type: 'image/png' }),
    ]

    await subject.queue.add(files)

    expect(mocks.upload).toHaveBeenCalledTimes(2)
    expect(subject.queue.queue.value.map(item => item.status)).toEqual(['done', 'done'])
    expect(subject.landed).toHaveLength(2)
    expect(subject.onLanded).toHaveBeenCalledTimes(1)
  })

  it('keeps a rejected file in the report and continues the batch', async () => {
    mocks.upload
      .mockResolvedValueOnce({
        uploaded: [],
        rejected: [{ fileName: 'one.png', reason: 'upload_failed' }],
      })
      .mockImplementationOnce(
        async (_visitId: string, _files: File[], uploadIds: string[]) => ({
          uploaded: [uploadedAsset('asset-2', uploadIds[0])],
          rejected: [],
        }),
      )
    const subject = createSubject()

    await subject.queue.add([
      new File(['one'], 'one.png', { type: 'image/png' }),
      new File(['two'], 'two.png', { type: 'image/png' }),
    ])

    expect(subject.queue.queue.value[0].status).toBe('failed')
    expect(subject.queue.queue.value[0].canRetry).toBe(true)
    expect(subject.queue.queue.value[1].status).toBe('done')
    expect(subject.landed).toEqual(['asset-2'])
  })

  it('keeps draft files local when the visit does not exist yet', async () => {
    const subject = createSubject()
    subject.setCanUpload(false)

    await subject.queue.add([new File(['one'], 'one.png', { type: 'image/png' })])

    expect(mocks.upload).not.toHaveBeenCalled()
    expect(subject.queue.queue.value[0].status).toBe('done')
    expect(subject.landed).toHaveLength(1)
  })

  it('aborts an in-flight upload and clears its report on reset', async () => {
    let uploadStarted!: () => void
    const started = new Promise<void>(resolve => {
      uploadStarted = resolve
    })
    mocks.upload.mockImplementation(
      (
        _visitId: string,
        _files: File[],
        _uploadIds: string[],
        _progress: (percent: number) => void,
        signal: AbortSignal,
      ) =>
        new Promise((_resolve, reject) => {
          uploadStarted()
          signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
        }),
    )
    const subject = createSubject()

    const adding = subject.queue.add([new File(['one'], 'one.png', { type: 'image/png' })])
    await started
    subject.queue.reset()
    await adding

    expect(subject.queue.queue.value).toEqual([])
    expect(subject.landed).toEqual([])
    expect(subject.queue.isAdding.value).toBe(false)
  })
})
