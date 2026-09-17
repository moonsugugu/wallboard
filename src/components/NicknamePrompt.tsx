import { useState } from 'react'
import { isSubmitEnter } from '../lib/keys'

type Props = {
  boardTitle: string
  onDone: (nickname: string) => void
}

export default function NicknamePrompt({ boardTitle, onDone }: Props) {
  const [name, setName] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a25]/35 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-sm rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center"
        style={{ boxShadow: '0 2px 8px rgba(74,62,48,0.08), 0 40px 80px -30px rgba(74,62,48,0.45)' }}
      >
        <p className="mb-1 text-sm text-[var(--color-sub)]">{boardTitle}</p>
        <h2 className="mb-5 font-display text-[23px] leading-none text-[var(--color-ink)]">이름을 알려주세요</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => isSubmitEnter(e) && name.trim() && onDone(name.trim())}
          placeholder="예: 3번 김민수"
          autoFocus
          className="mb-4 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-center text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
          maxLength={30}
        />
        <button type="button" disabled={!name.trim()} onClick={() => onDone(name.trim())} className="btn-fill mb-2 w-full">
          입장하기
        </button>
        <button type="button" onClick={() => onDone('')} className="text-xs text-[var(--color-sub)] hover:underline">
          이름 없이 둘러보기
        </button>
      </div>
    </div>
  )
}
