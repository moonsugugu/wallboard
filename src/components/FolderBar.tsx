import { useEffect, useRef, useState } from 'react'
import type { BoardFolder } from '../lib/boardFolders'
import { isSubmitEnter } from '../lib/keys'

export type FolderFilter = 'all' | 'unfiled' | string // string이면 폴더 id

type Props = {
  folders: BoardFolder[]
  active: FolderFilter
  counts: { all: number; unfiled: number; byFolder: Record<string, number> }
  onSelect: (filter: FolderFilter) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

const CHIP = 'rounded-full border px-3.5 py-1.5 text-[13px] transition active:scale-[0.96]'
const CHIP_ON = 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]'
const CHIP_OFF = 'border-[var(--color-border)] bg-[var(--color-surface)]/70 text-[var(--color-sub)] hover:border-[var(--color-sub)]/40'

// 새 폴더 만들기·이름 바꾸기에 같이 쓰는 인라인 입력칸. 모달을 띄우지 않고 칩 자리에서 바로 고친다.
function InlineNameInput({ initial, onCommit, onCancel }: { initial: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => (value.trim() ? onCommit(value) : onCancel())}
      onKeyDown={(e) => {
        if (isSubmitEnter(e)) onCommit(value)
        if (e.key === 'Escape') onCancel()
      }}
      placeholder="폴더 이름"
      maxLength={20}
      className={`${CHIP} w-32 border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-ink)] outline-none`}
    />
  )
}

export default function FolderBar({ folders, active, counts, onSelect, onCreate, onRename, onDelete }: Props) {
  const [creating, setCreating] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => onSelect('all')} className={`${CHIP} ${active === 'all' ? CHIP_ON : CHIP_OFF}`}>
        전체 <span className="opacity-60">{counts.all}</span>
      </button>

      {folders.map((f) =>
        renamingId === f.id ? (
          <InlineNameInput
            key={f.id}
            initial={f.name}
            onCommit={(v) => {
              onRename(f.id, v)
              setRenamingId(null)
            }}
            onCancel={() => setRenamingId(null)}
          />
        ) : (
          <span key={f.id} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onSelect(f.id)}
              className={`${CHIP} ${active === f.id ? `${CHIP_ON} rounded-r-none border-r-0 pr-2.5` : CHIP_OFF}`}
            >
              📁 {f.name} <span className="opacity-60">{counts.byFolder[f.id] ?? 0}</span>
            </button>

            {/* 선택된 폴더에서만 이름 바꾸기·삭제를 꺼내 보여준다 */}
            {active === f.id && (
              <span
                className={`${CHIP} flex items-center gap-1.5 rounded-l-none border-l-0 border-[var(--color-accent)] bg-[var(--color-accent-soft)] pl-1.5 pr-2.5`}
              >
                <button
                  type="button"
                  onClick={() => setRenamingId(f.id)}
                  className="px-1 text-[var(--color-accent)]/70 transition hover:text-[var(--color-accent)]"
                  aria-label={`${f.name} 이름 바꾸기`}
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(f.id)}
                  className="px-1 text-[var(--color-accent)]/70 transition hover:text-[var(--color-accent)]"
                  aria-label={`${f.name} 폴더 삭제`}
                >
                  ×
                </button>
              </span>
            )}
          </span>
        ),
      )}

      {/* 폴더가 하나라도 있고 분류 안 한 담벼락이 남아 있을 때만 '미분류'를 보여준다 */}
      {folders.length > 0 && counts.unfiled > 0 && (
        <button type="button" onClick={() => onSelect('unfiled')} className={`${CHIP} ${active === 'unfiled' ? CHIP_ON : CHIP_OFF}`}>
          미분류 <span className="opacity-60">{counts.unfiled}</span>
        </button>
      )}

      {creating ? (
        <InlineNameInput
          initial=""
          onCommit={(v) => {
            onCreate(v)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className={`${CHIP} border-dashed border-[var(--color-border)] text-[var(--color-sub)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]`}
        >
          + 새 폴더
        </button>
      )}
    </div>
  )
}
