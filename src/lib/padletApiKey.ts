// 선생님이 원하면 이 브라우저에만 API 키를 기억해둔다(서버로는 전송하지 않음).
const KEY = 'wallboard:padlet-api-key'

export function getSavedPadletApiKey(): string {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function savePadletApiKey(key: string) {
  try {
    localStorage.setItem(KEY, key)
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

export function clearSavedPadletApiKey() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}
