import { REACTION_EMOJIS } from '../types'
import type { Reaction, ReactionEmoji } from '../types'

type Props = {
  postId: string
  reactions: Reaction[]
  voterKey: string
  onToggle: (postId: string, emoji: ReactionEmoji) => void
}

export default function ReactionBar({ postId, reactions, voterKey, onToggle }: Props) {
  return (
    <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
      {REACTION_EMOJIS.map((emoji) => {
        const forEmoji = reactions.filter((r) => r.emoji === emoji)
        const mine = forEmoji.some((r) => r.voterKey === voterKey)
        if (forEmoji.length === 0 && !mine) {
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggle(postId, emoji)}
              className="rounded-full px-1.5 py-0.5 text-sm opacity-40 transition active:scale-90 hover:opacity-100"
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
              mine ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-black/10 bg-black/5'
            }`}
          >
            <span>{emoji}</span>
            <span className="font-semibold text-black/60">{forEmoji.length}</span>
          </button>
        )
      })}
    </div>
  )
}
