import type { Post } from '../types'
import type { PostActions } from './postActions'
import PostCard from './PostCard'

type Props = {
  posts: Post[]
  actions: PostActions
}

export default function WallLayout({ posts, actions }: Props) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="eyebrow mb-3">아직 비어 있어요</p>
        <p className="font-display text-[22px] text-[var(--color-ink)]">첫 생각을 붙여볼까요?</p>
        <p className="mt-2 text-sm text-[var(--color-sub)]">오른쪽 아래 + 버튼으로 포스트잇을 추가할 수 있어요.</p>
      </div>
    )
  }
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canEdit={actions.isMine(post.id)}
          onEdit={() => actions.onEdit(post.id)}
          onDelete={() => actions.onDelete(post.id)}
          actions={actions}
          tilt
        />
      ))}
    </div>
  )
}
