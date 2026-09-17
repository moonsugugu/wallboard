export default function MoonsuneCredit() {
  return (
    <footer className="mb-2 mt-10 text-center">
      <span className="mx-auto mb-5 block h-px w-12 bg-[var(--color-border)]" />
      <div className="eyebrow mb-3.5">
        made by <b className="font-semibold text-[var(--color-accent)]">문수네집</b>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href="https://moonsunezipbrand.vercel.app"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--color-sub)] transition hover:-translate-y-px hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          🏠 문수네집
        </a>
        <a
          href="https://www.instagram.com/moonsune.zip/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--color-sub)] transition hover:-translate-y-px hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          📷 인스타그램
        </a>
        <a
          href="https://moonsune-zip.vercel.app/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--color-sub)] transition hover:-translate-y-px hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          ✨ moonsune.zip
        </a>
      </div>
    </footer>
  )
}
