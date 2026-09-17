// 패들렛 공식 API(https://docs.padlet.dev)를 이용한 가져오기.
// 유료 요금제 + API 키가 있는 선생님만 쓸 수 있다. 패들렛 API가 CORS를 열어두고 있어서
// (Access-Control-Allow-Origin: *) 브라우저에서 바로 호출한다 — API 키가 우리 서버를 거치지 않고
// 사용자 브라우저에서 패들렛으로 곧장 전송되므로 이 앱은 키를 전혀 보지 못한다.
import type { AttachmentType, BoardLayout, PostColor } from '../types'
import type { ImportResult } from './importPadlet'

const PADLET_COLORS: Record<string, PostColor> = {
  red: '#ffd6d6',
  yellow: '#fff3b0',
  green: '#d6f5e3',
  blue: '#d6e6ff',
  purple: '#ecd6ff',
}
const DEFAULT_COLOR: PostColor = '#ffffff'

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function detectAttachmentType(url: string): AttachmentType {
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url)) return 'image'
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || /(youtube\.com|youtu\.be|vimeo\.com)/i.test(url)) return 'video'
  return 'link'
}

// 패들렛 보드 URL이나 ID를 그대로 붙여넣어도 되게, 끝의 16~20자 ID만 뽑아낸다.
export function extractBoardId(input: string): string {
  const trimmed = input.trim().replace(/\/$/, '')
  const last = trimmed.split('/').pop() || trimmed
  const match = last.match(/([A-Za-z0-9]{16,20})$/)
  return match ? match[1] : last
}

type JsonApiResource = {
  id: string
  type: string
  attributes: Record<string, any>
  relationships?: Record<string, any>
}

export async function importFromPadletApi(apiKey: string, boardIdOrUrl: string): Promise<ImportResult> {
  const boardId = extractBoardId(boardIdOrUrl)
  const res = await fetch(`https://api.padlet.dev/v1/boards/${encodeURIComponent(boardId)}?include=posts,sections,comments`, {
    headers: { 'x-api-key': apiKey },
  })

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('API 키가 올바르지 않거나, 이 보드의 관리자 권한이 없어요.')
    if (res.status === 404) throw new Error('보드를 찾을 수 없어요. 보드 ID(또는 링크)를 확인해주세요.')
    throw new Error(`패들렛 API 오류가 발생했어요 (${res.status}).`)
  }

  const json = await res.json()
  const board = json.data as JsonApiResource
  const included = (json.included as JsonApiResource[]) || []
  const sections = included
    .filter((x) => x.type === 'section')
    .slice()
    .sort((a, b) => (a.attributes.sortIndex ?? 0) - (b.attributes.sortIndex ?? 0))
  const posts = included.filter((x) => x.type === 'post')

  const sectionTitleById = new Map(sections.map((s) => [s.id, s.attributes.title || '섹션']))
  const layout: BoardLayout = sections.length > 1 ? 'columns' : 'wall'

  const mappedPosts = posts
    .slice()
    .sort((a, b) => (a.attributes.sortIndex ?? 0) - (b.attributes.sortIndex ?? 0))
    .map((p) => {
      const a = p.attributes
      const content = a.content || {}
      const url: string | null = content.attachment?.url || null
      const attachmentType: AttachmentType = url ? detectAttachmentType(url) : 'none'
      const sectionId = p.relationships?.section?.data?.id as string | undefined
      return {
        author: content.subject || a.author?.fullName || a.author?.shortName || '',
        text: stripHtml(content.bodyHtml),
        attachmentType,
        attachmentUrl: url || undefined,
        column: layout === 'columns' ? (sectionTitleById.get(sectionId ?? '') ?? null) : null,
        color: PADLET_COLORS[a.color] || DEFAULT_COLOR,
        createdAt: a.createdAt ? new Date(a.createdAt).getTime() : Date.now(),
      }
    })

  return {
    title: board?.attributes?.title || '가져온 담벼락',
    layout,
    columns: layout === 'columns' ? sections.map((s) => s.attributes.title || '섹션') : [],
    posts: mappedPosts,
  }
}
