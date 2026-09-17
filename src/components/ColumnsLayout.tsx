import type { Post } from '../types'
import type { PostActions } from './postActions'
import PostCard from './PostCard'

type Props = {
  columns: string[]
  posts: Post[]
  actions: PostActions
  onAddTo: (column: string) => void
}

// 세로 테이블형: 섹션이 좌우로 나열되고, 각 섹션 안에서 포스트잇이 위→아래로 쌓인다.
export default function ColumnsLayout({ columns, posts, actions, onAddTo }: Props) {
  const byColumn = new Map<string, Post[]>(columns.map((c) => [c, []]))
  for (const post of posts) {
    const key = post.column && byColumn.has(post.column) ? post.column : columns[0]
    if (key) byColumn.get(key)!.push(post)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col} className="w-72 shrink-0 rounded-xl bg-black/[0.03] p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="truncate text-sm font-bold text-[var(--color-ink)]">{col}</h3>
            <button
              type="button"
              onClick={() => onAddTo(col)}
              className="h-6 w-6 rounded-full bg-[var(--color-accent)] text-sm font-bold text-white"
              aria-label={`${col}에 추가`}
            >
              +
            </button>
          </div>
          <div>
            {(byColumn.get(col) || []).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                canEdit={actions.isMine(post.id)}
                onEdit={() => actions.onEdit(post.id)}
                onDelete={() => actions.onDelete(post.id)}
                actions={actions}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
