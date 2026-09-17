import type { CSSProperties } from 'react'
import { BOARD_BACKGROUNDS } from '../types'
import type { Board } from '../types'

const DARK_BACKGROUND_KEYS = new Set(['night'])

// 커스텀 배경은 밝기가 제각각이라, 배경을 지정하면 --color-ink/--color-sub를
// 이 컨테이너 안에서만 덮어써서 시스템 다크모드와 상관없이 글자가 항상 읽히게 한다.
export function resolveBoardStyle(board: Pick<Board, 'backgroundKey' | 'backgroundImageUrl'>): CSSProperties {
  const style: Record<string, string> = {}

  if (board.backgroundImageUrl) {
    style.backgroundImage = `url(${board.backgroundImageUrl})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style['--color-ink'] = '#2f2a25'
    style['--color-sub'] = '#6d6459'
    return style as CSSProperties
  }

  const preset = BOARD_BACKGROUNDS.find((b) => b.key === board.backgroundKey)
  if (preset?.css) {
    style.background = preset.css
    const dark = DARK_BACKGROUND_KEYS.has(preset.key)
    style['--color-ink'] = dark ? '#f4efe6' : '#2f2a25'
    style['--color-sub'] = dark ? '#cdc5b8' : '#6d6459'
  }
  return style as CSSProperties
}
