import { useState } from 'react'
import type { BoardLayout } from '../types'

type Props = {
  creating: boolean
  onClose: () => void
  onCreate: (title: string, layout: BoardLayout, columns: string[]) => void
}

const LAYOUTS: { key: BoardLayout; label: string; hint: string; icon: string }[] = [
  { key: 'wall', label: '자유 담벼락', hint: '포스트잇이 자유롭게 채워져요', icon: '🧱' },
  { key: 'columns', label: '세로 테이블', hint: '섹션이 좌우로 나뉘어요', icon: '📊' },
  { key: 'rows', label: '가로 테이블', hint: '섹션이 위아래로 쌓여요', icon: '📋' },
]

export default function CreateBoardModal({ creating, onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [layout, setLayout] = useState<BoardLayout>('wall')
  const [columnsText, setColumnsText] = useState('섹션 1, 섹션 2, 섹션 3')

  function submit() {
    if (!title.trim()) return
    const columns =
      layout !== 'wall'
        ? columnsText
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        : []
    onCreate(title.trim(), layout, columns)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">새 담벼락 만들기</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (예: 3반 여름방학 계획)"
          autoFocus
          className="mb-4 w-full rounded-2xl border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        />

        <div className="mb-4 flex flex-col gap-2">
          {LAYOUTS.map((l) => (
            <button
              key={l.key}
              type="button"
              onClick={() => setLayout(l.key)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                layout === l.key ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'
              }`}
            >
              <span className="text-xl">{l.icon}</span>
              <span>
                <span className="block text-sm font-semibold text-[var(--color-ink)]">{l.label}</span>
                <span className="block text-xs text-[var(--color-sub)]">{l.hint}</span>
              </span>
            </button>
          ))}
        </div>

        {layout !== 'wall' && (
          <input
            value={columnsText}
            onChange={(e) => setColumnsText(e.target.value)}
            placeholder="섹션 이름을 쉼표로 구분 (예: 월,화,수)"
            className="mb-4 w-full rounded-2xl border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline border-transparent text-[var(--color-sub)]">
            취소
          </button>
          <button type="button" disabled={!title.trim() || creating} onClick={submit} className="btn-fill">
            {creating ? '만드는 중...' : '만들기'}
          </button>
        </div>
      </div>
    </div>
  )
}
