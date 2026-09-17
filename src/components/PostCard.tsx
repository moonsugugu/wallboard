import type { Post } from '../types'

type Props = {
  post: Post
  canDelete: boolean
  onDelete: () => void
}

export default function PostCard({ post, canDelete, onDelete }: Props) {
  return (
    <div
      className="group relative mb-4 break-inside-avoid rounded-lg border border-black/5 p-4 shadow-sm transition hover:shadow-md"
      style={{ background: post.color }}
    >
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-black/10 text-sm text-black/60 hover:bg-black/20 group-hover:flex"
          aria-label="삭제"
        >
          ×
        </button>
      )}
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mb-2 max-h-64 w-full rounded-md object-cover" loading="lazy" />
      )}
      {post.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-black/80">{post.text}</p>}
      <p className="mt-3 text-xs font-medium text-black/40">{post.author || '익명'}</p>
    </div>
  )
}
