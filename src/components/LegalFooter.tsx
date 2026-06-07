// Compact risk disclosure + legal links. Standard for any trading platform —
// signals legitimacy and sets expectations honestly (evaluations are simulated).

const LINKS = [
  { label: 'Risk Disclosure', href: 'https://tonfunded.app/risk' },
  { label: 'Terms', href: 'https://tonfunded.app/terms' },
  { label: 'Privacy', href: 'https://tonfunded.app/privacy' },
];

export default function LegalFooter() {
  return (
    <div className="pt-3 pb-1 px-2">
      <p className="text-[10px] text-tertiary leading-relaxed text-center max-w-[340px] mx-auto">
        Trading involves substantial risk. Evaluations are simulated; funded capital
        and profit splits are subject to the program agreement. Past performance does
        not guarantee future results.
      </p>
      <div className="flex items-center justify-center gap-2.5 mt-2.5">
        {LINKS.map((l, i) => (
          <span key={l.label} className="flex items-center gap-2.5">
            {i > 0 && <span className="text-tertiary text-[10px]">·</span>}
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-600 text-secondary active:opacity-60 transition-opacity"
              style={{ fontWeight: 600 }}
            >
              {l.label}
            </a>
          </span>
        ))}
      </div>
      <p className="text-[10px] text-center text-tertiary mt-2.5">
        TonFunded · Built on TON
      </p>
    </div>
  );
}
