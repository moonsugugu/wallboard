import type { KeyboardEvent } from 'react'

// 한글 입력기는 글자를 조합하는 동안에도 Enter 키 이벤트를 흘려보낸다.
// 그대로 두면 "조합을 확정하려고 누른 Enter"가 전송으로 새어 나가서,
// 마지막 글자가 빠진 채 보내지거나 같은 내용이 두 번 보내진다.
// 조합 중(isComposing)일 때는 Enter를 무시하고, 확정된 뒤의 Enter만 전송으로 본다.
export function isSubmitEnter(e: KeyboardEvent): boolean {
  return e.key === 'Enter' && !e.nativeEvent.isComposing
}
