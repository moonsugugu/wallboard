export default function MoonsuneCredit() {
  return (
    <footer className="mt-6 mb-2 text-center">
      <div className="mb-2.5 text-sm text-[var(--color-sub)]">
        made by <b className="text-[var(--color-accent)]">문수네집</b>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href="https://moonsunezipbrand.vercel.app"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-surface)] px-3.5 py-2 text-[13.5px] font-bold text-[var(--color-accent)] transition hover:-translate-y-px"
        >
          🏠 문수네집
        </a>
        <a
          href="https://www.instagram.com/moonsune.zip/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-surface)] px-3.5 py-2 text-[13.5px] font-bold text-[var(--color-accent)] transition hover:-translate-y-px"
        >
          📷 인스타그램
        </a>
        <a
          href="https://moonsune-zip.vercel.app/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-surface)] px-3.5 py-2 text-[13.5px] font-bold text-[var(--color-accent)] transition hover:-translate-y-px"
        >
          ✨ moonsune.zip
        </a>
      </div>
    </footer>
  )
}
