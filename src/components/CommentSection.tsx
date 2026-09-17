import { useState } from 'react'
import type { Comment } from '../types'

type Props = {
  postId: string
  comments: Comment[]
  isMine: (commentId: string) => boolean
  defaultAuthor?: string
  onAdd: (postId: string, author: string, text: string) => void
  onDelete: (commentId: string) => void
}

export default function CommentSection({ postId, comments, isMine, defaultAuthor, onAdd, onDelete }: Props) {
  const [author, setAuthor] = useState(defaultAuthor ?? '')
  const [text, setText] = useState('')

  function submit() {
    if (!text.trim()) return
    onAdd(postId, author.trim(), text.trim())
    setText('')
  }

  return (
    <div className="mt-2 border-t border-black/10 pt-2" onClick={(e) => e.stopPropagation()}>
      {comments.length > 0 && (
        <ul className="mb-2 space-y-1">
          {comments.map((c) => (
            <li key={c.id} className="group/comment flex items-start justify-between gap-2 text-xs text-black/80">
              <span>
                <b className="font-bold text-black">{c.author || '익명'}</b> {c.text}
              </span>
              {isMine(c.id) && (
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  className="hidden shrink-0 text-black/30 hover:text-black/60 group-hover/comment:inline"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-1.5">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="이름"
          className="w-14 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-xs text-black placeholder:text-black/40 outline-none"
          maxLength={20}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="댓글 달기..."
          className="flex-1 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-xs text-black placeholder:text-black/40 outline-none"
          maxLength={300}
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold text-black/60 transition active:scale-90 hover:bg-black/15"
        >
          등록
        </button>
      </div>
    </div>
  )
}
