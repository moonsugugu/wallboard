import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkletLink from '../components/BookmarkletLink'
import MoonsuneCredit from '../components/MoonsuneCredit'
import { addPost, createBoard } from '../lib/db'
import { parseExportFile, type ImportResult } from '../lib/importPadlet'
import { bookmarkletHref } from '../lib/padletBookmarklet'
import { clearSavedPadletApiKey, getSavedPadletApiKey, savePadletApiKey } from '../lib/padletApiKey'
import { importFromPadletApi } from '../lib/padletApiImport'
import { forgetBoard, getRecentBoards } from '../lib/recentBoards'
import { normalizeBoardCode } from '../lib/roomCode'
import type { BoardLayout } from '../types'
import { POST_COLORS } from '../types'

const LAYOUT_LABEL: Record<BoardLayout, string> = { wall: '자유 담벼락', columns: '세로 테이블', rows: '가로 테이블' }

export default function Home() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [layout, setLayout] = useState<BoardLayout>('wall')
  const [columnsText, setColumnsText] = useState('섹션 1, 섹션 2, 섹션 3')
  const [creating, setCreating] = useState(false)

  const [joinCode, setJoinCode] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  const [apiKey, setApiKey] = useState(() => getSavedPadletApiKey())
  const [rememberApiKey, setRememberApiKey] = useState(() => !!getSavedPadletApiKey())
  const [apiBoardId, setApiBoardId] = useState('')
  const [apiImporting, setApiImporting] = useState(false)
  const [apiImportError, setApiImportError] = useState('')

  const [recentBoards, setRecentBoards] = useState(() => getRecentBoards())

  async function applyImportResult(result: ImportResult) {
    const code = await createBoard(result.title, result.layout, result.columns)
    for (const post of result.posts) {
      await addPost(
        code,
        {
          author: post.author,
          text: post.text,
          attachmentType: post.attachmentType,
          attachmentUrl: post.attachmentUrl,
          color: POST_COLORS.includes(post.color) ? post.color : POST_COLORS[0],
          column: post.column,
        },
        post.createdAt,
      )
    }
    navigate(`/board/${code}`)
  }

  async function handleCreate() {
    if (!title.trim() || creating) return
    setCreating(true)
    try {
      const columns =
        layout !== 'wall'
          ? columnsText
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
          : []
      const code = await createBoard(title.trim(), layout, columns)
      navigate(`/board/${code}`)
    } finally {
      setCreating(false)
    }
  }

  function handleJoin() {
    const code = normalizeBoardCode(joinCode)
    if (code) navigate(`/board/${code}`)
  }

  async function handleImportFile(file: File) {
    setImporting(true)
    setImportError('')
    try {
      const result = await parseExportFile(file)
      await applyImportResult(result)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '가져오기에 실패했습니다.')
    } finally {
      setImporting(false)
    }
  }

  async function handleApiImport() {
    if (!apiKey.trim() || !apiBoardId.trim() || apiImporting) return
    setApiImporting(true)
    setApiImportError('')
    try {
      if (rememberApiKey) savePadletApiKey(apiKey.trim())
      else clearSavedPadletApiKey()
      const result = await importFromPadletApi(apiKey.trim(), apiBoardId.trim())
      await applyImportResult(result)
    } catch (e) {
      setApiImportError(e instanceof Error ? e.message : '가져오기에 실패했습니다.')
    } finally {
      setApiImporting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">담벼락</h1>
        <p className="mt-1 text-[var(--color-sub)]">우리 반 실시간 포스트잇 게시판</p>
      </header>

      {recentBoards.length > 0 && (
        <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="mb-4 font-bold">최근 담벼락</h2>
          <ul className="space-y-2">
            {recentBoards.map((b) => (
              <li key={b.code} className="group flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/board/${b.code}`)}
                  className="flex-1 rounded-2xl border border-[var(--color-border)] px-3.5 py-2.5 text-left text-sm transition active:scale-[0.98] hover:border-[var(--color-accent)]"
                >
                  <span className="font-semibold">{b.title}</span>
                  <span className="ml-2 text-xs text-[var(--color-sub)]">
                    {LAYOUT_LABEL[b.layout]} · {b.code}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    forgetBoard(b.code)
                    setRecentBoards(getRecentBoards())
                  }}
                  className="hidden shrink-0 rounded-full px-2.5 py-1 text-xs text-[var(--color-sub)] transition active:scale-90 hover:text-red-500 group-hover:block"
                  aria-label="목록에서 지우기"
                >
                  지우기
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm">
        <h2 className="mb-4 font-bold">새 담벼락 만들기</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (예: 3반 여름방학 계획)"
          className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <div className="mb-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setLayout('wall')}
            className={`rounded-full border px-2 py-2 text-sm font-medium transition active:scale-95 ${layout === 'wall' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}
          >
            자유 담벼락
          </button>
          <button
            type="button"
            onClick={() => setLayout('columns')}
            className={`rounded-full border px-2 py-2 text-sm font-medium transition active:scale-95 ${layout === 'columns' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}
          >
            세로 테이블
          </button>
          <button
            type="button"
            onClick={() => setLayout('rows')}
            className={`rounded-full border px-2 py-2 text-sm font-medium transition active:scale-95 ${layout === 'rows' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}
          >
            가로 테이블
          </button>
        </div>
        {layout !== 'wall' && (
          <input
            value={columnsText}
            onChange={(e) => setColumnsText(e.target.value)}
            placeholder="섹션 이름을 쉼표로 구분 (예: 월,화,수)"
            className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}
        <button type="button" disabled={!title.trim() || creating} onClick={handleCreate} className="btn-fill w-full">
          {creating ? '만드는 중...' : '만들기'}
        </button>
      </section>

      <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm">
        <h2 className="mb-4 font-bold">코드로 입장</h2>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="6자리 코드"
            className="flex-1 rounded-full border border-[var(--color-border)] bg-transparent px-3.5 py-2 text-sm uppercase outline-none focus:border-[var(--color-accent)]"
            maxLength={8}
          />
          <button type="button" onClick={handleJoin} className="btn-outline">
            입장
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm">
        <h2 className="mb-1 font-bold">패들렛에서 가져오기</h2>
        <p className="mb-4 text-xs leading-relaxed text-[var(--color-sub)]">
          패들렛은 자동 접속을 막고 있어서, 아래 버튼을 <b>즐겨찾기줄로 드래그</b>해 등록한 뒤 본인 패들렛 보드를 열고
          클릭하면 글·이미지·섹션이 담긴 파일이 다운로드됩니다. 그 파일을 여기 업로드하면 담벼락이 만들어져요.
        </p>
        <BookmarkletLink
          href={bookmarkletHref()}
          className="mb-3 inline-flex cursor-grab items-center gap-1.5 rounded-full border-2 border-dashed border-[var(--color-accent)] px-3.5 py-2 text-[13.5px] font-bold text-[var(--color-accent)]"
        >
          📥 담벼락으로 가져오기
        </BookmarkletLink>
        <p className="mb-3 text-xs text-[var(--color-sub)]">↑ 이 버튼을 즐겨찾기줄로 끌어다 놓으세요 (클릭은 동작하지 않아요)</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
        {importError && <p className="mb-3 text-sm text-red-500">{importError}</p>}
        <button
          type="button"
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline w-full border-[var(--color-accent)] text-[var(--color-accent)]"
        >
          {importing ? '가져오는 중...' : 'padlet-export.json 업로드'}
        </button>
      </section>

      <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm">
        <h2 className="mb-1 font-bold">패들렛 API로 가져오기</h2>
        <p className="mb-4 text-xs leading-relaxed text-[var(--color-sub)]">
          패들렛 유료 요금제의 API 키가 있다면 북마클릿 없이 바로 가져올 수 있어요. API 키는 이 브라우저에서 패들렛으로 곧장
          전송되고 문수네집 서버는 거치지 않아요.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API 키"
          className="mb-2 w-full rounded-full border border-[var(--color-border)] bg-transparent px-3.5 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <label className="mb-3 flex items-center gap-1.5 text-xs text-[var(--color-sub)]">
          <input type="checkbox" checked={rememberApiKey} onChange={(e) => setRememberApiKey(e.target.checked)} />
          이 브라우저에 API 키 기억하기
        </label>
        <input
          value={apiBoardId}
          onChange={(e) => setApiBoardId(e.target.value)}
          placeholder="보드 ID 또는 패들렛 링크"
          className="mb-3 w-full rounded-full border border-[var(--color-border)] bg-transparent px-3.5 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        {apiImportError && <p className="mb-3 text-sm text-red-500">{apiImportError}</p>}
        <button
          type="button"
          disabled={!apiKey.trim() || !apiBoardId.trim() || apiImporting}
          onClick={handleApiImport}
          className="btn-fill w-full"
        >
          {apiImporting ? '가져오는 중...' : 'API로 가져오기'}
        </button>
      </section>

      <MoonsuneCredit />
    </div>
  )
}
