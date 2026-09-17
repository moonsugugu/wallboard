import { useState } from 'react'
import { toEmbeddableVideo } from '../lib/videoEmbed'
import type { Post } from '../types'
import CommentSection from './CommentSection'
import type { PostActions } from './postActions'
import ReactionBar from './ReactionBar'

type Props = {
  post: Post
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  actions: PostActions
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
      className="mb-2 block rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-xs text-black/70 transition active:scale-[0.98] hover:bg-black/[0.06]"
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
    return <video src={video.src} controls className="block aspect-video w-full" />
  }
  return (
    <iframe
      src={video.src}
      className="block aspect-video w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

export default function PostCard({ post, canEdit, onEdit, onDelete, actions }: Props) {
  const [showComments, setShowComments] = useState(false)
  const reactions = actions.reactionsByPost.get(post.id) ?? []
  const comments = actions.commentsByPost.get(post.id) ?? []
  const hasMedia = (post.attachmentType === 'image' || post.attachmentType === 'video') && !!post.attachmentUrl

  return (
    <div
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_14px_28px_rgba(0,0,0,0.12)]"
      style={{ background: post.color }}
    >
      {canEdit && (
        <div className="absolute right-2 top-2 z-10 hidden gap-1.5 group-hover:flex">
          <button type="button" onClick={onEdit} className="btn-icon text-xs" aria-label="수정">
            ✎
          </button>
          <button type="button" onClick={onDelete} className="btn-icon text-sm" aria-label="삭제">
            ×
          </button>
        </div>
      )}

      {/* 썸네일(이미지/영상)은 카드 padding 없이 가장자리까지 꽉 채운다(full bleed) */}
      {post.attachmentType === 'image' && post.attachmentUrl && (
        <img src={post.attachmentUrl} alt="" className="block max-h-80 w-full object-cover" loading="lazy" />
      )}
      {post.attachmentType === 'video' && post.attachmentUrl && <VideoEmbed url={post.attachmentUrl} />}

      <div className={hasMedia ? 'p-4 pt-3' : 'p-4'}>
        {post.attachmentType === 'link' && post.attachmentUrl && <LinkCard url={post.attachmentUrl} />}
        {post.text && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-black/80">{post.text}</p>}
        <p className="mt-3 text-xs font-medium text-black/40">{post.author || '익명'}</p>

        <div className="mt-2 flex items-center justify-between">
          <ReactionBar postId={post.id} reactions={reactions} voterKey={actions.voterKey} onToggle={actions.onToggleReaction} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowComments((v) => !v)
            }}
            className="shrink-0 rounded-full px-2 py-1 text-xs text-black/40 transition active:scale-90 hover:bg-black/5 hover:text-black/70"
          >
            💬 {comments.length > 0 ? comments.length : ''}
          </button>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            comments={comments}
            isMine={actions.isMineComment}
            defaultAuthor={actions.nickname}
            onAdd={actions.onAddComment}
            onDelete={actions.onDeleteComment}
          />
        )}
      </div>
    </div>
  )
}
