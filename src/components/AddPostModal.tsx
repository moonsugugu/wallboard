import { useState } from 'react'
import { POST_COLORS } from '../types'
import type { PostColor } from '../types'

type Props = {
  columns: string[]
  defaultColumn: string | null
  onClose: () => void
  onSubmit: (post: { author: string; text: string; imageUrl?: string; color: PostColor; column: string | null }) => void
}

export default function AddPostModal({ columns, defaultColumn, onClose, onSubmit }: Props) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [color, setColor] = useState<PostColor>(POST_COLORS[0])
  const [column, setColumn] = useState<string | null>(defaultColumn)

  const canSubmit = text.trim().length > 0 || imageUrl.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">포스트잇 추가</h2>

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

        <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">이미지 URL (선택)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />

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
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                author: author.trim(),
                text: text.trim(),
                imageUrl: imageUrl.trim() || undefined,
                color,
                column: columns.length > 0 ? (column ?? columns[0]) : null,
              })
            }
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            올리기
          </button>
        </div>
      </div>
    </div>
  )
}
