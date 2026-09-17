import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { BOARD_BACKGROUNDS } from '../types'
import type { Board, BoardBackgroundKey } from '../types'

type Props = {
  board: Board
  shareUrl: string
  onClose: () => void
  onSave: (patch: { title: string; backgroundKey?: BoardBackgroundKey; backgroundImageUrl?: string }) => void
}

export default function BoardSettingsModal({ board, shareUrl, onClose, onSave }: Props) {
  const [title, setTitle] = useState(board.title)
  const [backgroundKey, setBackgroundKey] = useState<BoardBackgroundKey>(board.backgroundKey ?? 'default')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(board.backgroundImageUrl ?? '')
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">담벼락 설정</h2>

        <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />

        <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">배경</label>
        <div className="mb-2 grid grid-cols-5 gap-2">
          {BOARD_BACKGROUNDS.map((bg) => (
            <button
              key={bg.key}
              type="button"
              onClick={() => setBackgroundKey(bg.key)}
              title={bg.label}
              className="h-9 rounded-md border-2"
              style={{
                background: bg.css || 'repeating-linear-gradient(45deg,#ddd,#ddd 4px,#fff 4px,#fff 8px)',
                borderColor: backgroundKey === bg.key ? 'var(--color-accent)' : 'transparent',
              }}
            />
          ))}
        </div>
        <input
          value={backgroundImageUrl}
          onChange={(e) => setBackgroundImageUrl(e.target.value)}
          placeholder="배경 이미지 URL (선택)"
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />

        <label className="mb-1 block text-sm font-medium text-[var(--color-sub)]">공유</label>
        <div className="mb-2 flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-xs outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold"
          >
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
        <div className="mb-4 flex justify-center rounded-lg bg-white p-3">
          <QRCodeSVG value={shareUrl} size={140} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-[var(--color-sub)] hover:bg-black/5">
            취소
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                title: title.trim() || board.title,
                backgroundKey,
                backgroundImageUrl: backgroundImageUrl.trim() || undefined,
              })
            }
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
