// React 19는 JSX href="javascript:..." 를 보안상 자동으로 막는다(클릭 시 에러를 던지는
// href로 바꿔치기함). 즐겨찾기줄로 드래그하는 북마클릿은 정상적인 href가 필요하므로,
// React의 속성 처리를 거치지 않도록 ref에서 setAttribute로 직접 넣는다.
import { useCallback } from 'react'

type Props = {
  href: string
  className?: string
  children: React.ReactNode
}

export default function BookmarkletLink({ href, className, children }: Props) {
  const setRef = useCallback(
    (el: HTMLAnchorElement | null) => {
      el?.setAttribute('href', href)
    },
    [href],
  )
  return (
    <a ref={setRef} onClick={(e) => e.preventDefault()} draggable className={className}>
      {children}
    </a>
  )
}
