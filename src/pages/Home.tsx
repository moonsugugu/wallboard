import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoardCard from '../components/BoardCard'
import CreateBoardModal from '../components/CreateBoardModal'
import HomeGreeting from '../components/HomeGreeting'
import HomeSidebar from '../components/HomeSidebar'
import ImportModal from '../components/ImportModal'
import MoonsuneCredit from '../components/MoonsuneCredit'
import { timeAgo } from '../lib/boardTheme'
import { addPost, createBoard } from '../lib/db'
import { parseExportFile, type ImportResult } from '../lib/importPadlet'
import { importFromPadletApi } from '../lib/padletApiImport'
import { clearSavedPadletApiKey, getSavedPadletApiKey, savePadletApiKey } from '../lib/padletApiKey'
import { fetchRecentActivity, type ActivityItem } from '../lib/recentActivity'
import { forgetBoard, getRecentBoards } from '../lib/recentBoards'
import { getNickname } from '../lib/nickname'
import { normalizeBoardCode } from '../lib/roomCode'
import type { BoardLayout } from '../types'
import { POST_COLORS } from '../types'

export default function Home() {
  const navigate = useNavigate()
  const nickname = getNickname()

  const [search, setSearch] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [recentBoards, setRecentBoards] = useState(() => getRecentBoards())
  const [activity, setActivity] = useState<ActivityItem[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [apiImporting, setApiImporting] = useState(false)
  const [apiImportError, setApiImportError] = useState('')

  useEffect(() => {
    fetchRecentActivity().then(setActivity).catch(() => setActivity([]))
  }, [])

  const visibleBoards = recentBoards.filter(
    (b) => !search.trim() || b.title.toLowerCase().includes(search.trim().toLowerCase()) || b.code.includes(search.trim().toUpperCase()),
  )

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

  async function handleCreate(title: string, layout: BoardLayout, columns: string[]) {
    if (creating) return
    setCreating(true)
    try {
      const code = await createBoard(title, layout, columns)
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
      await applyImportResult(await parseExportFile(file))
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '가져오기에 실패했습니다.')
    } finally {
      setImporting(false)
    }
  }

  async function handleApiImport(apiKey: string, boardId: string, remember: boolean) {
    if (apiImporting) return
    setApiImporting(true)
    setApiImportError('')
    try {
      if (remember) savePadletApiKey(apiKey)
      else clearSavedPadletApiKey()
      await applyImportResult(await importFromPadletApi(apiKey, boardId))
    } catch (e) {
      setApiImportError(e instanceof Error ? e.message : '가져오기에 실패했습니다.')
    } finally {
      setApiImporting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-6xl gap-8 px-4 py-8">
      <HomeSidebar
        active="home"
        onNavigate={(key) => {
          if (key === 'import') setImportOpen(true)
          if (key === 'boards') document.getElementById('my-boards')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col gap-6">
        <HomeGreeting nickname={nickname} search={search} onSearch={setSearch} />

        <section className="flex flex-col gap-3 rounded-3xl bg-[var(--color-surface)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-[var(--color-ink)]">코드로 입장</p>
            <p className="text-xs text-[var(--color-sub)]">선생님이 알려준 6자리 코드를 입력하세요</p>
          </div>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="예: ABC123"
              className="w-32 rounded-full border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm uppercase outline-none focus:border-[var(--color-accent)]"
              maxLength={8}
            />
            <button type="button" onClick={handleJoin} className="btn-outline">
              입장
            </button>
          </div>
        </section>

        <section id="my-boards">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[var(--color-ink)]">
              내 담벼락 <span className="text-sm font-semibold text-[var(--color-sub)]">{visibleBoards.length}</span>
            </h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => setImportOpen(true)} className="btn-outline lg:hidden">
                📥 가져오기
              </button>
              <button type="button" onClick={() => setCreateOpen(true)} className="btn-fill">
                + 새 담벼락 만들기
              </button>
            </div>
          </div>

          {visibleBoards.length === 0 ? (
            <div className="rounded-3xl bg-[var(--color-surface)] px-6 py-12 text-center shadow-sm">
              <div className="mb-2 text-4xl">🪧</div>
              <p className="text-sm text-[var(--color-sub)]">
                {search.trim() ? '검색 결과가 없어요.' : '아직 담벼락이 없어요. 새로 만들어 시작해보세요!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleBoards.map((b) => (
                <BoardCard
                  key={b.code}
                  code={b.code}
                  title={b.title}
                  layout={b.layout}
                  visitedAt={b.visitedAt}
                  onOpen={() => navigate(`/board/${b.code}`)}
                  onForget={() => {
                    forgetBoard(b.code)
                    setRecentBoards(getRecentBoards())
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {activity.length > 0 && (
          <section className="rounded-3xl bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="mb-3 font-extrabold text-[var(--color-ink)]">🕒 최근 활동</h2>
            <ul className="flex flex-col gap-1">
              {activity.map((a, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => navigate(`/board/${a.boardCode}`)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-black/5 active:scale-[0.99]"
                  >
                    <span className="text-lg">{a.attachmentType === 'image' ? '🖼️' : a.attachmentType === 'video' ? '🎬' : '📝'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[var(--color-ink)]">
                        <b>{a.author || '익명'}</b>님이 글을 올렸어요{a.text ? ` — ${a.text}` : ''}
                      </span>
                      <span className="block text-[11px] text-[var(--color-sub)]">
                        {a.boardTitle} · {timeAgo(a.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <MoonsuneCredit />
      </main>

      {createOpen && <CreateBoardModal creating={creating} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />}

      {importOpen && (
        <ImportModal
          importing={importing}
          importError={importError}
          apiImporting={apiImporting}
          apiImportError={apiImportError}
          savedApiKey={getSavedPadletApiKey()}
          onClose={() => setImportOpen(false)}
          onImportFile={handleImportFile}
          onApiImport={handleApiImport}
        />
      )}
    </div>
  )
}
