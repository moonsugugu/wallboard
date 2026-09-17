// 보드 코드에서 카드 색·이모지를 항상 같게 뽑아낸다(같은 보드는 늘 같은 모양).
const THEMES = [
  { emoji: '💡', bg: '#f3e8ff', ink: '#7c3aed' },
  { emoji: '📖', bg: '#e6f7ec', ink: '#15803d' },
  { emoji: '📷', bg: '#e0f2fe', ink: '#0369a1' },
  { emoji: '💬', bg: '#ffe4ef', ink: '#be185d' },
  { emoji: '🏆', bg: '#fef3c7', ink: '#b45309' },
  { emoji: '🌱', bg: '#dcfce7', ink: '#047857' },
  { emoji: '🎨', bg: '#ffedd5', ink: '#c2410c' },
  { emoji: '⭐', bg: '#e0e7ff', ink: '#4338ca' },
  { emoji: '🎵', bg: '#fce7f3', ink: '#a21caf' },
  { emoji: '🔭', bg: '#cffafe', ink: '#0e7490' },
  { emoji: '✏️', bg: '#fef9c3', ink: '#a16207' },
  { emoji: '🧩', bg: '#ede9fe', ink: '#6d28d9' },
  { emoji: '🌏', bg: '#d1fae5', ink: '#065f46' },
  { emoji: '🍀', bg: '#ecfccb', ink: '#4d7c0f' },
  { emoji: '🎈', bg: '#ffe4e6', ink: '#be123c' },
  { emoji: '🚀', bg: '#dbeafe', ink: '#1d4ed8' },
] as const

export type BoardTheme = (typeof THEMES)[number]

export function boardTheme(code: string): BoardTheme {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  return THEMES[hash % THEMES.length]
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day}일 전`
  return `${Math.floor(day / 7)}주 전`
}
