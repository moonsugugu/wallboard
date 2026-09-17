import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AddPostModal, { type PostFormValue } from '../components/AddPostModal'
import BoardSettingsModal from '../components/BoardSettingsModal'
import ChatPanel from '../components/ChatPanel'
import ColumnsLayout from '../components/ColumnsLayout'
import NicknamePrompt from '../components/NicknamePrompt'
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
  sendChatMessage,
  subscribeBoard,
  subscribeChat,
  subscribeComments,
  subscribePosts,
  subscribeReactions,
  updateBoard,
  updatePost,
} from '../lib/db'
import { getNickname, hasAskedNickname, setNickname } from '../lib/nickname'
import { forgetBoard, rememberBoardVisit } from '../lib/recentBoards'
import { normalizeBoardCode } from '../lib/roomCode'
import { getVoterKey } from '../lib/voter'
import type { Board as BoardDoc, ChatMessage, Comment, Post, Reaction, ReactionEmoji } from '../types'

type ModalState = { mode: 'add'; column: string | null } | { mode: 'edit'; postId: string; initial: PostFormValue }

export default function Board() {
  const { code = '' } = useParams()
  const boardCode = normalizeBoardCode(code)
  const voterKey = useMemo(() => getVoterKey(), [])

  const [board, setBoard] = useState<(BoardDoc & { id: string }) | null | undefined>(undefined)
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [modal, setModal] = useState<ModalState | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [nickname, setNicknameState] = useState(() => getNickname())
  const [nicknameAsked, setNicknameAsked] = useState(() => hasAskedNickname())

  useEffect(() => {
    const unsubBoard = subscribeBoard(boardCode, setBoard)
    const unsubPosts = subscribePosts(boardCode, setPosts)
    const unsubComments = subscribeComments(boardCode, setComments)
    const unsubReactions = subscribeReactions(boardCode, setReactions)
    const unsubChat = subscribeChat(boardCode, setChatMessages)
    return () => {
      unsubBoard()
      unsubPosts()
      unsubComments()
      unsubReactions()
      unsubChat()
    }
  }, [boardCode])

  useEffect(() => {
    if (board) rememberBoardVisit({ code: boardCode, title: board.title, layout: board.layout, visitedAt: Date.now() })
    if (board === null) forgetBoard(boardCode)
  }, [boardCode, board])

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
        nickname,
        onToggleReaction: handleToggleReaction,
        onAddComment: handleAddComment,
        onDeleteComment: (commentId) => removeComment(boardCode, commentId),
        isMineComment: (id) => isMine(boardCode, id, 'comments'),
      }
    : null

  if (board === undefined) {
    return <p className="p-16 text-center text-sm text-[var(--color-sub)]">불러오는 중…</p>
  }
  if (board === null || !actions) {
    return (
      <div className="p-16 text-center">
        <p className="mb-2 font-display text-[22px] text-[var(--color-ink)]">담벼락을 찾을 수 없어요</p>
        <p className="mb-6 text-sm text-[var(--color-sub)]">코드 {boardCode}에 해당하는 담벼락이 없습니다.</p>
        <Link to="/" className="btn-outline inline-block">
          홈으로 가기
        </Link>
      </div>
    )
  }

  const shareUrl = window.location.href

  return (
    <div className="mx-auto min-h-full max-w-6xl rounded-[32px] px-4 py-8 sm:px-6" style={resolveBoardStyle(board)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/" className="eyebrow transition hover:text-[var(--color-accent)]">
            ← 홈으로
          </Link>
          <h1 className="mt-2 font-display text-[32px] leading-tight text-[var(--color-ink)] sm:text-[38px]">{board.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="btn-outline text-[var(--color-ink)]"
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

      <button
        type="button"
        onClick={() => setChatOpen((v) => !v)}
        style={{ boxShadow: 'var(--shadow-lift)' }}
        className={`fixed bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-transform duration-150 active:scale-90 ${
          board.layout === 'wall' ? 'right-24' : 'right-6'
        } ${chatOpen ? 'bg-[#2f2a25] text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink)]'}`}
        aria-label="실시간 채팅"
      >
        💬
      </button>

      {board.layout === 'wall' && (
        <button
          type="button"
          onClick={() => setModal({ mode: 'add', column: null })}
          style={{ boxShadow: 'var(--shadow-lift)' }}
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl font-light text-white transition-transform duration-150 active:scale-90"
          aria-label="포스트잇 추가"
        >
          +
        </button>
      )}

      {chatOpen && (
        <ChatPanel
          messages={chatMessages}
          defaultAuthor={nickname}
          onClose={() => setChatOpen(false)}
          onSend={(author, text) => sendChatMessage(boardCode, author, text)}
        />
      )}

      {modal && (
        <AddPostModal
          columns={board.columns}
          defaultColumn={modal.mode === 'add' ? modal.column : modal.initial.column}
          defaultAuthor={nickname}
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

      {!nicknameAsked && (
        <NicknamePrompt
          boardTitle={board.title}
          onDone={(name) => {
            setNickname(name)
            setNicknameState(name)
            setNicknameAsked(true)
          }}
        />
      )}
    </div>
  )
}
