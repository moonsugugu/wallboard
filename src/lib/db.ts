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
import type { Board, BoardLayout, Post } from '../types'

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

const MINE_KEY_PREFIX = 'wallboard:mine:'

export function rememberMine(code: string, postId: string) {
  const key = MINE_KEY_PREFIX + code
  try {
    const list: string[] = JSON.parse(localStorage.getItem(key) || '[]')
    list.push(postId)
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

export function isMine(code: string, postId: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(MINE_KEY_PREFIX + code) || '[]')
    return list.includes(postId)
  } catch {
    return false
  }
}
