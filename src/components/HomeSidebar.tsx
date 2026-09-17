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
    <aside className="hidden w-56 shrink-0 flex-col gap-6 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-xl">📌</span>
        <div>
          <p className="text-lg font-extrabold leading-tight text-[var(--color-ink)]">담벼락</p>
          <p className="text-[11px] text-[var(--color-sub)]">우리 반 생각 모음</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition active:scale-[0.97] ${
              active === item.key
                ? 'bg-[var(--color-accent)]/12 text-[var(--color-accent)]'
                : 'text-[var(--color-sub)] hover:bg-black/5'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="mb-1 text-3xl">🧸</div>
        <p className="text-xs leading-relaxed text-[var(--color-sub)]">
          작은 생각도
          <br />
          모이면 큰 이야기가 돼요
        </p>
      </div>
    </aside>
  )
}
