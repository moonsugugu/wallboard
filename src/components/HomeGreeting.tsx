type Props = {
  nickname: string
  search: string
  onSearch: (value: string) => void
}

export default function HomeGreeting({ nickname, search, onSearch }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#cfe9ff] via-[#e6f0ff] to-[#ffe8f0] px-6 py-8 sm:px-8">
      <div className="hero-glow pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/50 blur-2xl" />

      <div className="relative max-w-md">
        <p className="text-sm font-semibold text-[#3d4a63]">안녕하세요{nickname ? `, ${nickname}님` : ''}! 👋</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-snug text-[#1f2a44] sm:text-3xl">
          오늘의 생각을 담벼락에
          <br />
          모아볼까요?
        </h1>

        <div className="mt-5 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 shadow-sm">
          <span className="text-sm text-[#7a8699]">🔍</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="담벼락을 검색해보세요..."
            className="w-full bg-transparent text-sm text-[#1f2a44] placeholder:text-[#9aa5b8] outline-none"
          />
        </div>
      </div>

      <div className="hero-sticker hero-sticker-a pointer-events-none absolute right-6 top-8 hidden text-5xl sm:block">🏫</div>
      <div className="hero-sticker hero-sticker-b pointer-events-none absolute bottom-6 right-24 hidden text-3xl sm:block">✏️</div>
      <div className="hero-sticker hero-sticker-c pointer-events-none absolute bottom-10 right-6 hidden text-2xl sm:block">🌤️</div>
    </section>
  )
}
