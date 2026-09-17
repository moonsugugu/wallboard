export type EmbeddableVideo = { kind: 'youtube' | 'vimeo' | 'file' | 'iframe'; src: string }

export function toEmbeddableVideo(url: string): EmbeddableVideo {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { kind: 'youtube', src: `https://www.youtube.com/embed/${yt[1]}` }

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vimeo[1]}` }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { kind: 'file', src: url }

  return { kind: 'iframe', src: url }
}
