import { useState } from 'react'
import { isSubmitEnter } from '../lib/keys'
import type { BoardFolder } from '../lib/boardFolders'

type Props = {
  boardTitle: string
  folders: BoardFolder[]
  currentFolderId: string | null
  onClose: () => void
  onMove: (folderId: string | null) => void
  onCreateAndMove: (name: string) => void
}

const ROW = 'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition active:scale-[0.98]'
const ROW_ON = 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]'
const ROW_OFF = 'border-[var(--color-border)] text-[var(--color-ink)] hover:border-[var(--color-sub)]/40'

export default function MoveToFolderModal({ boardTitle, folders, currentFolderId, onClose, onMove, onCreateAndMove }: Props) {
  const [newName, setNewName] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a25]/35 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_2px_8px_rgba(74,62,48,0.08),0_40px_80px_-30px_rgba(74,62,48,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow mb-1.5">Move</p>
        <h2 className="mb-1 font-display text-[23px] leading-none text-[var(--color-ink)]">폴더로 옮기기</h2>
        <p className="mb-5 truncate text-xs text-[var(--color-sub)]">{boardTitle}</p>

        <div className="mb-4 flex flex-col gap-2">
          <button type="button" onClick={() => onMove(null)} className={`${ROW} ${currentFolderId === null ? ROW_ON : ROW_OFF}`}>
            <span className="opacity-70">🗂️</span> 폴더 없음
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onMove(f.id)}
              className={`${ROW} ${currentFolderId === f.id ? ROW_ON : ROW_OFF}`}
            >
              <span className="opacity-70">📁</span> <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>

        <p className="eyebrow mb-2">새 폴더에 넣기</p>
        <div className="mb-5 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => isSubmitEnter(e) && newName.trim() && onCreateAndMove(newName)}
            placeholder="폴더 이름"
            maxLength={20}
            className="field flex-1"
          />
          <button type="button" disabled={!newName.trim()} onClick={() => onCreateAndMove(newName)} className="btn-soft shrink-0">
            만들기
          </button>
        </div>

        <button type="button" onClick={onClose} className="btn-outline w-full border-transparent text-[var(--color-sub)]">
          닫기
        </button>
      </div>
    </div>
  )
}
