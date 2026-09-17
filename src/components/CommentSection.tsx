import { useState } from 'react'
import { isSubmitEnter } from '../lib/keys'
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
    <div className="mt-3 border-t border-[#2f2a25]/10 pt-3" onClick={(e) => e.stopPropagation()}>
      {comments.length > 0 && (
        <ul className="mb-2 space-y-1">
          {comments.map((c) => (
            <li key={c.id} className="group/comment flex items-start justify-between gap-2 text-xs leading-relaxed text-[#2f2a25]/75">
              <span>
                <b className="font-semibold text-[#2f2a25]">{c.author || '익명'}</b> {c.text}
              </span>
              {isMine(c.id) && (
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  className="hidden shrink-0 text-[#2f2a25]/30 hover:text-[#2f2a25]/60 group-hover/comment:inline"
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
          className="w-14 rounded-full border border-[#2f2a25]/10 bg-[#fffdf9]/85 px-2.5 py-1 text-xs text-[#2f2a25] placeholder:text-[#2f2a25]/40 outline-none"
          maxLength={20}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => isSubmitEnter(e) && submit()}
          placeholder="댓글 달기..."
          className="flex-1 rounded-full border border-[#2f2a25]/10 bg-[#fffdf9]/85 px-2.5 py-1 text-xs text-[#2f2a25] placeholder:text-[#2f2a25]/40 outline-none"
          maxLength={300}
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded-full bg-[#2f2a25]/8 px-3 py-1 text-xs font-semibold text-[#2f2a25]/60 transition active:scale-90 hover:bg-[#2f2a25]/15"
        >
          등록
        </button>
      </div>
    </div>
  )
}
