import { useState } from 'react'
import { toEmbeddableVideo } from '../lib/videoEmbed'
import { normalizePostColor } from '../types'
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
  /* 자유 담벼락에서만: 종이가 손으로 붙인 듯 살짝 기울어 보이게 */
  tilt?: boolean
}

// 짧은 글은 세리프로 크게 — 손으로 적어둔 쪽지처럼 읽히게 한다.
const SHORT_TEXT_MAX = 42

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
      className="mb-2.5 block rounded-2xl border border-[#2f2a25]/10 bg-[#fffdf9]/60 px-3.5 py-2.5 text-xs text-[#2f2a25]/70 transition active:scale-[0.98] hover:bg-[#fffdf9]"
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

// 같은 글은 늘 같은 각도로 기울어야 새로고침할 때마다 화면이 흔들리지 않는다.
function tiltFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const deg = ((hash % 17) - 8) / 10 // -0.8deg ~ 0.8deg
  return `rotate(${deg}deg)`
}

export default function PostCard({ post, canEdit, onEdit, onDelete, actions, tilt = false }: Props) {
  const [showComments, setShowComments] = useState(false)
  const reactions = actions.reactionsByPost.get(post.id) ?? []
  const comments = actions.commentsByPost.get(post.id) ?? []
  const hasMedia = (post.attachmentType === 'image' || post.attachmentType === 'video') && !!post.attachmentUrl
  const color = normalizePostColor(post.color)
  const isShortNote = !hasMedia && post.attachmentType !== 'link' && post.text.length > 0 && post.text.length <= SHORT_TEXT_MAX

  return (
    <div
      className={`group relative mb-5 break-inside-avoid overflow-hidden rounded-[18px] border border-[#2f2a25]/[0.06] transition-all duration-300 hover:-translate-y-1 ${
        hasMedia ? '' : 'postit-square'
      }`}
      style={{
        background: color,
        transform: tilt ? tiltFor(post.id) : undefined,
        boxShadow: 'var(--shadow-paper)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lift)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-paper)')}
    >
      {canEdit && (
        <div className="card-actions absolute right-2.5 top-2.5 z-10 flex gap-1.5">
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

      <div className={hasMedia ? 'px-5 pb-4 pt-4' : 'px-5 pb-4 pt-5'}>
        {/* 압정 자국 하나 */}
        {!hasMedia && <span className="absolute left-1/2 top-2.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2f2a25]/15" />}

        {post.attachmentType === 'link' && post.attachmentUrl && <LinkCard url={post.attachmentUrl} />}
        {post.text &&
          (isShortNote ? (
            <p className="font-display whitespace-pre-wrap break-words text-[19px] leading-[1.5] text-[#2f2a25]/85">{post.text}</p>
          ) : (
            <p className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed text-[#2f2a25]/80">{post.text}</p>
          ))}

        <p className="mt-3.5 text-[11px] uppercase tracking-[0.16em] text-[#2f2a25]/35">{post.author || '익명'}</p>

        <div className="mt-1.5 flex items-center justify-between">
          <ReactionBar postId={post.id} reactions={reactions} voterKey={actions.voterKey} onToggle={actions.onToggleReaction} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowComments((v) => !v)
            }}
            className="shrink-0 rounded-full px-2 py-1 text-xs text-[#2f2a25]/40 transition active:scale-90 hover:bg-[#2f2a25]/5 hover:text-[#2f2a25]/70"
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
