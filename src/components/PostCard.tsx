import { toEmbeddableVideo } from '../lib/videoEmbed'
import type { Post } from '../types'

type Props = {
  post: Post
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

function LinkCard({ url }: { url: string }) {
  let host = url
  try {
    host = new URL(url).hostname
  } catch {
    /* URL 파싱 실패 시 원문 그대로 표시 */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-2 block rounded-md border border-black/10 bg-black/[0.03] px-3 py-2 text-xs text-black/70 hover:bg-black/[0.06]"
      onClick={(e) => e.stopPropagation()}
    >
      🔗 {host}
    </a>
  )
}

function VideoEmbed({ url }: { url: string }) {
  const video = toEmbeddableVideo(url)
  if (video.kind === 'file') {
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <video src={video.src} controls className="mb-2 w-full rounded-md" />
  }
  return (
    <iframe
      src={video.src}
      className="mb-2 aspect-video w-full rounded-md"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default function PostCard({ post, canEdit, onEdit, onDelete }: Props) {
  return (
    <div
      className="group relative mb-4 break-inside-avoid rounded-lg border border-black/5 p-4 shadow-sm transition hover:shadow-md"
      style={{ background: post.color }}
    >
      {canEdit && (
        <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs text-black/60 hover:bg-black/20"
            aria-label="수정"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-sm text-black/60 hover:bg-black/20"
            aria-label="삭제"
          >
            ×
          </button>
        </div>
      )}
      {post.attachmentType === 'image' && post.attachmentUrl && (
        <img src={post.attachmentUrl} alt="" className="mb-2 max-h-64 w-full rounded-md object-cover" loading="lazy" />
      )}
      {post.attachmentType === 'video' && post.attachmentUrl && <VideoEmbed url={post.attachmentUrl} />}
      {post.attachmentType === 'link' && post.attachmentUrl && <LinkCard url={post.attachmentUrl} />}
      {post.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-black/80">{post.text}</p>}
      <p className="mt-3 text-xs font-medium text-black/40">{post.author || '익명'}</p>
    </div>
  )
}
