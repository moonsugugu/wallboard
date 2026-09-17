// Firestore 호환 어댑터 — class-economy/src/lib/postgres-firestore.js 를 그대로 따름.
// 문수네집 홈서버 범용 문서저장소(api.moonsunezip.com)를 Firestore와 같은 사용감으로 씀.
/* eslint-disable @typescript-eslint/no-explicit-any */

const HTTP_BASE =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3100'
    : 'https://api.moonsunezip.com'
const WS_BASE = HTTP_BASE.replace(/^http/, 'ws')

const clean = (parts: any[]) =>
  parts
    .flatMap((x) => (x?.path ? [x.path] : [x]))
    .filter(Boolean)
    .join('/')
    .replace(/^\/+|\/+$/g, '')
const refPath = (args: any[]) => (args[0]?.path ? clean(args) : clean(args.slice(1)))
const autoId = () => crypto.randomUUID().replaceAll('-', '').slice(0, 20)
const getField = (obj: any, field: string) => field.split('.').reduce((v, k) => v?.[k], obj)

export type DocRef = { type: 'doc'; path: string; id: string }
export type CollectionRef = { type: 'collection'; path: string; id: string }
export type QueryConstraint = { kind: 'where' | 'orderBy' | 'limit'; [k: string]: any }
export type QueryRef = { type: 'query'; path: string; constraints: QueryConstraint[] }

export const getFirestore = () => ({ type: 'postgres-firestore' })
export const collection = (...args: any[]): CollectionRef => ({
  type: 'collection',
  path: refPath(args),
  id: String(args.at(-1)),
})
export const doc = (...args: any[]): DocRef => {
  const base = refPath(args)
  const path = args.length === 1 && args[0]?.type === 'collection' ? `${base}/${autoId()}` : base
  return { type: 'doc', path, id: path.split('/').at(-1)! }
}
export const where = (field: string, op: string, value: any): QueryConstraint => ({ kind: 'where', field, op, value })
export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint => ({
  kind: 'orderBy',
  field,
  direction,
})
export const limit = (value: number): QueryConstraint => ({ kind: 'limit', value })
export const query = (ref: CollectionRef, ...constraints: QueryConstraint[]): QueryRef => ({
  type: 'query',
  path: ref.path,
  constraints,
})

class DocSnapshot {
  ref: DocRef
  id: string
  version: number | null
  private _record: any
  constructor(ref: DocRef, record: any) {
    this.ref = ref
    this.id = ref.id
    this._record = record
    this.version = record?.version ?? null
  }
  exists() {
    return !!this._record
  }
  data() {
    return this._record?.data
  }
}
class QuerySnapshot {
  docs: DocSnapshot[]
  size: number
  empty: boolean
  constructor(docs: DocSnapshot[]) {
    this.docs = docs
    this.size = docs.length
    this.empty = !docs.length
  }
  forEach(fn: (d: DocSnapshot) => void) {
    this.docs.forEach(fn)
  }
}

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${HTTP_BASE}${path}`, options)
  const data = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data?.error || `HTTP ${response.status}`), { status: response.status })
  return data
}
export async function getDoc(ref: DocRef) {
  try {
    return new DocSnapshot(ref, await request(`/v1/documents/doc?path=${encodeURIComponent(ref.path)}`))
  } catch (e: any) {
    if (e.status === 404) return new DocSnapshot(ref, null)
    throw e
  }
}
function matches(value: any, op: string, expected: any): boolean {
  if (op === '==') return value === expected
  if (op === '!=') return value !== expected
  if (op === '<') return value < expected
  if (op === '<=') return value <= expected
  if (op === '>') return value > expected
  if (op === '>=') return value >= expected
  if (op === 'in') return expected.includes(value)
  if (op === 'array-contains') return Array.isArray(value) && value.includes(expected)
  return false
}
export async function getDocs(target: CollectionRef | QueryRef) {
  const records = await request(`/v1/documents/query?collection=${encodeURIComponent(target.path)}`)
  let docs = records.map((r: any) => new DocSnapshot({ type: 'doc', path: r.path, id: r.id }, r))
  const constraints = (target as QueryRef).constraints || []
  for (const c of constraints) {
    if (c.kind === 'where') docs = docs.filter((d: DocSnapshot) => matches(getField(d.data(), c.field), c.op, c.value))
    if (c.kind === 'orderBy')
      docs.sort((a: DocSnapshot, b: DocSnapshot) => {
        const av = getField(a.data(), c.field)
        const bv = getField(b.data(), c.field)
        return (av === bv ? 0 : av == null ? 1 : bv == null ? -1 : av < bv ? -1 : 1) * (c.direction === 'desc' ? -1 : 1)
      })
    if (c.kind === 'limit') docs = docs.slice(0, c.value)
  }
  return new QuerySnapshot(docs)
}
const commit = (operations: any[], reads: any[] = []) => {
  const requestId = crypto.randomUUID()
  return request('/v1/documents/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, reads, operations }),
  })
}
export const setDoc = (ref: DocRef, data: any, options: { merge?: boolean } = {}) =>
  commit([{ type: 'set', path: ref.path, data, merge: !!options.merge }])
export const updateDoc = (ref: DocRef, data: any) => commit([{ type: 'update', path: ref.path, data }])
export const deleteDoc = (ref: DocRef) => commit([{ type: 'delete', path: ref.path }])
export async function addDoc(ref: CollectionRef, data: any) {
  const out = doc(ref)
  await setDoc(out, data)
  return out
}
export const serverTimestamp = () => ({ __op: 'serverTimestamp' })
export const increment = (value: number) => ({ __op: 'increment', value })
export const arrayUnion = (...values: any[]) => ({ __op: 'arrayUnion', values })
export const arrayRemove = (...values: any[]) => ({ __op: 'arrayRemove', values })
export const deleteField = () => ({ __op: 'delete' })

export function onSnapshot(target: DocRef | CollectionRef | QueryRef, next: (snap: any) => void, error?: (e: any) => void) {
  let closed = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let ws: WebSocket | undefined
  const load = async () => {
    try {
      if (!closed) next(target.type === 'doc' ? await getDoc(target as DocRef) : await getDocs(target as CollectionRef | QueryRef))
    } catch (e) {
      error?.(e)
    }
  }
  const scope = target.path.split('/').slice(0, 2).join('/')
  const connect = () => {
    if (closed) return
    ws = new WebSocket(`${WS_BASE}/v1/documents/realtime?scope=${encodeURIComponent(scope)}`)
    ws.onmessage = () => {
      clearTimeout(timer)
      timer = setTimeout(load, 40)
    }
    ws.onclose = () => {
      if (!closed) timer = setTimeout(connect, 1000)
    }
    ws.onerror = () => ws?.close()
  }
  load()
  connect()
  return () => {
    closed = true
    clearTimeout(timer)
    ws?.close()
  }
}
