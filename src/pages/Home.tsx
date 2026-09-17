import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MoonsuneCredit from '../components/MoonsuneCredit'
import { addPost, createBoard } from '../lib/db'
import { parseExportFile } from '../lib/importPadlet'
import { bookmarkletHref } from '../lib/padletBookmarklet'
import { normalizeBoardCode } from '../lib/roomCode'
import type { BoardLayout } from '../types'
import { POST_COLORS } from '../types'

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

  async function handleCreate() {
    if (!title.trim() || creating) return
    setCreating(true)
    try {
      const columns =
        layout === 'shelf'
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
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '가져오기에 실패했습니다.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">담벼락</h1>
        <p className="mt-1 text-[var(--color-sub)]">우리 반 실시간 포스트잇 게시판</p>
      </header>

      <section className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm">
        <h2 className="mb-4 font-bold">새 담벼락 만들기</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (예: 3반 여름방학 계획)"
          className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setLayout('wall')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${layout === 'wall' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}
          >
            담벼락형
          </button>
          <button
            type="button"
            onClick={() => setLayout('shelf')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${layout === 'shelf' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)]'}`}
          >
            테이블형
          </button>
        </div>
        {layout === 'shelf' && (
          <input
            value={columnsText}
            onChange={(e) => setColumnsText(e.target.value)}
            placeholder="섹션 이름을 쉼표로 구분 (예: 월,화,수)"
            className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        )}
        <button
          type="button"
          disabled={!title.trim() || creating}
          onClick={handleCreate}
          className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
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
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm uppercase outline-none focus:border-[var(--color-accent)]"
            maxLength={8}
          />
          <button
            type="button"
            onClick={handleJoin}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
          >
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
        <a
          href={bookmarkletHref()}
          onClick={(e) => e.preventDefault()}
          draggable
          className="mb-3 inline-flex cursor-grab items-center gap-1.5 rounded-full border-2 border-dashed border-[var(--color-accent)] px-3.5 py-2 text-[13.5px] font-bold text-[var(--color-accent)]"
        >
          📥 담벼락으로 가져오기
        </a>
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
          className="w-full rounded-lg border border-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent)] disabled:opacity-40"
        >
          {importing ? '가져오는 중...' : 'padlet-export.json 업로드'}
        </button>
      </section>

      <MoonsuneCredit />
    </div>
  )
}
