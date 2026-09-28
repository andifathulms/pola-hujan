"use client";

import type { Manifest, Mosaic, RegimeRecord } from "@/lib/grid/schema";
import { codeToFamily, isTintCode, mosaicRuns } from "@/lib/grid/mosaic";
import { FAMILY_FILL_CLASS, FAMILY_LABEL, FAMILY_STROKE_CLASS, FAMILY_TINT_FILL_CLASS, MONTH_NAMES_ID, formatMm, subtypeFillClass, type Family } from "@/lib/family";
import { INDONESIA_OUTLINE_PATH } from "@/lib/geo/indonesiaOutline";

export interface RegimeMapProps {
  records: RegimeRecord[];
  selectedId: string | undefined;
  /** Omit for a picture-only map (the home page hero): no dot becomes a tab stop or a button. */
  onSelect?: (id: string) => void;
  /** Drawn as a hairline between the two dots — DESIGN-REWORK.md §3. Optional so the map still renders without it (e.g. fewer than two families present). */
  nearestOppositePair?: Manifest["nearestOppositePair"];
  /**
   * "regime" draws family (hue), sub-type (tint) and BMKG disagreement
   * (hatch). "month" sizes each dot by that month's normal rainfall —
   * size is a separate channel from hue, so the categorical encoding is
   * untouched and no colour ramp is introduced (CLAUDE.md invariant 11).
   */
  mode?: "regime" | "month";
  /** Month index 0–11, used only in "month" mode. */
  month?: number;
  /** A location to ring lightly without selecting it — the wall's hover. */
  highlightId?: string | null;
  /** Locations whose names are drawn on the map. The selected one is always labelled. */
  labelIds?: string[];
  /** Largest monthly normal in the whole build, so dot sizes stay comparable while filters change. */
  maxMonthlyMm?: number;
  ariaLabel?: string;
  /**
   * The 0.25° regime mosaic, drawn under the cities in "regime" mode.
   * Same encoding as the dots — family hue, sub-type tint — at lower
   * opacity so the cities stay the thing you select. Derived cells, not
   * zone boundaries (CLAUDE.md invariant 7).
   */
  mosaic?: Mosaic;
}

