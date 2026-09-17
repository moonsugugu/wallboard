import type { Post } from '../types'
import type { PostActions } from './postActions'
import PostCard from './PostCard'

type Props = {
  posts: Post[]
  actions: PostActions
}

export default function WallLayout({ posts, actions }: Props) {
  if (posts.length === 0) {
    return <p className="py-16 text-center text-[var(--color-sub)]">아직 올라온 포스트잇이 없어요. 오른쪽 아래 + 버튼으로 추가해보세요.</p>
  }
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {posts.map((post) => (
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
  )
}
