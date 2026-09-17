type Props = {
  nickname: string
  search: string
  onSearch: (value: string) => void
}

export default function HomeGreeting({ nickname, search, onSearch }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)]/70 px-6 pb-9 pt-7 sm:px-10 sm:pb-12 sm:pt-9 xl:px-16">
      {/* 종이 위에 빛이 번지는 워시 */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--p-lilac)]/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-[var(--p-blush)]/50 blur-3xl" />

      {/* 위 줄: 자간 넓은 소문자 라벨 — 무드보드 특유의 조용한 머리글 */}
      <div className="relative mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="eyebrow max-w-[9rem] leading-[1.9] sm:max-w-none">더 나은 내일을 위한 생각 모음</p>
          <span className="hidden h-px w-10 bg-[var(--color-border)] sm:block" />
        </div>
        <p className="eyebrow hidden sm:block">생각 — 사람 — 가능성</p>
      </div>

      {/* 가운데: 세리프 헤드라인 */}
      <div className="relative mx-auto max-w-xl text-center">
        <h1
          className="rise font-display text-[2rem] leading-[1.22] text-[var(--color-ink)] sm:text-[2.7rem] xl:text-[3rem]"
          style={{ animationDelay: '80ms' }}
        >
          생각은 함께 모일 때<br className="sm:hidden" /> 더 좋아져요
        </h1>
        <p
          className="rise mt-3 text-[13.5px] leading-relaxed text-[var(--color-sub)] sm:text-[15px]"
          style={{ animationDelay: '220ms' }}
        >
          {nickname ? `${nickname}님, ` : ''}우리 반의 이야기를 차분히 모으고 나누는 공간.
        </p>

        {/* 검색 */}
        <div
          className="rise mx-auto mt-7 flex max-w-md items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3"
          style={{ animationDelay: '340ms', boxShadow: 'var(--shadow-paper)' }}
        >
          <span className="text-sm text-[var(--color-sub)]">🔍</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="담벼락 이름이나 코드로 찾기"
            className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-sub)]/70"
          />
        </div>
      </div>

      {/* 떠 있는 작은 종이들 */}
      <div
        className="drift drift-a paper-tilt-1 pointer-events-none absolute right-5 top-28 hidden w-[7rem] rounded-2xl bg-[var(--p-blush)] px-4 py-3 xl:block"
        style={{ boxShadow: 'var(--shadow-paper)' }}
      >
        <p className="quote text-[15px] leading-snug text-[#7a4f57]">
          Softer,
          <br />
          Kinder,
          <br />
          Together
        </p>
      </div>
      <div
        className="drift drift-b paper-tilt-2 pointer-events-none absolute bottom-12 left-5 hidden w-[8rem] rounded-2xl bg-[var(--p-sage)] px-4 py-3 xl:block"
        style={{ boxShadow: 'var(--shadow-paper)' }}
      >
        <p className="quote text-[15px] leading-snug text-[#4a6250]">
          좋은 질문이
          <br />
          좋은 이야기를
          <br />
          데려와요
        </p>
      </div>
      <div
        className="drift drift-c pointer-events-none absolute bottom-9 right-8 hidden items-center gap-1.5 rounded-full bg-[var(--color-surface)] px-3 py-2 xl:flex"
        style={{ boxShadow: 'var(--shadow-paper)' }}
      >
        <span className="h-3.5 w-3.5 rounded-full bg-[var(--p-sage)]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[var(--p-sky)]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[var(--p-clay)]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[var(--p-blush)]" />
      </div>
    </section>
  )
}
