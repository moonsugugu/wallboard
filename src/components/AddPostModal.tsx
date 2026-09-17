import { useState } from 'react'
import { compressImageToDataUrl } from '../lib/imageCompress'
import { POST_COLORS } from '../types'
import type { AttachmentType, PostColor } from '../types'

export type PostFormValue = {
  author: string
  text: string
  attachmentType: AttachmentType
  attachmentUrl?: string
  color: PostColor
  column: string | null
}

type Props = {
  columns: string[]
  defaultColumn: string | null
  defaultAuthor?: string
  initial?: PostFormValue
  onClose: () => void
  onSubmit: (post: PostFormValue) => void
}

const TABS: { type: AttachmentType; label: string }[] = [
  { type: 'none', label: '글만' },
  { type: 'image', label: '📷 이미지' },
  { type: 'link', label: '🔗 링크' },
  { type: 'video', label: '🎬 영상' },
]

export default function AddPostModal({ columns, defaultColumn, defaultAuthor, initial, onClose, onSubmit }: Props) {
  const [author, setAuthor] = useState(initial?.author ?? defaultAuthor ?? '')
  const [text, setText] = useState(initial?.text ?? '')
  const [color, setColor] = useState<PostColor>(initial?.color ?? POST_COLORS[0])
  const [column, setColumn] = useState<string | null>(initial?.column ?? defaultColumn)

  const [attachmentType, setAttachmentType] = useState<AttachmentType>(initial?.attachmentType ?? 'none')
  const [attachmentUrl, setAttachmentUrl] = useState(initial?.attachmentType !== 'image' ? (initial?.attachmentUrl ?? '') : '')
  const [imageDataUrl, setImageDataUrl] = useState(initial?.attachmentType === 'image' ? (initial?.attachmentUrl ?? '') : '')
  const [imageError, setImageError] = useState('')
  const [compressing, setCompressing] = useState(false)

  const resolvedAttachmentUrl = attachmentType === 'image' ? imageDataUrl : attachmentUrl.trim()
  const canSubmit = text.trim().length > 0 || resolvedAttachmentUrl.length > 0

  async function handleImageSelect(file: File) {
    setImageError('')
    setCompressing(true)
    try {
      const dataUrl = await compressImageToDataUrl(file)
      setImageDataUrl(dataUrl)
    } catch (e) {
      setImageError(e instanceof Error ? e.message : '이미지를 처리하지 못했어요.')
    } finally {
      setCompressing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">{initial ? '포스트잇 수정' : '포스트잇 추가'}</h2>

        <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">이름</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="예: 3번 김민수"
          className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          maxLength={30}
        />

        <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">내용</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mb-3 w-full resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          maxLength={2000}
        />

        <div className="mb-3 flex gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              type="button"
              onClick={() => setAttachmentType(tab.type)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium ${
                attachmentType === tab.type ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {attachmentType === 'image' && (
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageSelect(file)
              }}
              className="w-full text-sm"
            />
            {compressing && <p className="mt-1 text-xs text-[var(--color-sub)]">이미지 처리 중...</p>}
            {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}
            {imageDataUrl && !compressing && (
              <img src={imageDataUrl} alt="미리보기" className="mt-2 max-h-40 rounded-md object-contain" />
            )}
          </div>
        )}

        {attachmentType === 'link' && (
          <input
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="https://..."
            className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}

        {attachmentType === 'video' && (
          <input
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="유튜브 링크 또는 영상 URL"
            className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}

        {columns.length > 0 && (
          <>
            <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">섹션</label>
            <select
              value={column ?? columns[0]}
              onChange={(e) => setColumn(e.target.value)}
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="mb-4 flex gap-2">
          {POST_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full border-2"
              style={{ background: c, borderColor: color === c ? 'var(--color-accent)' : 'transparent' }}
              aria-label={`색상 ${c}`}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-[var(--color-sub)] hover:bg-black/5"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSubmit || compressing}
            onClick={() =>
              onSubmit({
                author: author.trim(),
                text: text.trim(),
                attachmentType: resolvedAttachmentUrl ? attachmentType : 'none',
                attachmentUrl: resolvedAttachmentUrl || undefined,
                color,
                column: columns.length > 0 ? (column ?? columns[0]) : null,
              })
            }
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {initial ? '수정하기' : '올리기'}
          </button>
        </div>
      </div>
    </div>
  )
}
