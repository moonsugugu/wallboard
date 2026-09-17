import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from './postgres-firestore'
import { generateBoardCode } from './roomCode'
import { getVoterKey } from './voter'
import type { Board, BoardLayout, Comment, Post, Reaction, ReactionEmoji } from '../types'

const db = null // postgres-firestore 어댑터는 db 인자를 경로에 쓰지 않으므로 자리표시자

export async function createBoard(title: string, layout: BoardLayout, columns: string[]) {
  let code = generateBoardCode()
  // 코드 충돌 방지 (극히 드물지만 한 번은 확인)
  for (let i = 0; i < 5; i++) {
    const existing = await getDoc(doc(db, 'boards', code))
    if (!existing.exists()) break
    code = generateBoardCode()
  }
  const board: Board = { title, layout, columns, createdAt: Date.now() }
  await setDoc(doc(db, 'boards', code), board)
  return code
}

export async function fetchBoard(code: string): Promise<(Board & { id: string }) | null> {
  const snap = await getDoc(doc(db, 'boards', code))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Board) }
}

export function subscribeBoard(code: string, cb: (board: (Board & { id: string }) | null) => void) {
  return onSnapshot(doc(db, 'boards', code), (snap: any) => {
    cb(snap.exists() ? { id: snap.id, ...(snap.data() as Board) } : null)
  })
}

export async function updateBoard(code: string, patch: Partial<Omit<Board, 'createdAt'>>) {
  await updateDoc(doc(db, 'boards', code), patch)
}

export function subscribePosts(code: string, cb: (posts: Post[]) => void) {
  const q = query(collection(db, 'boards', code, 'posts'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap: any) => {
    cb(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Post))
  })
}

export async function addPost(code: string, post: Omit<Post, 'id' | 'createdAt'>, createdAt?: number) {
  const ref = await addDoc(collection(db, 'boards', code, 'posts'), {
    ...post,
    createdAt: createdAt ?? serverTimestamp(),
  })
  return ref.id
}

export async function removePost(code: string, postId: string) {
  await deleteDoc(doc(db, 'boards', code, 'posts', postId))
}

export async function updatePost(code: string, postId: string, patch: Partial<Omit<Post, 'id' | 'createdAt'>>) {
  await updateDoc(doc(db, 'boards', code, 'posts', postId), patch)
}

// 댓글: post마다 하위 컬렉션에 몰지 않고 board 아래 평평한 컬렉션에 postId를 들고 다니게 한다.
// (postgres-firestore 실시간 구독은 경로의 앞 두 조각(boards/{code})만 보므로,
//  post별로 따로 구독을 열지 않아도 댓글이 몇 개든 이 컬렉션 하나로 실시간 반영된다.)
export function subscribeComments(code: string, cb: (comments: Comment[]) => void) {
  const q = query(collection(db, 'boards', code, 'comments'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap: any) => {
    cb(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Comment))
  })
}

export async function addComment(code: string, postId: string, author: string, text: string) {
  const ref = await addDoc(collection(db, 'boards', code, 'comments'), {
    postId,
    author,
    text,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function removeComment(code: string, commentId: string) {
  await deleteDoc(doc(db, 'boards', code, 'comments', commentId))
}

// 좋아요/이모지 반응: 같은 이유로 board 아래 평평한 컬렉션. 문서 id를 postId+voterKey+emoji로
// 고정해 같은 사람이 같은 이모지를 두 번 누르면 자동으로 "취소"가 되게 한다(토글).
const EMOJI_SLUG: Record<string, string> = { '❤️': 'heart', '👍': 'like', '😂': 'laugh', '😮': 'wow', '😢': 'sad', '🎉': 'party' }

export function reactionId(postId: string, emoji: ReactionEmoji) {
  return `${postId}__${getVoterKey()}__${EMOJI_SLUG[emoji] ?? 'x'}`
}

export function subscribeReactions(code: string, cb: (reactions: Reaction[]) => void) {
  const q = collection(db, 'boards', code, 'reactions')
  return onSnapshot(q, (snap: any) => {
    cb(snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Reaction))
  })
}

export async function addReaction(code: string, postId: string, emoji: ReactionEmoji) {
  const id = reactionId(postId, emoji)
  await setDoc(doc(db, 'boards', code, 'reactions', id), {
    postId,
    emoji,
    voterKey: getVoterKey(),
    createdAt: serverTimestamp(),
  })
}

export async function removeReaction(code: string, postId: string, emoji: ReactionEmoji) {
  await deleteDoc(doc(db, 'boards', code, 'reactions', reactionId(postId, emoji)))
}

type MineKind = 'posts' | 'comments'

function mineKey(kind: MineKind, code: string) {
  return `wallboard:mine:${kind}:${code}`
}

export function rememberMine(code: string, id: string, kind: MineKind = 'posts') {
  const key = mineKey(kind, code)
  try {
    const list: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    list.push(id)
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

export function isMine(code: string, id: string, kind: MineKind = 'posts') {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(mineKey(kind, code)) || '[]')
    return list.includes(id)
  } catch {
    return false
  }
}
