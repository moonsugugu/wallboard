import { useEffect, useRef, useState } from 'react'
import { QUICK_REACTIONS, REACTION_EMOJIS } from '../types'
import type { Reaction, ReactionEmoji } from '../types'

type Props = {
  postId: string
  reactions: Reaction[]
  voterKey: string
  onToggle: (postId: string, emoji: ReactionEmoji) => void
}

export default function ReactionBar({ postId, reactions, voterKey, onToggle }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setPickerOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pickerOpen])

  const countFor = (emoji: ReactionEmoji) => reactions.filter((r) => r.emoji === emoji)
  // 이미 눌린 반응은 종류와 상관없이 늘 보여주고, 그 외에는 기본 4개만 둔다.
  // 18종을 전부 깔아두면 포스트잇이 이모지로 가득 차 글이 안 읽힌다.
  const used = REACTION_EMOJIS.filter((e) => countFor(e).length > 0)
  const shown = [...new Set<ReactionEmoji>([...used, ...QUICK_REACTIONS])]

  return (
    <div ref={wrapRef} className="relative mt-2 flex flex-wrap items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {shown.map((emoji) => {
        const forEmoji = countFor(emoji)
        const mine = forEmoji.some((r) => r.voterKey === voterKey)
        if (forEmoji.length === 0) {
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggle(postId, emoji)}
              className="rounded-full px-1.5 py-0.5 text-sm opacity-30 transition active:scale-90 hover:opacity-100"
            >
              {emoji}
            </button>
          )
        }
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggle(postId, emoji)}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition active:scale-90 ${
              mine ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[#2f2a25]/10 bg-[#2f2a25]/[0.04]'
            }`}
          >
            <span>{emoji}</span>
            <span className="font-semibold text-[#2f2a25]/60">{forEmoji.length}</span>
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm transition active:scale-90 ${
          pickerOpen ? 'bg-[#2f2a25]/10 text-[#2f2a25]/70' : 'text-[#2f2a25]/30 hover:bg-[#2f2a25]/5 hover:text-[#2f2a25]/70'
        }`}
        aria-label="다른 반응 고르기"
        aria-expanded={pickerOpen}
      >
        ＋
      </button>

      {pickerOpen && (
        <div
          className="absolute bottom-8 left-0 z-20 grid w-[13.5rem] grid-cols-6 gap-0.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
          style={{ boxShadow: 'var(--shadow-lift)' }}
        >
          {REACTION_EMOJIS.map((emoji) => {
            const mine = countFor(emoji).some((r) => r.voterKey === voterKey)
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onToggle(postId, emoji)
                  setPickerOpen(false)
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-base transition active:scale-90 hover:bg-[var(--color-surface-2)] ${
                  mine ? 'bg-[var(--color-accent-soft)]' : ''
                }`}
              >
                {emoji}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
