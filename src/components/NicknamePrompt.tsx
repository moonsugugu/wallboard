import { useState } from 'react'

type Props = {
  boardTitle: string
  onDone: (nickname: string) => void
}

export default function NicknamePrompt({ boardTitle, onDone }: Props) {
  const [name, setName] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] p-6 text-center shadow-xl">
        <p className="mb-1 text-sm text-[var(--color-sub)]">{boardTitle}</p>
        <h2 className="mb-4 text-lg font-bold">이름을 알려주세요</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onDone(name.trim())}
          placeholder="예: 3번 김민수"
          autoFocus
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-center text-sm outline-none focus:border-[var(--color-accent)]"
          maxLength={30}
        />
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onDone(name.trim())}
          className="mb-2 w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          입장하기
        </button>
        <button type="button" onClick={() => onDone('')} className="text-xs text-[var(--color-sub)] hover:underline">
          이름 없이 둘러보기
        </button>
      </div>
    </div>
  )
}
