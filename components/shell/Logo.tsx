/**
 * The mark: the two harmonics the whole method rests on — one wave a
 * year, one twice a year — on a jelaga tile. Colours are Tailwind tokens
 * via class names, never raw hex (CLAUDE.md Conventions).
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="flex-none">
      <rect width="100" height="100" rx="24" className="fill-ink" />
      <path
        d="M10 50 Q 20 16, 30 16 T 50 50 T 70 84 T 90 50"
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-stock"
      />
      <path
        d="M10 56 Q 20 28, 30 56 Q 40 84, 50 56 Q 60 28, 70 56 Q 80 84, 90 56"
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-lokal-tint"
      />
    </svg>
  );
}
