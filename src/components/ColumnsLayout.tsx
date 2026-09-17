import type { Post } from '../types'
import type { PostActions } from './postActions'
import PostCard from './PostCard'

type Props = {
  columns: string[]
  posts: Post[]
  actions: PostActions
  onAddTo: (column: string) => void
}

// 세로 테이블형: 섹션이 위→아래로 한 줄씩 나열되고, 각 섹션 안에서 포스트잇이 1열로 쌓인다.
// (섹션 안에서 포스트잇이 좌→우로 흐르는 건 '가로 테이블형'이다.)
export default function ColumnsLayout({ columns, posts, actions, onAddTo }: Props) {
  const byColumn = new Map<string, Post[]>(columns.map((c) => [c, []]))
  for (const post of posts) {
    const key = post.column && byColumn.has(post.column) ? post.column : columns[0]
    if (key) byColumn.get(key)!.push(post)
  }

  return (
    <div className="flex flex-col gap-4">
      {columns.map((col) => {
        const items = byColumn.get(col) || []
        return (
          <section key={col} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="truncate font-display text-[17px] text-[var(--color-ink)]">
                {col} <span className="text-[13px] text-[var(--color-sub)]">{items.length}</span>
              </h3>
              <button
                type="button"
                onClick={() => onAddTo(col)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)] transition active:scale-90 hover:bg-[var(--color-accent)] hover:text-white"
                aria-label={`${col}에 추가`}
              >
                +
              </button>
            </div>

            {items.length === 0 ? (
              <p className="py-6 text-center text-xs text-[var(--color-sub)]">아직 비어 있어요</p>
            ) : (
              // 포스트잇은 1열. 정사각형 카드가 화면 폭만큼 커지지 않도록 폭을 잡아둔다.
              <div className="mx-auto w-full max-w-sm">
                {items.map((post) => (
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
            )}
          </section>
        )
      })}
    </div>
  )
}
