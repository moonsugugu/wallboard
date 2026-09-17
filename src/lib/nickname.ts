const KEY = 'wallboard:nickname'
const ASKED_KEY = 'wallboard:nickname-asked'

export function getNickname(): string {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function setNickname(name: string) {
  try {
    localStorage.setItem(KEY, name)
    localStorage.setItem(ASKED_KEY, '1')
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 앱 동작에는 지장 없음 */
  }
}

// 익명으로 건너뛴 경우에도 다음 방문 때 또 물어보지 않도록 별도로 기록한다.
export function hasAskedNickname(): boolean {
  try {
    return localStorage.getItem(ASKED_KEY) === '1'
  } catch {
    return false
  }
}
