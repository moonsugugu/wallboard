import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSubmitEnter } from '../lib/keys'
import BoardCard from '../components/BoardCard'
import CreateBoardModal from '../components/CreateBoardModal'
import FolderBar, { type FolderFilter } from '../components/FolderBar'
import HomeGreeting from '../components/HomeGreeting'
import HomeSidebar from '../components/HomeSidebar'
import ImportModal from '../components/ImportModal'
import MoonsuneCredit from '../components/MoonsuneCredit'
import MoveToFolderModal from '../components/MoveToFolderModal'
import {
  createFolder,
  deleteFolder,
  folderName,
  getFolders,
  renameFolder,
} from '../lib/boardFolders'
import { timeAgo } from '../lib/boardTheme'
import { addPost, createBoard } from '../lib/db'
import { parseExportFile, type ImportResult } from '../lib/importPadlet'
import { importFromPadletApi } from '../lib/padletApiImport'
import { clearSavedPadletApiKey, getSavedPadletApiKey, savePadletApiKey } from '../lib/padletApiKey'
import { fetchRecentActivity, type ActivityItem } from '../lib/recentActivity'
import { forgetBoard, getRecentBoards, setBoardFolder, unfileBoardsIn } from '../lib/recentBoards'
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
  const [folders, setFolders] = useState(() => getFolders())
  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all')
  const [movingBoard, setMovingBoard] = useState<string | null>(null)
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

  const searchTerm = search.trim()
  const matchesSearch = (b: (typeof recentBoards)[number]) =>
    !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.code.includes(searchTerm.toUpperCase())

  // 검색어는 폴더 개수에도 함께 적용한다 — 칩에 적힌 수와 실제로 보이는 카드 수가 어긋나지 않게.
  const searched = recentBoards.filter(matchesSearch)
  const counts = {
    all: searched.length,
    unfiled: searched.filter((b) => !b.folderId).length,
    byFolder: Object.fromEntries(folders.map((f) => [f.id, searched.filter((b) => b.folderId === f.id).length])),
  }

  const visibleBoards = searched.filter((b) => {
    if (folderFilter === 'all') return true
    if (folderFilter === 'unfiled') return !b.folderId
    return b.folderId === folderFilter
  })

  function refreshBoards() {
    setRecentBoards(getRecentBoards())
  }

  function handleCreateFolder(name: string) {
    const folder = createFolder(name)
    if (!folder) return
    setFolders(getFolders())
    setFolderFilter(folder.id)
  }

  function handleDeleteFolder(id: string) {
    const name = folders.find((f) => f.id === id)?.name ?? '폴더'
    // 폴더만 없애고 안에 있던 담벼락은 남긴다 — 분류를 지우는 것과 담벼락을 지우는 건 다른 일이다.
    if (!confirm(`'${name}' 폴더를 지울까요?\n안에 있던 담벼락은 지워지지 않고 '미분류'로 돌아갑니다.`)) return
    unfileBoardsIn(id)
    deleteFolder(id)
    setFolders(getFolders())
    refreshBoards()
    setFolderFilter('all')
  }

  function handleMove(code: string, folderId: string | null) {
    setBoardFolder(code, folderId)
    refreshBoards()
    setMovingBoard(null)
  }

  function handleCreateFolderAndMove(code: string, name: string) {
    const folder = createFolder(name)
    if (!folder) return
    setFolders(getFolders())
    handleMove(code, folder.id)
  }

  const movingBoardData = movingBoard ? recentBoards.find((b) => b.code === movingBoard) : undefined

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
    <div className="mx-auto flex min-h-full max-w-6xl gap-10 px-4 py-8 sm:px-6">
      <HomeSidebar
        active="home"
        onNavigate={(key) => {
          if (key === 'import') setImportOpen(true)
          if (key === 'boards') document.getElementById('my-boards')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col gap-7">
        <HomeGreeting nickname={nickname} search={search} onSearch={setSearch} />

        <section
          className="flex flex-col gap-4 rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div>
            <p className="eyebrow mb-1.5">Join</p>
            <p className="font-display text-[20px] leading-snug text-[var(--color-ink)]">코드로 입장하기</p>
            <p className="mt-0.5 text-xs text-[var(--color-sub)]">선생님이 알려준 6자리 코드를 입력하세요</p>
          </div>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => isSubmitEnter(e) && handleJoin()}
              placeholder="예: ABC123"
              className="w-32 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2 text-sm uppercase tracking-[0.12em] outline-none transition focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
              maxLength={8}
            />
            <button type="button" onClick={handleJoin} className="btn-outline">
              입장
            </button>
          </div>
        </section>

        <section id="my-boards">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow mb-1.5">Collection</p>
              <h2 className="font-display text-[26px] leading-none text-[var(--color-ink)]">
                내 담벼락{' '}
                <span className="text-[14px] text-[var(--color-sub)]" style={{ fontFamily: 'var(--font-sans)' }}>
                  {visibleBoards.length}
                </span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setImportOpen(true)} className="btn-outline lg:hidden">
                📥 가져오기
              </button>
              <button type="button" onClick={() => setCreateOpen(true)} className="btn-fill">
                + 새 담벼락 만들기
              </button>
            </div>
          </div>

          {recentBoards.length > 0 && (
            <FolderBar
              folders={folders}
              active={folderFilter}
              counts={counts}
              onSelect={setFolderFilter}
              onCreate={handleCreateFolder}
              onRename={(id, name) => {
                renameFolder(id, name)
                setFolders(getFolders())
              }}
              onDelete={handleDeleteFolder}
            />
          )}

          {visibleBoards.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/60 px-6 py-16 text-center">
              <div className="mb-3 text-3xl opacity-60">🪧</div>
              <p className="font-display text-[19px] text-[var(--color-ink)]">
                {searchTerm ? '검색 결과가 없어요' : folderFilter === 'all' ? '아직 담벼락이 없어요' : '이 폴더는 비어 있어요'}
              </p>
              <p className="mt-1.5 text-sm text-[var(--color-sub)]">
                {searchTerm
                  ? '다른 이름이나 코드로 찾아보세요.'
                  : folderFilter === 'all'
                    ? '새로 만들어 첫 생각을 붙여보세요.'
                    : '담벼락 카드에 마우스를 올려 📁 버튼으로 옮겨올 수 있어요.'}
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
                  folderName={folderName(folders, b.folderId)}
                  onOpen={() => navigate(`/board/${b.code}`)}
                  onMoveToFolder={() => setMovingBoard(b.code)}
                  onForget={() => {
                    forgetBoard(b.code)
                    refreshBoards()
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {activity.length > 0 && (
          <section
            className="rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <p className="eyebrow mb-1.5 px-1">Activity</p>
            <h2 className="mb-4 px-1 font-display text-[22px] leading-none text-[var(--color-ink)]">최근 활동</h2>
            <ul className="flex flex-col gap-1">
              {activity.map((a, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => navigate(`/board/${a.boardCode}`)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-[var(--color-surface-2)] active:scale-[0.99]"
                  >
                    <span className="text-base opacity-70">
                      {a.attachmentType === 'image' ? '🖼️' : a.attachmentType === 'video' ? '🎬' : '📝'}
                    </span>
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

      {movingBoardData && (
        <MoveToFolderModal
          boardTitle={movingBoardData.title}
          folders={folders}
          currentFolderId={movingBoardData.folderId ?? null}
          onClose={() => setMovingBoard(null)}
          onMove={(folderId) => handleMove(movingBoardData.code, folderId)}
          onCreateAndMove={(name) => handleCreateFolderAndMove(movingBoardData.code, name)}
        />
      )}

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
