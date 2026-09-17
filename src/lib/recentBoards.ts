import type { BoardLayout } from '../types'

export type RecentBoard = {
  code: string
  title: string
  layout: BoardLayout
  visitedAt: number
  folderId?: string | null // 폴더에 넣지 않았으면 없음/null
}

const KEY = 'wallboard:recent'
// 폴더에 넣지 않은 담벼락만 최근 12개로 자른다. 폴더에 정리해둔 건 오래돼도 지우지 않는다
// (직접 분류해둔 걸 앱이 말없이 버리면 안 되므로).
const MAX_UNFILED = 12

export function getRecentBoards(): RecentBoard[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? (raw as RecentBoard[]) : []
  } catch {
    return []
  }
}

function save(list: RecentBoard[]) {
  try {
    let unfiled = 0
    const kept = list.filter((b) => {
      if (b.folderId) return true
      unfiled += 1
      return unfiled <= MAX_UNFILED
    })
    localStorage.setItem(KEY, JSON.stringify(kept))
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

export function rememberBoardVisit(board: Omit<RecentBoard, 'folderId'>) {
  const list = getRecentBoards()
  // 이미 있던 담벼락이면 분류해둔 폴더를 그대로 이어받는다.
  const folderId = list.find((b) => b.code === board.code)?.folderId ?? null
  save([{ ...board, folderId }, ...list.filter((b) => b.code !== board.code)])
}

export function forgetBoard(code: string) {
  save(getRecentBoards().filter((b) => b.code !== code))
}

export function setBoardFolder(code: string, folderId: string | null) {
  save(getRecentBoards().map((b) => (b.code === code ? { ...b, folderId } : b)))
}

// 폴더를 지웠을 때, 그 안에 있던 담벼락을 '미분류'로 돌려보낸다.
export function unfileBoardsIn(folderId: string) {
  save(getRecentBoards().map((b) => (b.folderId === folderId ? { ...b, folderId: null } : b)))
}
