// 보드 코드에서 카드 색·이모지를 항상 같게 뽑아낸다(같은 보드는 늘 같은 모양).
// 색은 전부 채도를 낮춘 파스텔 — 카드가 여러 개 나란히 놓여도 화면이 시끄럽지 않게.
const THEMES = [
  { emoji: '💡', bg: '#ece7f2', ink: '#5b4f73' },
  { emoji: '📖', bg: '#e2ebe1', ink: '#4a6250' },
  { emoji: '📷', bg: '#e0e9f1', ink: '#41566b' },
  { emoji: '💬', bg: '#f5e4e5', ink: '#7a4f57' },
  { emoji: '🏆', bg: '#f3ead6', ink: '#6f5c36' },
  { emoji: '🌱', bg: '#e1ece3', ink: '#456052' },
  { emoji: '🎨', bg: '#f4e6da', ink: '#7a5740' },
  { emoji: '⭐', bg: '#e5e6f1', ink: '#4e5273' },
  { emoji: '🎵', bg: '#f2e5ec', ink: '#6f4a61' },
  { emoji: '🔭', bg: '#dfebed', ink: '#3f5f64' },
  { emoji: '✏️', bg: '#f2edda', ink: '#6b6134' },
  { emoji: '🧩', bg: '#e9e4f0', ink: '#584b6e' },
  { emoji: '🌏', bg: '#dfebe6', ink: '#3f6157' },
  { emoji: '🍀', bg: '#e6edda', ink: '#566337' },
  { emoji: '🎈', bg: '#f5e3e2', ink: '#7a4c4a' },
  { emoji: '🚀', bg: '#e2e8f1', ink: '#465774' },
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
