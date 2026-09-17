import type { Post } from '../types'
import PostCard from './PostCard'

type Props = {
  columns: string[]
  posts: Post[]
  isMine: (id: string) => boolean
  onDelete: (id: string) => void
  onAddTo: (column: string) => void
}

export default function ShelfLayout({ columns, posts, isMine, onDelete, onAddTo }: Props) {
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
              <PostCard key={post.id} post={post} canDelete={isMine(post.id)} onDelete={() => onDelete(post.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
