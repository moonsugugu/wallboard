import { useRef, useState } from 'react'
import { bookmarkletHref } from '../lib/padletBookmarklet'
import BookmarkletLink from './BookmarkletLink'

type Props = {
  importing: boolean
  importError: string
  apiImporting: boolean
  apiImportError: string
  savedApiKey: string
  onClose: () => void
  onImportFile: (file: File) => void
  onApiImport: (apiKey: string, boardId: string, remember: boolean) => void
}

export default function ImportModal({
  importing,
  importError,
  apiImporting,
  apiImportError,
  savedApiKey,
  onClose,
  onImportFile,
  onApiImport,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'bookmarklet' | 'api'>(savedApiKey ? 'api' : 'bookmarklet')
  const [apiKey, setApiKey] = useState(savedApiKey)
  const [remember, setRemember] = useState(!!savedApiKey)
  const [boardId, setBoardId] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a25]/35 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 shadow-[0_2px_8px_rgba(74,62,48,0.08),0_40px_80px_-30px_rgba(74,62,48,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-display text-[23px] leading-none text-[var(--color-ink)]">패들렛에서 가져오기</h2>

        <div className="mb-4 flex gap-1.5">
          <button
            type="button"
            onClick={() => setTab('bookmarklet')}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
              tab === 'bookmarklet'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-sub)]'
            }`}
          >
            북마클릿 (무료 계정)
          </button>
          <button
            type="button"
            onClick={() => setTab('api')}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
              tab === 'api'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-sub)]'
            }`}
          >
            API 키 (유료 계정)
          </button>
        </div>

        {tab === 'bookmarklet' ? (
          <>
            <p className="mb-3 text-xs leading-relaxed text-[var(--color-sub)]">
              아래 버튼을 <b>즐겨찾기줄로 드래그</b>해 등록한 뒤, 본인 패들렛 보드를 열고 클릭하면 파일이 다운로드됩니다. 그
              파일을 여기 업로드해주세요.
            </p>
            <BookmarkletLink
              href={bookmarkletHref()}
              className="mb-4 inline-flex cursor-grab items-center gap-1.5 rounded-full border border-dashed border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-accent)]"
            >
              📥 담벼락으로 가져오기
            </BookmarkletLink>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onImportFile(file)
                e.target.value = ''
              }}
            />
            {importError && <p className="mb-3 text-sm text-[var(--color-accent)]">{importError}</p>}
            <button
              type="button"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline w-full border-[var(--color-accent)] text-[var(--color-accent)]"
            >
              {importing ? '가져오는 중…' : 'padlet-export.json 업로드'}
            </button>
          </>
        ) : (
          <>
            <p className="mb-3 text-xs leading-relaxed text-[var(--color-sub)]">
              패들렛 유료 요금제의 API 키가 있다면 바로 가져올 수 있어요. 키는 이 브라우저에서 패들렛으로 곧장 전송되고 문수네집
              서버는 거치지 않아요.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API 키"
              className="mb-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
            />
            <label className="mb-3 flex items-center gap-1.5 text-xs text-[var(--color-sub)]">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />이 브라우저에 API 키
              기억하기
            </label>
            <input
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="보드 ID 또는 패들렛 링크"
              className="mb-3 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
            />
            {apiImportError && <p className="mb-3 text-sm text-[var(--color-accent)]">{apiImportError}</p>}
            <button
              type="button"
              disabled={!apiKey.trim() || !boardId.trim() || apiImporting}
              onClick={() => onApiImport(apiKey.trim(), boardId.trim(), remember)}
              className="btn-fill w-full"
            >
              {apiImporting ? '가져오는 중…' : 'API로 가져오기'}
            </button>
          </>
        )}

        <button type="button" onClick={onClose} className="btn-outline mt-4 w-full border-transparent text-[var(--color-sub)]">
          닫기
        </button>
      </div>
    </div>
  )
}
