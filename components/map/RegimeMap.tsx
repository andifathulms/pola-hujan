"use client";

import type { RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_FILL_CLASS, FAMILY_LABEL, type Family } from "@/lib/family";

export interface RegimeMapProps {
  records: RegimeRecord[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}

// Indonesia's rough bounding box, used only to place points on a plain
// SVG canvas — there is no basemap, no tiles, no reprojection. This is a
// schematic scatter of the pipeline's own locations, not a geographic
// map (CLAUDE.md invariant 7: no ZOM or other boundary is drawn here).
const LAT_MIN = -11;
const LAT_MAX = 6;
const LON_MIN = 95;
const LON_MAX = 141;
const WIDTH = 640;
const HEIGHT = 320;

// The visible dot (r=7, r=9 selected) is far under the WCAG 2.5.8
// touch-target floor once scaled down to a phone-width container. A
// bigger *invisible* hit circle fixes that without changing what the
// map looks like. It can't reach the full 24 CSS px everywhere — cities
// as close as Pekanbaru/Padang (~200km, ~25 of these units apart) would
// get overlapping, ambiguous hit areas at a literal 24px reach — so
// this is a deliberate, bounded improvement, not a claim of full
// compliance at every viewport width.
const HIT_RADIUS = 13;

function project(lat: number, lon: number) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * HEIGHT;
  return { x, y };
}

/**
 * The regime map: family = hue, sub-type = tint, disagreement = hatch
 * (DESIGN.md §3). Each point carries a text label so colour is never the
 * only channel (DESIGN.md §10).
 */
export function RegimeMap({ records, selectedId, onSelect }: RegimeMapProps) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Peta rezim curah hujan, per lokasi"
      className="h-full w-full"
    >
      <defs>
        <pattern id="disagree-hatch" width={4} height={4} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1={0} y1={0} x2={0} y2={4} className="stroke-ink" strokeWidth={1.5} />
        </pattern>
      </defs>

      <rect x={0} y={0} width={WIDTH} height={HEIGHT} className="fill-stock stroke-rule" strokeWidth={0.5} />

      {records.map((record) => {
        const { x, y } = project(record.lat, record.lon);
        const isSelected = record.id === selectedId;
        const family = record.family as Family;
        return (
          <g key={record.id}>
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 9 : 7}
              aria-hidden="true"
              className={`pointer-events-none ${FAMILY_FILL_CLASS[family]} transition-[r] duration-fast ${
                isSelected ? "stroke-ink" : ""
              }`}
              strokeWidth={isSelected ? 3 : 0}
            />
            {record.agrees === false && (
              <circle cx={x} cy={y} r={isSelected ? 9 : 7} fill="url(#disagree-hatch)" className="pointer-events-none" />
            )}
            {/* The actual interactive target: same centre, invisible,
                bigger — see HIT_RADIUS above. */}
            <circle
              cx={x}
              cy={y}
              r={HIT_RADIUS}
              fill="transparent"
              className="cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={`${record.name}, ${FAMILY_LABEL[family]}${record.agrees === false ? ", berbeda dari klasifikasi BMKG" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(record.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(record.id);
                }
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
