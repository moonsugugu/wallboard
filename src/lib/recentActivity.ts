import { fetchRecentPosts } from './db'
import { getRecentBoards } from './recentBoards'

export type ActivityItem = {
  boardCode: string
  boardTitle: string
  author: string
  text: string
  attachmentType: string
  createdAt: number
}

export async function fetchRecentActivity(maxBoards = 4, perBoard = 3): Promise<ActivityItem[]> {
  const boards = getRecentBoards().slice(0, maxBoards)
  const results = await Promise.all(
    boards.map(async (b) => {
      try {
        const posts = await fetchRecentPosts(b.code, perBoard)
        return posts.map((p) => ({
          boardCode: b.code,
          boardTitle: b.title,
          author: p.author,
          text: p.text,
          attachmentType: p.attachmentType,
          createdAt: p.createdAt,
        }))
      } catch {
        return [] // 사라진 보드는 조용히 건너뛴다
      }
    }),
  )
  return results
    .flat()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6)
}
