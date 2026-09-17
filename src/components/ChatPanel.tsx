import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'

type Props = {
  messages: ChatMessage[]
  defaultAuthor: string
  onClose: () => void
  onSend: (author: string, text: string) => void
}

export default function ChatPanel({ messages, defaultAuthor, onClose, onSend }: Props) {
  const [author, setAuthor] = useState(defaultAuthor)
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  function submit() {
    if (!text.trim()) return
    onSend(author.trim(), text.trim())
    setText('')
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h3 className="font-bold text-[var(--color-ink)]">실시간 채팅</h3>
        <button type="button" onClick={onClose} className="btn-icon bg-black/10 text-[var(--color-ink)] hover:bg-black/20" aria-label="채팅 닫기">
          ×
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && <p className="py-8 text-center text-xs text-[var(--color-sub)]">아직 채팅이 없어요.</p>}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <b className="text-[var(--color-ink)]">{m.author || '익명'}</b>{' '}
            <span className="text-[var(--color-ink)]/80">{m.text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 border-t border-[var(--color-border)] p-3">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="이름"
          className="w-16 rounded-full border border-[var(--color-border)] bg-transparent px-2.5 py-1.5 text-xs text-[var(--color-ink)] outline-none"
          maxLength={20}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="메시지 입력..."
          className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-ink)] outline-none"
          maxLength={300}
        />
        <button type="button" onClick={submit} className="btn-fill shrink-0 px-3 py-1.5 text-xs">
          전송
        </button>
      </div>
    </div>
  )
}
