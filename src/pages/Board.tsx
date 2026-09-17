import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddPostModal, { type PostFormValue } from '../components/AddPostModal'
import ShelfLayout from '../components/ShelfLayout'
import WallLayout from '../components/WallLayout'
import { addPost, isMine, rememberMine, removePost, subscribeBoard, subscribePosts, updatePost } from '../lib/db'
import { normalizeBoardCode } from '../lib/roomCode'
import type { Board as BoardDoc, Post } from '../types'

type ModalState = { mode: 'add'; column: string | null } | { mode: 'edit'; postId: string; initial: PostFormValue }

export default function Board() {
  const { code = '' } = useParams()
  const boardCode = normalizeBoardCode(code)

  const [board, setBoard] = useState<(BoardDoc & { id: string }) | null | undefined>(undefined)
  const [posts, setPosts] = useState<Post[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const unsubBoard = subscribeBoard(boardCode, setBoard)
    const unsubPosts = subscribePosts(boardCode, setPosts)
    return () => {
      unsubBoard()
      unsubPosts()
    }
  }, [boardCode])

  async function handleSubmit(input: PostFormValue) {
    if (modal?.mode === 'edit') {
      await updatePost(boardCode, modal.postId, input)
    } else {
      const postId = await addPost(boardCode, input)
      rememberMine(boardCode, postId)
    }
    setModal(null)
  }

  async function handleDelete(postId: string) {
    if (!confirm('이 포스트잇을 삭제할까요?')) return
    await removePost(boardCode, postId)
  }

  function openEdit(postId: string) {
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    setModal({
      mode: 'edit',
      postId,
      initial: {
        author: post.author,
        text: post.text,
        attachmentType: post.attachmentType,
        attachmentUrl: post.attachmentUrl,
        color: post.color,
        column: post.column,
      },
    })
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (board === undefined) {
    return <p className="p-10 text-center text-[var(--color-sub)]">불러오는 중...</p>
  }
  if (board === null) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-[var(--color-sub)]">코드 {boardCode}에 해당하는 담벼락을 찾을 수 없어요.</p>
        <Link to="/" className="text-[var(--color-accent)] underline">
          홈으로 가기
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-full max-w-6xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-xs text-[var(--color-sub)] hover:underline">
            ← 홈
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink)]">{board.title}</h1>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold"
        >
          코드 {boardCode} {copied ? '복사됨' : '· 링크 복사'}
        </button>
      </header>

      {board.layout === 'wall' ? (
        <WallLayout posts={posts} isMine={(id) => isMine(boardCode, id)} onEdit={openEdit} onDelete={handleDelete} />
      ) : (
        <ShelfLayout
          columns={board.columns}
          posts={posts}
          isMine={(id) => isMine(boardCode, id)}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAddTo={(col) => setModal({ mode: 'add', column: col })}
        />
      )}

      {board.layout === 'wall' && (
        <button
          type="button"
          onClick={() => setModal({ mode: 'add', column: null })}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl font-bold text-white shadow-lg"
          aria-label="포스트잇 추가"
        >
          +
        </button>
      )}

      {modal && (
        <AddPostModal
          columns={board.columns}
          defaultColumn={modal.mode === 'add' ? modal.column : modal.initial.column}
          initial={modal.mode === 'edit' ? modal.initial : undefined}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
