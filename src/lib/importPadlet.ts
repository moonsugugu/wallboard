import type { AttachmentType, BoardLayout, PostColor } from '../types'

export type ImportedPost = {
  author: string
  text: string
  attachmentType: AttachmentType
  attachmentUrl?: string
  column: string | null
  color: PostColor
  createdAt: number
}

export type ImportResult = {
  title: string
  layout: BoardLayout
  columns: string[]
  posts: ImportedPost[]
}

const ATTACHMENT_TYPES: AttachmentType[] = ['none', 'image', 'link', 'video']

export async function parseExportFile(file: File): Promise<ImportResult> {
  const text = await file.text()
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('올바른 JSON 파일이 아니에요. 북마클릿으로 받은 padlet-export.json 파일이 맞는지 확인해주세요.')
  }
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as Record<string, unknown>).posts)) {
    throw new Error('가져오기 파일 형식이 올바르지 않아요.')
  }
  const data = raw as {
    title?: unknown
    layout?: unknown
    columns?: unknown
    posts: unknown[]
  }
  const layout: BoardLayout = data.layout === 'shelf' ? 'shelf' : 'wall'
  const columns = Array.isArray(data.columns) ? data.columns.filter((c): c is string => typeof c === 'string') : []
  const posts: ImportedPost[] = data.posts.map((p) => {
    const post = p as Record<string, unknown>
    // 예전 북마클릿 파일(imageUrl만 있던 버전) 호환
    const attachmentUrl = typeof post.attachmentUrl === 'string' ? post.attachmentUrl : typeof post.imageUrl === 'string' ? post.imageUrl : undefined
    const rawType = post.attachmentType
    const attachmentType: AttachmentType = ATTACHMENT_TYPES.includes(rawType as AttachmentType)
      ? (rawType as AttachmentType)
      : attachmentUrl
        ? 'image'
        : 'none'
    return {
      author: typeof post.author === 'string' ? post.author : '',
      text: typeof post.text === 'string' ? post.text : '',
      attachmentType,
      attachmentUrl,
      column: typeof post.column === 'string' ? post.column : null,
      color: typeof post.color === 'string' ? (post.color as PostColor) : '#ffffff',
      createdAt: typeof post.createdAt === 'number' ? post.createdAt : Date.now(),
    }
  })
  return {
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : '가져온 담벼락',
    layout,
    columns,
    posts,
  }
}
