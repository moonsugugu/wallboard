export type BoardLayout = 'wall' | 'columns' | 'rows'

export const BOARD_BACKGROUNDS = [
  { key: 'default', label: '기본', css: '' },
  { key: 'cream', label: '크림', css: '#f4f1ea' },
  { key: 'sky', label: '하늘', css: '#e8f2fb' },
  { key: 'mint', label: '민트', css: '#e7f6ef' },
  { key: 'blush', label: '블러쉬', css: '#fdeef0' },
  { key: 'lilac', label: '라일락', css: '#f1ecfb' },
  { key: 'sunset', label: '노을', css: 'linear-gradient(135deg,#ffd6a5,#ff9a8b)' },
  { key: 'ocean', label: '바다', css: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)' },
  { key: 'forest', label: '숲', css: 'linear-gradient(135deg,#d4fc79,#96e6a1)' },
  { key: 'night', label: '밤', css: 'linear-gradient(135deg,#232526,#414345)' },
] as const
export type BoardBackgroundKey = (typeof BOARD_BACKGROUNDS)[number]['key']

export type Board = {
  title: string
  layout: BoardLayout
  columns: string[] // columns/rows 레이아웃일 때만 사용
  backgroundKey?: BoardBackgroundKey
  backgroundImageUrl?: string // 지정하면 backgroundKey보다 우선
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

export const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🎉'] as const
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number]

export type Reaction = {
  id: string
  postId: string
  emoji: ReactionEmoji
  voterKey: string
  createdAt: number
}

export type Comment = {
  id: string
  postId: string
  author: string
  text: string
  createdAt: number
}

export type ChatMessage = {
  id: string
  author: string
  text: string
  createdAt: number
}
