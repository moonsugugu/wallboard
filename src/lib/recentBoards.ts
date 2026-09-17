import type { BoardLayout } from '../types'

export type RecentBoard = { code: string; title: string; layout: BoardLayout; visitedAt: number }

const KEY = 'wallboard:recent'
const MAX = 12

export function getRecentBoards(): RecentBoard[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function rememberBoardVisit(board: RecentBoard) {
  try {
    const list = getRecentBoards().filter((b) => b.code !== board.code)
    list.unshift(board)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

export function forgetBoard(code: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getRecentBoards().filter((b) => b.code !== code)))
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}
