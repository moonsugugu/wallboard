// 홈 화면 히어로. 사이버펑크 레퍼런스의 "큰 타이포 + 모션그래픽" 장르만 가져와서
// 담벼락 자체 소재(포스트잇, 이모지)로 새로 만든 오리지널 모션그래픽.
const STICKERS = [
  { emoji: '📌', bg: '#fff3b0', pos: 'left-[6%] top-[16%]', size: 'h-14 w-14 text-2xl', anim: 'hero-sticker-a', delay: '0s' },
  { emoji: '💬', bg: '#d6e6ff', pos: 'right-[8%] top-[10%]', size: 'h-12 w-12 text-xl', anim: 'hero-sticker-b', delay: '0.4s' },
  { emoji: '❤️', bg: '#d6f5e3', pos: 'left-[12%] bottom-[14%]', size: 'h-12 w-12 text-xl', anim: 'hero-sticker-c', delay: '0.8s' },
  { emoji: '🎉', bg: '#ecd6ff', pos: 'right-[13%] bottom-[18%]', size: 'h-14 w-14 text-2xl', anim: 'hero-sticker-b', delay: '1.2s' },
]

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[var(--color-surface)] px-6 py-16 text-center shadow-sm">
      <div className="hero-glow pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--color-accent)]/25 blur-3xl" />

      {STICKERS.map((s, i) => (
        <div
          key={i}
          className={`hero-sticker ${s.anim} pointer-events-none absolute ${s.pos} hidden ${s.size} items-center justify-center rounded-xl shadow-md sm:flex`}
          style={{ background: s.bg, animationDelay: s.delay }}
        >
          {s.emoji}
        </div>
      ))}

      <div className="relative">
        <span
          className="hero-line mb-4 inline-block rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--color-accent)]"
          style={{ animationDelay: '0.05s' }}
        >
          made by 문수네집 · 실시간 교실 게시판
        </span>
        <h1 className="text-4xl font-extrabold leading-[1.15] text-[var(--color-ink)] sm:text-5xl">
          <span className="hero-line block" style={{ animationDelay: '0.15s' }}>
            모아요.
          </span>
          <span className="hero-line block" style={{ animationDelay: '0.3s' }}>
            나눠요.
          </span>
          <span className="hero-line block text-[var(--color-accent)]" style={{ animationDelay: '0.45s' }}>
            담벼락.
          </span>
        </h1>
        <p className="hero-line mx-auto mt-5 max-w-sm text-sm text-[var(--color-sub)]" style={{ animationDelay: '0.6s' }}>
          코드 하나로 우리 반 전체가 실시간으로 붙이고, 반응하고, 이야기하는 담벼락이에요.
        </p>
      </div>
    </div>
  )
}
