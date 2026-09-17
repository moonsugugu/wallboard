import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddPostModal, { type PostFormValue } from '../components/AddPostModal'
import BoardSettingsModal from '../components/BoardSettingsModal'
import ColumnsLayout from '../components/ColumnsLayout'
import RowsLayout from '../components/RowsLayout'
import WallLayout from '../components/WallLayout'
import type { PostActions } from '../components/postActions'
import { resolveBoardStyle } from '../lib/boardBackground'
import {
  addComment,
  addPost,
  addReaction,
  isMine,
  removeComment,
  removePost,
  removeReaction,
  rememberMine,
  subscribeBoard,
  subscribeComments,
  subscribePosts,
  subscribeReactions,
  updateBoard,
  updatePost,
} from '../lib/db'
import { normalizeBoardCode } from '../lib/roomCode'
import { getVoterKey } from '../lib/voter'
import type { Board as BoardDoc, Comment, Post, Reaction, ReactionEmoji } from '../types'

type ModalState = { mode: 'add'; column: string | null } | { mode: 'edit'; postId: string; initial: PostFormValue }

export default function Board() {
  const { code = '' } = useParams()
  const boardCode = normalizeBoardCode(code)
  const voterKey = useMemo(() => getVoterKey(), [])

  const [board, setBoard] = useState<(BoardDoc & { id: string }) | null | undefined>(undefined)
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const unsubBoard = subscribeBoard(boardCode, setBoard)
    const unsubPosts = subscribePosts(boardCode, setPosts)
    const unsubComments = subscribeComments(boardCode, setComments)
    const unsubReactions = subscribeReactions(boardCode, setReactions)
    return () => {
      unsubBoard()
      unsubPosts()
      unsubComments()
      unsubReactions()
    }
  }, [boardCode])

  const reactionsByPost = useMemo(() => {
    const map = new Map<string, Reaction[]>()
    for (const r of reactions) {
      if (!map.has(r.postId)) map.set(r.postId, [])
      map.get(r.postId)!.push(r)
    }
    return map
  }, [reactions])

  const commentsByPost = useMemo(() => {
    const map = new Map<string, Comment[]>()
    for (const c of comments) {
      if (!map.has(c.postId)) map.set(c.postId, [])
      map.get(c.postId)!.push(c)
    }
    return map
  }, [comments])

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

  async function handleToggleReaction(postId: string, emoji: ReactionEmoji) {
    const mine = (reactionsByPost.get(postId) ?? []).some((r) => r.emoji === emoji && r.voterKey === voterKey)
    if (mine) await removeReaction(boardCode, postId, emoji)
    else await addReaction(boardCode, postId, emoji)
  }

  async function handleAddComment(postId: string, author: string, text: string) {
    const commentId = await addComment(boardCode, postId, author, text)
    rememberMine(boardCode, commentId, 'comments')
  }

  const actions: PostActions | null = board
    ? {
        isMine: (id) => isMine(boardCode, id),
        onEdit: openEdit,
        onDelete: handleDelete,
        reactionsByPost,
        commentsByPost,
        voterKey,
        onToggleReaction: handleToggleReaction,
        onAddComment: handleAddComment,
        onDeleteComment: (commentId) => removeComment(boardCode, commentId),
        isMineComment: (id) => isMine(boardCode, id, 'comments'),
      }
    : null

  if (board === undefined) {
    return <p className="p-10 text-center text-[var(--color-sub)]">불러오는 중...</p>
  }
  if (board === null || !actions) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-[var(--color-sub)]">코드 {boardCode}에 해당하는 담벼락을 찾을 수 없어요.</p>
        <Link to="/" className="text-[var(--color-accent)] underline">
          홈으로 가기
        </Link>
      </div>
    )
  }

  const shareUrl = window.location.href

  return (
    <div className="mx-auto min-h-full max-w-6xl px-4 py-6" style={resolveBoardStyle(board)}>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-xs text-[var(--color-sub)] hover:underline">
            ← 홈
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--color-ink)]">{board.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-ink)]"
        >
          ⚙️ 코드 {boardCode} · 공유/설정
        </button>
      </header>

      {board.layout === 'wall' && <WallLayout posts={posts} actions={actions} />}
      {board.layout === 'columns' && (
        <ColumnsLayout columns={board.columns} posts={posts} actions={actions} onAddTo={(col) => setModal({ mode: 'add', column: col })} />
      )}
      {board.layout === 'rows' && (
        <RowsLayout columns={board.columns} posts={posts} actions={actions} onAddTo={(col) => setModal({ mode: 'add', column: col })} />
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

      {settingsOpen && (
        <BoardSettingsModal
          board={board}
          shareUrl={shareUrl}
          onClose={() => setSettingsOpen(false)}
          onSave={async (patch) => {
            await updateBoard(boardCode, patch)
            setSettingsOpen(false)
          }}
        />
      )}
    </div>
  )
}
