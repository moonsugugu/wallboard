type Props = {
  active: 'home' | 'boards' | 'import'
  onNavigate: (key: 'home' | 'boards' | 'import') => void
}

const NAV = [
  { key: 'home', icon: '🏠', label: '홈' },
  { key: 'boards', icon: '🗂️', label: '내 담벼락' },
  { key: 'import', icon: '📥', label: '패들렛 가져오기' },
] as const

export default function HomeSidebar({ active, onNavigate }: Props) {
  return (
    <aside className="sticky top-8 hidden h-fit w-56 shrink-0 flex-col gap-8 self-start lg:flex">
      <div className="px-2 pt-3">
        <p className="font-display text-[26px] leading-none text-[var(--color-ink)]">담벼락</p>
        <span className="mt-3 mb-2.5 block h-px w-8 bg-[var(--color-border)]" />
        <p className="eyebrow leading-[1.9]">우리 반 생각 모음</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition active:scale-[0.97] ${
              active === item.key
                ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]'
                : 'text-[var(--color-sub)] hover:bg-[var(--color-surface)]'
            }`}
          >
            <span className="text-base opacity-80">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div
        className="paper-tilt-3 mt-2 rounded-[26px] bg-[var(--p-cream)] px-5 py-6 text-center"
        style={{ boxShadow: 'var(--shadow-paper)' }}
      >
        <p className="quote text-[17px] leading-relaxed text-[#6f5c36]">
          작은 생각도
          <br />
          모이면 큰 이야기가
          <br />
          돼요
        </p>
      </div>
    </aside>
  )
}
