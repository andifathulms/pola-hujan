"use client";

import type { Manifest, RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_FILL_CLASS, FAMILY_LABEL, type Family } from "@/lib/family";
import { INDONESIA_OUTLINE_PATH } from "@/lib/geo/indonesiaOutline";

export interface RegimeMapProps {
  records: RegimeRecord[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  /** Drawn as a hairline between the two dots — DESIGN-REWORK.md §3. Optional so the map still renders without it (e.g. fewer than two families present). */
  nearestOppositePair?: Manifest["nearestOppositePair"];
}

// Indonesia's rough bounding box, used to place points on a plain SVG
// canvas and to pre-project the coastline outline below — there is no
// tile layer, no runtime reprojection, no mapping library. The
// coastline is a static checked-in path (lib/geo/indonesiaOutline.ts),
// not a rendering of anyone's zone boundaries (CLAUDE.md invariant 7 is
// about BMKG's own ZOM polygons specifically, not ordinary landmass
// geometry).
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

// Parallels and meridians drawn as a graticule. The equator is in the
// list twice over: once as a parallel, once as the line the whole
// classification turns on — a location's family is decided by where its
// rain peak sits relative to the Asian monsoon, and how far a place sits
// from the equator is the first-order reason that differs. Drawing it
// makes the map answer a question the dot colours only assert.
const PARALLELS = [5, 0, -5, -10];
const MERIDIANS = [100, 110, 120, 130, 140];

/** Label for a parallel in Indonesian map convention: LU north, LS south. */
function parallelLabel(lat: number): string {
  if (lat === 0) return "0\u00b0";
  return `${Math.abs(lat)}\u00b0${lat > 0 ? "LU" : "LS"}`;
}

// One degree of longitude at the equator, WGS84. Used only to size the
// scale bar — the map is a plain equirectangular plot, so this is
// honest at the equator and increasingly generous toward the edges of the
// latitude range, which is why the bar is labelled "di khatulistiwa".
const KM_PER_LON_DEGREE_AT_EQUATOR = 111.32;
const SCALE_BAR_KM = 500;
const SCALE_BAR_WIDTH = (SCALE_BAR_KM / KM_PER_LON_DEGREE_AT_EQUATOR) * (WIDTH / (LON_MAX - LON_MIN));

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
export function RegimeMap({ records, selectedId, onSelect, nearestOppositePair }: RegimeMapProps) {
  const oppositeA = nearestOppositePair && records.find((r) => r.id === nearestOppositePair.aId);
  const oppositeB = nearestOppositePair && records.find((r) => r.id === nearestOppositePair.bId);

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

      {/* Sea, then land, then the graticule over both — three value-steps
          of the same warm neutral, so the coast reads as an edge rather
          than as a stroke around a grey shape on the page ground. */}
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} className="fill-sea stroke-rule" strokeWidth={0.5} />

      <g aria-hidden="true" className="pointer-events-none">
        {MERIDIANS.map((lon) => (
          <line
            key={lon}
            x1={project(0, lon).x}
            y1={0}
            x2={project(0, lon).x}
            y2={HEIGHT}
            className="stroke-stitch/60"
            strokeWidth={0.5}
          />
        ))}
        {PARALLELS.filter((lat) => lat !== 0).map((lat) => (
          <line
            key={lat}
            x1={0}
            y1={project(lat, 0).y}
            x2={WIDTH}
            y2={project(lat, 0).y}
            className="stroke-stitch/60"
            strokeWidth={0.5}
          />
        ))}
      </g>

      {/* Orientation only — quiet enough that family colour (the actual
          data channel) still reads as the strongest thing on the
          canvas. Decorative: not part of the classification, so it
          carries no label of its own. */}
      <path d={INDONESIA_OUTLINE_PATH} className="fill-land stroke-stitch" strokeWidth={0.6} aria-hidden="true" />

      {/* The equator, over the coastline rather than under it — it is the
          axis the classification turns on, not background furniture. */}
      <g aria-hidden="true" className="pointer-events-none">
        <line
          x1={0}
          y1={project(0, 0).y}
          x2={WIDTH}
          y2={project(0, 0).y}
          className="stroke-ink/55"
          strokeWidth={0.75}
          strokeDasharray="6 4"
        />
        {PARALLELS.map((lat) => (
          <text key={lat} x={5} y={project(lat, 0).y - 4} className="fill-ink/70 font-mono text-tick">
            {parallelLabel(lat)}
          </text>
        ))}
      </g>

      {/* The sharpest local instance of PRD.md §1's founding claim, drawn
          rather than only stated in NearestOppositeFinding's paragraph
          above the map (DESIGN-REWORK.md §3). `ink`, not a family hue —
          this is a relationship between two regimes, not a regime
          (CLAUDE.md invariant 10). aria-hidden: the paragraph already
          carries this as text. */}
      {oppositeA && oppositeB && nearestOppositePair && (
        <g aria-hidden="true" className="pointer-events-none">
          {(() => {
            const a = project(oppositeA.lat, oppositeA.lon);
            const b = project(oppositeB.lat, oppositeB.lon);
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const distanceLabel = nearestOppositePair.distanceKm < 1 ? "<1 km" : `${Math.round(nearestOppositePair.distanceKm)} km`;
            return (
              <>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-ink" strokeWidth={1} />
                <rect x={midX - distanceLabel.length * 3 - 2} y={midY - 7} width={distanceLabel.length * 6 + 4} height={10} className="fill-sea" />
                <text x={midX} y={midY + 1} textAnchor="middle" className="fill-ink font-mono text-tick">
                  {distanceLabel}
                </text>
              </>
            );
          })()}
        </g>
      )}

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

      {/* Distances on this map are readable, not decorative: the nearest
          opposite pair is drawn with a km label, and this is what makes
          that number checkable against the rest of the archipelago. */}
      <g aria-hidden="true" className="pointer-events-none">
        <line
          x1={WIDTH - SCALE_BAR_WIDTH - 12}
          y1={HEIGHT - 14}
          x2={WIDTH - 12}
          y2={HEIGHT - 14}
          className="stroke-ink"
          strokeWidth={1}
        />
        <line x1={WIDTH - SCALE_BAR_WIDTH - 12} y1={HEIGHT - 17} x2={WIDTH - SCALE_BAR_WIDTH - 12} y2={HEIGHT - 11} className="stroke-ink" strokeWidth={1} />
        <line x1={WIDTH - 12} y1={HEIGHT - 17} x2={WIDTH - 12} y2={HEIGHT - 11} className="stroke-ink" strokeWidth={1} />
        <text x={WIDTH - 12} y={HEIGHT - 20} textAnchor="end" className="fill-ink/70 font-mono text-tick tabular-nums">
          {SCALE_BAR_KM} km di khatulistiwa
        </text>
      </g>
    </svg>
  );
}
