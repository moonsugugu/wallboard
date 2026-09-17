import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { BOARD_BACKGROUNDS, BOARD_BACKGROUND_IMAGES } from '../types'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a25]/35 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_2px_8px_rgba(74,62,48,0.08),0_40px_80px_-30px_rgba(74,62,48,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-display text-[23px] leading-none text-[var(--color-ink)]">담벼락 설정</h2>

        <label className="eyebrow mb-2 block">제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
        />

        <label className="eyebrow mb-2 block">배경 그림</label>
        <div className="mb-4 grid grid-cols-4 gap-2">
          {BOARD_BACKGROUND_IMAGES.map((bg) => (
            <button
              key={bg.key}
              type="button"
              onClick={() => setBackgroundImageUrl(bg.url)}
              title={bg.label}
              className="overflow-hidden rounded-2xl border border-[#2f2a25]/8 transition active:scale-95"
              style={{
                boxShadow:
                  backgroundImageUrl === bg.url ? '0 0 0 2px var(--color-surface), 0 0 0 3.5px var(--color-accent)' : 'none',
              }}
            >
              <img src={bg.url} alt={bg.label} className="block h-12 w-full object-cover" />
              <span className="block bg-[var(--color-surface-2)] py-1 text-[10px] text-[var(--color-sub)]">{bg.label}</span>
            </button>
          ))}
        </div>

        <label className="eyebrow mb-2 block">단색 배경</label>
        <div className="mb-3 grid grid-cols-5 gap-2">
          {BOARD_BACKGROUNDS.map((bg) => (
            <button
              key={bg.key}
              type="button"
              onClick={() => {
                setBackgroundKey(bg.key)
                // 그림이 색보다 우선이라, 그림을 비우지 않으면 색을 눌러도 아무 일이 없어 보인다.
                setBackgroundImageUrl('')
              }}
              title={bg.label}
              className="h-9 rounded-2xl border border-[#2f2a25]/8 transition active:scale-90"
              style={{
                background: bg.css || 'repeating-linear-gradient(45deg,#e7e0d4,#e7e0d4 4px,#fffdf9 4px,#fffdf9 8px)',
                boxShadow:
                  !backgroundImageUrl && backgroundKey === bg.key
                    ? '0 0 0 2px var(--color-surface), 0 0 0 3.5px var(--color-accent)'
                    : 'none',
              }}
            />
          ))}
        </div>
        <input
          value={backgroundImageUrl}
          onChange={(e) => setBackgroundImageUrl(e.target.value)}
          placeholder="직접 넣을 이미지 주소 (선택)"
          className="mb-4 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
        />

        <label className="eyebrow mb-2 block">공유</label>
        <div className="mb-2 flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-xs text-[var(--color-sub)] outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="shrink-0 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-sub)] transition active:scale-95 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
        <div className="mb-5 flex justify-center rounded-2xl border border-[var(--color-border)] bg-white p-4">
          <QRCodeSVG value={shareUrl} size={140} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline border-transparent text-[var(--color-sub)]">
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
            className="btn-fill"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
