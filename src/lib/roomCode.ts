// 담벼락 코드: 대문자/숫자 6자, 헷갈리는 글자(0/O, 1/I/L) 제외
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateBoardCode(length = 6) {
  let code = ''
  for (let i = 0; i < length; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)]
  return code
}

export function normalizeBoardCode(input: string) {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}
