import { boardTheme, timeAgo } from '../lib/boardTheme'
import type { BoardLayout } from '../types'

const LAYOUT_LABEL: Record<BoardLayout, string> = { wall: '자유 담벼락', columns: '세로 테이블', rows: '가로 테이블' }

type Props = {
  code: string
  title: string
  layout: BoardLayout
  visitedAt: number
  onOpen: () => void
  onForget: () => void
}

export default function BoardCard({ code, title, layout, visitedAt, onOpen, onForget }: Props) {
  const theme = boardTheme(code)

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        className="w-full overflow-hidden rounded-3xl bg-[var(--color-surface)] text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
      >
        <div className="flex h-24 items-center justify-center text-4xl" style={{ background: theme.bg }}>
          {theme.emoji}
        </div>
        <div className="p-4">
          <p className="truncate font-bold text-[var(--color-ink)]">{title}</p>
          <p className="mt-0.5 text-xs text-[var(--color-sub)]">
            {LAYOUT_LABEL[layout]} · 코드 {code}
          </p>
          <p className="mt-2 text-[11px] text-[var(--color-sub)]">최근 방문 {timeAgo(visitedAt)}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onForget}
        className="absolute right-3 top-3 hidden h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-[#7a8699] shadow-sm backdrop-blur-sm transition active:scale-90 hover:text-red-500 group-hover:flex"
        aria-label="목록에서 지우기"
      >
        ×
      </button>
    </div>
  )
}
