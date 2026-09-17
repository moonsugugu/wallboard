// 계정이 없는 앱이라 브라우저마다 익명 식별자를 하나씩 두고 좋아요/이모지 반응을 이 값으로 구분한다.
const KEY = 'wallboard:voter'

export function getVoterKey(): string {
  try {
    let value = localStorage.getItem(KEY)
    if (!value) {
      value = crypto.randomUUID()
      localStorage.setItem(KEY, value)
    }
    return value
  } catch {
    return 'anon'
  }
}
