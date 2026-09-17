export type BoardLayout = 'wall' | 'columns' | 'rows'

export const BOARD_BACKGROUNDS = [
  { key: 'default', label: '기본', css: '' },
  { key: 'cream', label: '크림', css: '#f4f1ea' },
  { key: 'sky', label: '하늘', css: '#e4ecf3' },
  { key: 'mint', label: '세이지', css: '#e5ebdf' },
  { key: 'blush', label: '블러쉬', css: '#f8e6e1' },
  { key: 'lilac', label: '라일락', css: '#ebe7f3' },
  { key: 'sunset', label: '노을', css: 'linear-gradient(135deg,#f6e3cf,#efd0c6)' },
  { key: 'ocean', label: '바다', css: 'linear-gradient(135deg,#dde8f0,#e9eef2)' },
  { key: 'forest', label: '숲', css: 'linear-gradient(135deg,#e2ead9,#d3e0d0)' },
  { key: 'night', label: '밤', css: 'linear-gradient(135deg,#3b3733,#4a443d)' },
] as const
export type BoardBackgroundKey = (typeof BOARD_BACKGROUNDS)[number]['key']

// 배경 그림. public/backgrounds/ 에 들어 있는 SVG라서 외부 요청이 없고 전부 합쳐 15KB 남짓이다.
// 글이 위에 얹히므로 전부 밝게 유지한다(어두워지면 포스트잇 글씨가 안 읽힌다).
export const BOARD_BACKGROUND_IMAGES = [
  { key: 'paper', label: '종이', url: '/backgrounds/paper.svg' },
  { key: 'dawn', label: '새벽', url: '/backgrounds/dawn.svg' },
  { key: 'sage', label: '풀빛', url: '/backgrounds/sage.svg' },
  { key: 'sky', label: '하늘', url: '/backgrounds/sky.svg' },
  { key: 'lilac', label: '라일락', url: '/backgrounds/lilac.svg' },
  { key: 'terrazzo', label: '테라조', url: '/backgrounds/terrazzo.svg' },
  { key: 'grid', label: '모눈', url: '/backgrounds/grid.svg' },
  { key: 'waves', label: '물결', url: '/backgrounds/waves.svg' },
  { key: 'dots', label: '물방울', url: '/backgrounds/dots.svg' },
  { key: 'sunset', label: '노을', url: '/backgrounds/sunset.svg' },
] as const

export type Board = {
  title: string
  layout: BoardLayout
  columns: string[] // columns/rows 레이아웃일 때만 사용
  backgroundKey?: BoardBackgroundKey
  backgroundImageUrl?: string // 지정하면 backgroundKey보다 우선
  createdAt: number
}

// 포스트잇 색 — 채도를 낮춘 파스텔. 이름으로도 쓸 수 있게 맵으로 먼저 정의한다.
export const POST_COLOR = {
  cream: '#f3e9d8',
  blush: '#f6ded8',
  sage: '#dfe6d8',
  sky: '#dbe5ee',
  lilac: '#e6e1f0',
  paper: '#fffdf9',
} as const

export const POST_COLORS = [
  POST_COLOR.cream,
  POST_COLOR.blush,
  POST_COLOR.sage,
  POST_COLOR.sky,
  POST_COLOR.lilac,
  POST_COLOR.paper,
] as const
export type PostColor = (typeof POST_COLORS)[number]

// 톤을 바꾸기 전에 저장해둔 쨍한 색들. 이미 만들어진 담벼락도 새 톤으로 보이도록 화면에서 갈아끼운다.
const LEGACY_POST_COLORS: Record<string, PostColor> = {
  '#fff3b0': POST_COLOR.cream,
  '#ffd6d6': POST_COLOR.blush,
  '#ffe3c2': POST_COLOR.cream,
  '#cdf3ee': POST_COLOR.sage,
  '#ffd6ec': POST_COLOR.blush,
  '#e7e5e0': POST_COLOR.paper,
  '#d6f5e3': POST_COLOR.sage,
  '#d6e6ff': POST_COLOR.sky,
  '#ecd6ff': POST_COLOR.lilac,
  '#ffffff': POST_COLOR.paper,
}

export function normalizePostColor(raw: string | undefined | null): PostColor {
  if (!raw) return POST_COLOR.paper
  const hex = raw.trim().toLowerCase()
  if ((POST_COLORS as readonly string[]).includes(hex)) return hex as PostColor
  return LEGACY_POST_COLORS[hex] ?? POST_COLOR.paper
}

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

// 리액션 이모지. 앞 6개는 예전부터 쓰던 것이라 저장된 반응과 호환되어야 하므로 순서를 바꾸거나 빼지 않는다.
export const REACTION_EMOJIS = [
  '❤️',
  '👍',
  '😂',
  '😮',
  '😢',
  '🎉',
  '🔥',
  '👏',
  '💡',
  '⭐',
  '🤔',
  '💯',
  '🥰',
  '😎',
  '🙌',
  '✅',
  '🌱',
  '🍀',
] as const

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number]

// 포스트잇에 기본으로 보여줄 빠른 반응(나머지는 + 버튼을 눌러 고른다).
export const QUICK_REACTIONS: readonly ReactionEmoji[] = ['❤️', '👍', '😂', '🎉']

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
