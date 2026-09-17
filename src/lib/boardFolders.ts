// 담벼락 폴더 — "내 담벼락" 목록과 마찬가지로 이 브라우저에만 저장된다(계정이 없으므로 기기 간 공유되지 않음).
const KEY = 'wallboard:folders'
const MAX_NAME = 20

export type BoardFolder = { id: string; name: string; createdAt: number }

export function getFolders(): BoardFolder[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter((f): f is BoardFolder => !!f && typeof f.id === 'string' && typeof f.name === 'string')
      .sort((a, b) => a.createdAt - b.createdAt)
  } catch {
    return []
  }
}

function save(folders: BoardFolder[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(folders))
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

export function createFolder(name: string): BoardFolder | null {
  const clean = name.trim().slice(0, MAX_NAME)
  if (!clean) return null
  const folder: BoardFolder = { id: crypto.randomUUID().replaceAll('-', '').slice(0, 12), name: clean, createdAt: Date.now() }
  save([...getFolders(), folder])
  return folder
}

export function renameFolder(id: string, name: string) {
  const clean = name.trim().slice(0, MAX_NAME)
  if (!clean) return
  save(getFolders().map((f) => (f.id === id ? { ...f, name: clean } : f)))
}

// 폴더만 지운다. 안에 있던 담벼락은 지우지 않고 '미분류'로 돌려보낸다(→ recentBoards.unfileBoardsIn).
export function deleteFolder(id: string) {
  save(getFolders().filter((f) => f.id !== id))
}

export function folderName(folders: BoardFolder[], id: string | null | undefined): string | null {
  if (!id) return null
  return folders.find((f) => f.id === id)?.name ?? null
}
