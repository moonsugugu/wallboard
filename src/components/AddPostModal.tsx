import { useRef, useState } from 'react'
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
  const [imageName, setImageName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resolvedAttachmentUrl = attachmentType === 'image' ? imageDataUrl : attachmentUrl.trim()
  const canSubmit = text.trim().length > 0 || resolvedAttachmentUrl.length > 0

  async function handleImageSelect(file: File) {
    setImageError('')
    setImageName(file.name)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a25]/35 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_2px_8px_rgba(74,62,48,0.08),0_40px_80px_-30px_rgba(74,62,48,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-display text-[23px] leading-none text-[var(--color-ink)]">{initial ? '포스트잇 수정' : '포스트잇 추가'}</h2>

        <label className="eyebrow mb-2 block">이름</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="예: 3번 김민수"
          className="mb-3 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
          maxLength={30}
        />

        <label className="eyebrow mb-2 block">내용</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mb-3 w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
          maxLength={2000}
        />

        <div className="mb-3 flex gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              type="button"
              onClick={() => setAttachmentType(tab.type)}
              className={`flex-1 rounded-full border px-2 py-1.5 text-xs font-medium transition active:scale-95 ${
                attachmentType === tab.type
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-sub)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {attachmentType === 'image' && (
          <div className="mb-4">
            {/* 브라우저 기본 파일 입력은 생김새를 바꿀 수 없어서 숨기고 버튼으로 대신 연다 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageSelect(file)
                e.target.value = '' // 같은 파일을 다시 고를 수 있게 비운다
              }}
            />

            {!imageDataUrl && !compressing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-7 transition active:scale-[0.98] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/40"
              >
                <span className="text-2xl opacity-70">🖼️</span>
                <span className="text-sm font-semibold text-[var(--color-ink)]">이미지 고르기</span>
                <span className="text-[11px] text-[var(--color-sub)]">JPG · PNG · WEBP · 움직이는 GIF</span>
              </button>
            )}

            {compressing && (
              <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-7 text-sm text-[var(--color-sub)]">
                이미지 처리 중…
              </div>
            )}

            {imageDataUrl && !compressing && (
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                <img src={imageDataUrl} alt="미리보기" className="block max-h-44 w-full bg-[var(--color-surface-2)] object-contain" />
                <div className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--color-sub)]">{imageName || '선택한 이미지'}</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--color-sub)] transition active:scale-90 hover:text-[var(--color-accent)]"
                  >
                    바꾸기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageDataUrl('')
                      setImageName('')
                      setImageError('')
                    }}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--color-sub)] transition active:scale-90 hover:text-[var(--color-accent)]"
                  >
                    빼기
                  </button>
                </div>
              </div>
            )}

            {imageError && <p className="mt-2 text-xs text-[var(--color-accent)]">{imageError}</p>}
          </div>
        )}

        {attachmentType === 'link' && (
          <input
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="https://..."
            className="mb-3 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
          />
        )}

        {attachmentType === 'video' && (
          <input
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="유튜브 링크 또는 영상 URL"
            className="mb-3 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
          />
        )}

        {columns.length > 0 && (
          <>
            <label className="eyebrow mb-2 block">섹션</label>
            <select
              value={column ?? columns[0]}
              onChange={(e) => setColumn(e.target.value)}
              className="mb-3 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </>
        )}

        <p className="eyebrow mb-2">Color</p>
        <div className="mb-5 flex gap-2.5">
          {POST_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full border border-[#2f2a25]/10 transition active:scale-90"
              style={{
                background: c,
                boxShadow: color === c ? '0 0 0 2px var(--color-surface), 0 0 0 3.5px var(--color-accent)' : 'none',
              }}
              aria-label={`색상 ${c}`}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline border-transparent text-[var(--color-sub)]">
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
            className="btn-fill"
          >
            {initial ? '수정하기' : '올리기'}
          </button>
        </div>
      </div>
    </div>
  )
}
