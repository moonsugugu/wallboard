import { boardTheme, timeAgo } from '../lib/boardTheme'
import type { BoardLayout } from '../types'

const LAYOUT_LABEL: Record<BoardLayout, string> = { wall: '자유 담벼락', columns: '세로 테이블', rows: '가로 테이블' }

type Props = {
  code: string
  title: string
  layout: BoardLayout
  visitedAt: number
  folderName: string | null
  onOpen: () => void
  onForget: () => void
  onMoveToFolder: () => void
}

export default function BoardCard({ code, title, layout, visitedAt, folderName, onOpen, onForget, onMoveToFolder }: Props) {
  const theme = boardTheme(code)

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="w-full overflow-hidden rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 text-left transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
        style={{ boxShadow: 'var(--shadow-card)' }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lift)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
      >
        {/* 폴라로이드처럼 흰 여백 안에 색면 한 장 */}
        <div
          className="relative flex h-32 items-center justify-center rounded-[18px] text-[32px]"
          style={{ background: `linear-gradient(150deg, ${theme.bg}, ${theme.bg}cc)` }}
        >
          <span className="opacity-70">{theme.emoji}</span>
          {folderName && (
            <span className="absolute bottom-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-[var(--color-surface)]/85 px-2.5 py-1 text-[11px] text-[var(--color-sub)] backdrop-blur-sm">
              📁 {folderName}
            </span>
          )}
        </div>

        <div className="px-3 pb-2.5 pt-4">
          <p className="truncate font-display text-[19px] leading-snug text-[var(--color-ink)]">{title}</p>
          <p className="mt-1.5 text-[11.5px] text-[var(--color-sub)]">
            {LAYOUT_LABEL[layout]} · 코드 {code}
          </p>
          <span className="my-3 block h-px w-full bg-[var(--color-border)]" />
          <p className="eyebrow">최근 방문 {timeAgo(visitedAt)}</p>
        </div>
      </button>

      <div className="card-actions absolute right-4 top-4 flex gap-1.5">
        <button
          type="button"
          onClick={onMoveToFolder}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface)]/90 text-xs backdrop-blur-sm transition active:scale-90 hover:text-[var(--color-accent)]"
          style={{ boxShadow: 'var(--shadow-paper)' }}
          aria-label="폴더로 옮기기"
        >
          📁
        </button>
        <button
          type="button"
          onClick={onForget}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface)]/90 text-sm text-[var(--color-sub)] backdrop-blur-sm transition active:scale-90 hover:text-[var(--color-accent)]"
          style={{ boxShadow: 'var(--shadow-paper)' }}
          aria-label="목록에서 지우기"
        >
          ×
        </button>
      </div>
    </div>
  )
}
