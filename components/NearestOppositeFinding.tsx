import type { Manifest } from "@/lib/grid/schema";
import { FAMILY_LABEL, type Family } from "@/lib/family";

export interface NearestOppositeFindingProps {
  pair: Manifest["nearestOppositePair"];
  onSelect: (id: string) => void;
}

/**
 * The sharpest local instance of PRD.md §1's founding claim: two places
 * a modest distance apart whose derived rainy-season shape is opposite.
 * `pair` is computed by scripts/build-data.ts over every pair of
 * locations in the build, not picked by hand (CLAUDE.md invariant 12) —
 * this component only renders it and wires the two names to selection.
 */
export function NearestOppositeFinding({ pair, onSelect }: NearestOppositeFindingProps) {
  if (!pair) return null;

  return (
    // A left rule instead of a box: the finding is the sharpest single
    // sentence on the page and still needs to stand out, but it was one
    // of four stacked cards a reader met before reaching the atlas.
    <p className="max-w-prose border-l-2 border-ink/40 pl-3 text-base">
      Titik terdekat: <strong>{pair.distanceKm < 1 ? "<1" : Math.round(pair.distanceKm)} km</strong> memisahkan{" "}
      <button type="button" onClick={() => onSelect(pair.aId)} className="font-medium underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
        {pair.aName}
      </button>{" "}
      ({FAMILY_LABEL[pair.aFamily as Family]}) dari{" "}
      <button type="button" onClick={() => onSelect(pair.bId)} className="font-medium underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
        {pair.bName}
      </button>{" "}
      ({FAMILY_LABEL[pair.bFamily as Family]}) — dua pola musim hujan yang berlawanan, sedekat itu.
    </p>
  );
}