/** Month-mode radius: area proportional to rainfall, with a small floor so a 3 mm month is still findable. */
const MONTH_MIN_RADIUS = 1.8;
const MONTH_MAX_RADIUS = 20;
const REGIME_RADIUS = 6.5;

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
export function RegimeMap({
  records,
  selectedId,
  onSelect,
  nearestOppositePair,
  mode = "regime",
  month = 0,
  highlightId = null,
  labelIds = [],
  maxMonthlyMm,
  ariaLabel = "Peta rezim curah hujan, per lokasi",
  mosaic,
}: RegimeMapProps) {
  const showMosaic = mode === "regime" && mosaic !== undefined && mosaic.rows > 0;
  const oppositeA = nearestOppositePair && records.find((r) => r.id === nearestOppositePair.aId);
  const oppositeB = nearestOppositePair && records.find((r) => r.id === nearestOppositePair.bId);
  const monthScale = maxMonthlyMm ?? Math.max(1, ...records.map((r) => Math.max(...r.monthlyMm)));
  const radiusFor = (record: RegimeRecord) =>
    mode === "month"
      ? MONTH_MIN_RADIUS + Math.sqrt((record.monthlyMm[month] ?? 0) / monthScale) * (MONTH_MAX_RADIUS - MONTH_MIN_RADIUS)
      : REGIME_RADIUS;
  // In month mode the big dots draw first so the small ones stay on top
  // and clickable; in regime mode source order is kept.
  const drawOrder = mode === "month" ? [...records].sort((a, b) => radiusFor(b) - radiusFor(a)) : records;
  const labelled = new Set([...labelIds, ...(selectedId ? [selectedId] : [])]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role={onSelect ? "group" : "img"}
      aria-label={ariaLabel}
      className="h-full w-full"
    >
      <defs>
        <pattern id="disagree-hatch" width={3.2} height={3.2} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width={3.2} height={3.2} className="fill-stock" />
          <rect width={1.3} height={3.2} className="fill-ink" />
        </pattern>
      </defs>

      {/* Sea, graticule, land: the sea is the one cool neutral, so the
          coast reads as an edge without a heavy stroke. */}
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} className="fill-sea" />

      <g aria-hidden="true" className="pointer-events-none">
        {MERIDIANS.map((lon) => (
          <line key={lon} x1={project(0, lon).x} y1={0} x2={project(0, lon).x} y2={HEIGHT} className="stroke-rule" strokeWidth={0.5} />
        ))}
        {PARALLELS.filter((lat) => lat !== 0).map((lat) => (
          <line key={lat} x1={0} y1={project(lat, 0).y} x2={WIDTH} y2={project(lat, 0).y} className="stroke-rule" strokeWidth={0.5} />
        ))}
      </g>

      <path d={INDONESIA_OUTLINE_PATH} className="fill-land stroke-stitch" strokeWidth={0.6} strokeLinejoin="round" aria-hidden="true" />

      {showMosaic && mosaic && (
        <g aria-hidden="true" className="pointer-events-none" shapeRendering="crispEdges">
          {mosaicRuns(mosaic).map((run) => {
            const family = codeToFamily(run.code);
            if (!family) return null;
            const nw = project(mosaic.latMax - run.row * mosaic.step, mosaic.lonMin + run.col * mosaic.step);
            const se = project(mosaic.latMax - (run.row + 1) * mosaic.step, mosaic.lonMin + (run.col + run.length) * mosaic.step);
            return (
              <rect
                key={`${run.row}-${run.col}`}
                x={nw.x}
                y={nw.y}
                width={se.x - nw.x}
                height={se.y - nw.y}
                className={isTintCode(run.code) ? FAMILY_TINT_FILL_CLASS[family] : FAMILY_FILL_CLASS[family]}
                fillOpacity={0.55}
              />
            );
          })}
          {/* The coast again, over the cells, so the land still has an edge. */}
          <path d={INDONESIA_OUTLINE_PATH} fill="none" className="stroke-ink/40" strokeWidth={0.5} strokeLinejoin="round" />
        </g>
      )}

      {/* The equator, over the coastline — it is the axis the
          classification turns on, not background furniture. */}
      <g aria-hidden="true" className="pointer-events-none">
        <line x1={0} y1={project(0, 0).y} x2={WIDTH} y2={project(0, 0).y} className="stroke-ink/50" strokeWidth={0.75} strokeDasharray="5 4" />
        <text x={WIDTH - 8} y={project(0, 0).y - 5} textAnchor="end" className="fill-ink-muted font-mono text-tick tracking-[0.1em]">
          KHATULISTIWA
        </text>
        {PARALLELS.filter((lat) => lat !== 0).map((lat) => (
          <text key={lat} x={WIDTH - 6} y={project(lat, 0).y - 4} textAnchor="end" className="fill-ink-muted font-mono text-tick">
            {parallelLabel(lat)}
          </text>
        ))}
      </g>

      {/* The nearest opposite pair, drawn (DESIGN-REWORK.md §3). `ink`,
          not a family hue — a relationship between regimes, not a regime. */}
      {mode === "regime" && oppositeA && oppositeB && nearestOppositePair && (
        <g aria-hidden="true" className="pointer-events-none">
          {(() => {
            const a = project(oppositeA.lat, oppositeA.lon);
            const b = project(oppositeB.lat, oppositeB.lon);
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const distanceLabel = nearestOppositePair.distanceKm < 1 ? "<1 km" : `${Math.round(nearestOppositePair.distanceKm)} km`;
            return (
              <>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-ink" strokeWidth={1} strokeDasharray="2 2" />
                <rect x={midX - distanceLabel.length * 3 - 3} y={midY - 7} width={distanceLabel.length * 6 + 6} height={11} rx={2} className="fill-stock" />
                <text x={midX} y={midY + 1.5} textAnchor="middle" className="fill-ink font-mono text-tick">
                  {distanceLabel}
                </text>
              </>
            );
          })()}
        </g>
      )}

      {drawOrder.map((record) => {
        const { x, y } = project(record.lat, record.lon);
        const isSelected = record.id === selectedId;
        const isHighlighted = record.id === highlightId;
        const family = record.family as Family;
        const r = radiusFor(record);
        const disagrees = mode === "regime" && record.agrees === false;
        const ringR = r + (disagrees ? 7 : 4);
        const monthText = mode === "month" ? `, ${formatMm(record.monthlyMm[month] ?? 0)} mm di ${MONTH_NAMES_ID[month]}` : "";
        return (
          <g key={record.id}>
            {disagrees && (
              <circle cx={x} cy={y} r={r + 3.4} fill="url(#disagree-hatch)" className="pointer-events-none stroke-ink" strokeWidth={0.6} />
            )}
            {showMosaic && <circle cx={x} cy={y} r={r + 1.6} aria-hidden="true" className="pointer-events-none fill-stock" />}
            <circle
              cx={x}
              cy={y}
              r={r}
              aria-hidden="true"
              className={`pointer-events-none transition-[r] duration-state ${
                mode === "month"
                  ? `${FAMILY_FILL_CLASS[family]} stroke-stock`
                  : `${subtypeFillClass(family, record.subtype)} ${FAMILY_STROKE_CLASS[family]}`
              }`}
              fillOpacity={mode === "month" ? 0.82 : 1}
              strokeWidth={mode === "month" ? 1 : 1.4}
            />
            {(isSelected || isHighlighted) && (
              <circle
                cx={x}
                cy={y}
                r={ringR}
                fill="none"
                className="pointer-events-none stroke-ink"
                strokeWidth={isSelected ? 2 : 1.2}
                strokeDasharray={isSelected ? undefined : "2 2"}
              />
            )}
            {/* The interactive target: same centre, invisible, bigger
                than the dot — see HIT_RADIUS above. */}
            {onSelect && (
              <circle
                cx={x}
                cy={y}
                r={Math.max(HIT_RADIUS, r)}
                fill="transparent"
                className="cursor-pointer focus:outline-none focus-visible:stroke-ink"
                strokeWidth={2.5}
                tabIndex={0}
                role="button"
                aria-label={`${record.name}, ${FAMILY_LABEL[family]} ${record.subtype}${monthText}${
                  record.agrees === false ? ", berbeda dari keluarga BMKG" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => onSelect(record.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(record.id);
                  }
                }}
              />
            )}
          </g>
        );
      })}

      {/* Names, over every dot, with a stock halo so they read on land or sea. */}
      <g aria-hidden="true" className="pointer-events-none">
        {records
          .filter((record) => labelled.has(record.id))
          .map((record) => {
            const { x, y } = project(record.lat, record.lon);
            const r = radiusFor(record) + (mode === "regime" && record.agrees === false ? 7 : 4);
            const flip = x > WIDTH - 90;
            return (
              <text
                key={record.id}
                x={flip ? x - r - 3 : x + r + 3}
                y={y + 4}
                textAnchor={flip ? "end" : "start"}
                className="fill-ink stroke-stock text-[12px] font-bold"
                strokeWidth={3.5}
                paintOrder="stroke"
                strokeLinejoin="round"
              >
                {record.name}
              </text>
            );
          })}
      </g>

      {/* Scale bar: makes the drawn km distance checkable. */}
      <g aria-hidden="true" className="pointer-events-none">
        <rect x={14} y={HEIGHT - 14} width={SCALE_BAR_WIDTH} height={3} className="fill-ink" />
        <rect x={14 + SCALE_BAR_WIDTH / 2} y={HEIGHT - 14} width={SCALE_BAR_WIDTH / 2} height={3} className="fill-stock stroke-ink" strokeWidth={0.6} />
        <text x={14} y={HEIGHT - 19} className="fill-ink-muted font-mono text-tick tabular-nums">
          {SCALE_BAR_KM} km di khatulistiwa
        </text>
      </g>
    </svg>
  );
}
