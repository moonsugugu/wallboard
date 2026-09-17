import type { Post } from '../types'
import type { PostActions } from './postActions'
import PostCard from './PostCard'

type Props = {
  columns: string[]
  posts: Post[]
  actions: PostActions
  onAddTo: (column: string) => void
}

// 가로 테이블형: 섹션이 위→아래로 나열되고, 각 섹션 안에서 포스트잇이 좌→우로 나열된다.
export default function RowsLayout({ columns, posts, actions, onAddTo }: Props) {
  const byColumn = new Map<string, Post[]>(columns.map((c) => [c, []]))
  for (const post of posts) {
    const key = post.column && byColumn.has(post.column) ? post.column : columns[0]
    if (key) byColumn.get(key)!.push(post)
  }

  return (
    <div className="flex flex-col gap-4">
      {columns.map((col) => (
        <div key={col} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="truncate font-display text-[17px] text-[var(--color-ink)]">{col}</h3>
            <button
              type="button"
              onClick={() => onAddTo(col)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)] transition active:scale-90 hover:bg-[var(--color-accent)] hover:text-white"
              aria-label={`${col}에 추가`}
            >
              +
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {(byColumn.get(col) || []).map((post) => (
              <div key={post.id} className="w-64 shrink-0">
                <PostCard
                  post={post}
                  canEdit={actions.isMine(post.id)}
                  onEdit={() => actions.onEdit(post.id)}
                  onDelete={() => actions.onDelete(post.id)}
                  actions={actions}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
