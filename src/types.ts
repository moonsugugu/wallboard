export type BoardLayout = 'wall' | 'shelf'

export type Board = {
  title: string
  layout: BoardLayout
  columns: string[] // shelf 레이아웃일 때만 사용
  createdAt: number
}

export const POST_COLORS = ['#fff3b0', '#ffd6d6', '#d6f5e3', '#d6e6ff', '#ecd6ff', '#ffffff'] as const
export type PostColor = (typeof POST_COLORS)[number]

export type AttachmentType = 'none' | 'image' | 'link' | 'video'

export type Post = {
  id: string
  author: string
  text: string
  attachmentType: AttachmentType
  attachmentUrl?: string // image: data URL 또는 http(s) URL, link/video: http(s) URL
  color: PostColor
  column: string | null // wall 레이아웃이면 null
  createdAt: number
}
