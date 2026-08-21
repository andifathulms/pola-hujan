import { FAMILY_TEXT_FILL_CLASS } from "@/lib/family";

export interface ClassificationSpaceDiagramProps {
  monsunalMaxDisplacementMonths: number;
  ekuatorialDominanceRatio: number;
}

const WIDTH = 400;
const HEIGHT = 220;
const PAD_LEFT = 40;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;
const PLOT_LEFT = PAD_LEFT;
const PLOT_RIGHT = WIDTH - PAD_RIGHT;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = HEIGHT - PAD_BOTTOM;

// Circular distance in months is always in [0, 6] — lib/harmonic/thresholds.ts's
// own documented range for the quantity, not a threshold itself.
const DISPLACEMENT_MAX = 6;

/**
 * Which region of the amplitude-ratio-versus-displacement space each
 * family occupies (DESIGN-REWORK.md §2.3) — the same decision
 * `classifyRegime` makes (lib/harmonic/classify.ts), drawn as one
 * figure instead of read out of six table rows. The table stays
 * beneath this on the page; it's still the precise, checkable reading.
 *
 * The two boundary lines and three region fills mirror
 * classifyRegime's actual order exactly: ratio decides Ekuatorial
 * first, independent of displacement (so that boundary runs the full
 * width); displacement only decides Monsunal vs Lokal within whatever
 * is left. Both threshold numbers are manifest output — nothing here
 * recomputes a classification (CLAUDE.md invariant 15); `domainMax`
 * for the ratio axis is a display-range choice, the same kind
 * CycleCurve already makes for its own y-scale.
 */
export function ClassificationSpaceDiagram({
  monsunalMaxDisplacementMonths,
  ekuatorialDominanceRatio,
}: ClassificationSpaceDiagramProps) {
  const ratioMax = ekuatorialDominanceRatio * 2.5;

  const xFor = (displacementMonths: number) => PLOT_LEFT + (displacementMonths / DISPLACEMENT_MAX) * (PLOT_RIGHT - PLOT_LEFT);
  const yFor = (ratio: number) => PLOT_TOP + (PLOT_BOTTOM - PLOT_TOP) * (1 - ratio / ratioMax);

  const splitX = xFor(monsunalMaxDisplacementMonths);
  const splitY = yFor(ekuatorialDominanceRatio);

  return (
    <figure className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Diagram ruang keputusan klasifikasi. Rasio semi-tahunan/tahunan di atau di atas ${ekuatorialDominanceRatio.toFixed(1)} selalu Ekuatorial, apa pun jarak puncaknya. Di bawah rasio itu: jarak puncak sampai ${monsunalMaxDisplacementMonths} bulan dari pusat monsun adalah Monsunal, lebih jauh dari itu adalah Lokal.`}
        className="w-full max-w-md"
      >
        <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_RIGHT - PLOT_LEFT} height={splitY - PLOT_TOP} className="fill-ekuatorial/15" />
        <rect x={PLOT_LEFT} y={splitY} width={splitX - PLOT_LEFT} height={PLOT_BOTTOM - splitY} className="fill-monsunal/15" />
        <rect x={splitX} y={splitY} width={PLOT_RIGHT - splitX} height={PLOT_BOTTOM - splitY} className="fill-lokal/15" />

        {/* The two decision boundaries — ratio first (full width), then
            displacement (only within the not-Ekuatorial band), matching
            classifyRegime's own order. */}
        <line x1={PLOT_LEFT} y1={splitY} x2={PLOT_RIGHT} y2={splitY} className="stroke-ink" strokeWidth={1} />
        <line x1={splitX} y1={splitY} x2={splitX} y2={PLOT_BOTTOM} className="stroke-ink" strokeWidth={1} />

        <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_BOTTOM} className="stroke-ink" strokeWidth={0.5} />
        <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} className="stroke-ink" strokeWidth={0.5} />

        <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={(PLOT_TOP + splitY) / 2 + 4} textAnchor="middle" className={`font-mono text-tick ${FAMILY_TEXT_FILL_CLASS.ekuatorial}`}>
          Ekuatorial
        </text>
        <text x={(PLOT_LEFT + splitX) / 2} y={(splitY + PLOT_BOTTOM) / 2 + 4} textAnchor="middle" className={`font-mono text-tick ${FAMILY_TEXT_FILL_CLASS.monsunal}`}>
          Monsunal
        </text>
        <text x={(splitX + PLOT_RIGHT) / 2} y={(splitY + PLOT_BOTTOM) / 2 + 4} textAnchor="middle" className={`font-mono text-tick ${FAMILY_TEXT_FILL_CLASS.lokal}`}>
          Lokal
        </text>

        <text x={PLOT_LEFT} y={PLOT_BOTTOM + 14} textAnchor="middle" className="fill-ink font-mono text-tick tabular-nums">0</text>
        <text x={splitX} y={PLOT_BOTTOM + 14} textAnchor="middle" className="fill-ink font-mono text-tick tabular-nums">{monsunalMaxDisplacementMonths}</text>
        <text x={PLOT_RIGHT} y={PLOT_BOTTOM + 14} textAnchor="middle" className="fill-ink font-mono text-tick tabular-nums">{DISPLACEMENT_MAX}</text>
        <text x={WIDTH / 2} y={HEIGHT - 4} textAnchor="middle" className="fill-ink/70 font-mono text-tick">jarak puncak dari pusat monsun (bulan)</text>

        <text x={PLOT_LEFT - 6} y={PLOT_BOTTOM + 4} textAnchor="end" className="fill-ink font-mono text-tick tabular-nums">0</text>
        <text x={PLOT_LEFT - 6} y={splitY + 4} textAnchor="end" className="fill-ink font-mono text-tick tabular-nums">{ekuatorialDominanceRatio.toFixed(1)}</text>
        <text x={PLOT_LEFT - 6} y={PLOT_TOP + 4} textAnchor="end" className="fill-ink font-mono text-tick tabular-nums">{ratioMax.toFixed(1)}</text>
      </svg>
      <figcaption className="text-xs text-ink/70">
        Sumbu tegak: rasio amplitudo semi-tahunan/tahunan. Sumbu datar: jarak puncak siklus tahunan dari pusat
        monsun. Wilayah Ekuatorial tidak bergantung pada jarak puncak — rasio saja yang memutuskan.
      </figcaption>
    </figure>
  );
}
