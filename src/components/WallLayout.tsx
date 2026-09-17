import type { Post } from '../types'
import PostCard from './PostCard'

type Props = {
  posts: Post[]
  isMine: (id: string) => boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function WallLayout({ posts, isMine, onEdit, onDelete }: Props) {
  if (posts.length === 0) {
    return <p className="py-16 text-center text-[var(--color-sub)]">아직 올라온 포스트잇이 없어요. 오른쪽 아래 + 버튼으로 추가해보세요.</p>
  }
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          canEdit={isMine(post.id)}
          onEdit={() => onEdit(post.id)}
          onDelete={() => onDelete(post.id)}
        />
      ))}
    </div>
  )
}
