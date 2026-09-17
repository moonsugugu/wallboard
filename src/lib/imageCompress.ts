// 이미지를 리사이즈·압축해 data URL로 만든다.
// 홈서버 DB에 파일 전용 저장소가 없어(JSON 문서저장소뿐) 작은 이미지는 문서에 직접 넣는다.
const MAX_DIMENSION = 1000
const MAX_DATA_URL_LENGTH = 600_000 // 대략 450KB 바이너리

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요.'))
    reader.readAsDataURL(file)
  })
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  // GIF는 캔버스로 다시 그리면 첫 프레임만 남아 움직임이 사라진다.
  // 그래서 압축하지 않고 원본 그대로 넣되, 용량만 확인한다.
  if (file.type === 'image/gif') {
    const dataUrl = await readAsDataUrl(file)
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error('움직이는 GIF는 용량을 줄일 수 없어요. 400KB보다 작은 GIF를 올려주세요.')
    }
    return dataUrl
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 처리할 수 없어요.')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  for (const quality of [0.72, 0.55, 0.4, 0.25]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl
  }
  throw new Error('이미지 용량이 너무 커요. 더 작은 이미지를 올려주세요.')
}
