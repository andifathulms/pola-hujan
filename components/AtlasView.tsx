"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ArchetypeRecord, Manifest, RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, MONTH_NAMES_ID, type Family } from "@/lib/family";
import { RegimeMap } from "@/components/map/RegimeMap";
import { ArchetypeStrip } from "@/components/archetypes/ArchetypeStrip";
import { Legend } from "@/components/Legend";
import { YourPlace } from "@/components/YourPlace";
import { NearestOppositeFinding } from "@/components/NearestOppositeFinding";
import { RegimeWall } from "@/components/wall/RegimeWall";
import { AtlasFilters } from "@/components/AtlasFilters";
import { CycleCurve } from "@/components/curve/CycleCurve";
import { CycleTable } from "@/components/table/CycleTable";
import { CityStats, FamilyBadges, SimilarPlaces, WhyThisFamily } from "@/components/atlas/CityReading";
import { EMPTY_FILTERS, applyFilters, type AtlasFilterState } from "@/lib/atlasFilters";
import { ATLAS_LEAD } from "@/lib/pageCopy";
import { cityHref, compareHref, explainerHref } from "@/lib/routes";

export interface AtlasViewProps {
  records: RegimeRecord[];
  archetypes: ArchetypeRecord[];
  manifest: Manifest;
  /** "2006–2015", lib/grid/lookup's PERIOD_LABEL. */
  periodLabel: string;
}

/**
 * The atlas (DESIGN.md §6): the map and the selected city's reading side
 * by side — two co-equal objects, never overlaid — then the wall of every
 * city beneath. One filter state drives the map and the wall; one
 * selection drives the map ring, the reading and the wall cell.
 */
export function AtlasView({ records, archetypes, manifest, periodLabel }: AtlasViewProps) {
  const [selectedId, setSelectedId] = useState<string>(records[0]?.id ?? "");
  const selected = records.find((r) => r.id === selectedId) ?? records[0];
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<"regime" | "month">("regime");
  const [month, setMonth] = useState(0);

  const [filters, setFilters] = useState<AtlasFilterState>(EMPTY_FILTERS);
  const visibleRecords = useMemo(() => applyFilters(records, filters), [records, filters]);
  const byId = useMemo(() => new Map(records.map((r) => [r.id, r])), [records]);
  const maxMonthlyMm = useMemo(() => Math.max(1, ...records.map((r) => r.monthlyMm[r.wettestMonth] ?? 0)), [records]);

  // ?lokasi= in, and kept in sync out: a city's URL reproduces the view.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lokasi");
    if (fromUrl && records.some((r) => r.id === fromUrl)) setSelectedId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lokasi", selectedId);
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  // Announce a selection change to screen readers, but not on first load.
  const isFirstSelection = useRef(true);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (isFirstSelection.current) {
      isFirstSelection.current = false;
      return;
    }
    if (!selected) return;
    setAnnouncement(`${selected.name}, ${FAMILY_LABEL[selected.family as Family]}, terbasah ${MONTH_NAMES_ID[selected.wettestMonth]}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Phones: the reading sits below the map, so a slim bar names the
  // selection and jumps to it — hidden whenever the reading is on screen.
  const readingRef = useRef<HTMLElement>(null);
  const [readingVisible, setReadingVisible] = useState(true);
  useEffect(() => {
    const el = readingRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setReadingVisible(entry?.isIntersecting ?? true), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!selected) {
    return <p className="p-6">Tidak ada data lokasi.</p>;
  }

  const family = selected.family as Family;
  // The comparison the atlas is built around: Jakarta against whichever
  // place is selected, or Ambon when Jakarta itself is.
  const compareWith = selected.id === "jakarta" ? "ambon" : "jakarta";
  const compareName = byId.get(compareWith)?.name;

  return (
    <div id="main-content" className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pb-24 pt-6 lg:px-6 lg:pb-12 lg:pt-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[64ch] flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">
            Peta · {records.length} kota · normal CHIRPS 2.0, {periodLabel}
          </p>
          <h1 className="text-2xl font-extrabold leading-[1.05] tracking-tight lg:text-3xl">Peta pola hujan</h1>
          <p className="font-story text-lg italic leading-snug">{ATLAS_LEAD}</p>
        </div>
        <YourPlace records={records} onFound={setSelectedId} />
      </header>

      <AtlasFilters records={records} filters={filters} onChange={setFilters} visibleCount={visibleRecords.length} />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-card border border-rule">
            <RegimeMap
              records={visibleRecords}
              selectedId={selectedId}
              onSelect={setSelectedId}
              nearestOppositePair={manifest.nearestOppositePair}
              mode={mapMode}
              month={month}
              highlightId={hoverId}
              maxMonthlyMm={maxMonthlyMm}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-xs text-ink-muted">Warnai titik:</span>
            <div role="group" aria-label="Mode peta" className="inline-flex rounded-full bg-plate p-1">
              {(
                [
                  ["regime", "Rezim"],
                  ["month", "Hujan per bulan"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={mapMode === mode}
                  onClick={() => setMapMode(mode)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-fast ${
                    mapMode === mode ? "bg-stock text-ink shadow-[0_1px_2px_rgba(20,23,31,0.12)]" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {mapMode === "month" && (
              <div role="group" aria-label="Pilih bulan" className="flex flex-wrap gap-0.5">
                {MONTH_LABELS_ID.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={month === i}
                    aria-label={MONTH_NAMES_ID[i]}
                    onClick={() => setMonth(i)}
                    className={`rounded-full px-2 py-1 font-mono text-xs transition-colors duration-fast ${
                      month === i ? "bg-ink text-stock" : "text-ink-muted hover:bg-plate hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {mapMode === "month" && (
            <p className="text-xs text-ink-muted">
              Luas titik sebanding dengan curah hujan normal {MONTH_NAMES_ID[month]}; warna tetap keluarga rezim. Normal jangka
              panjang, bukan prakiraan.
            </p>
          )}

          <NearestOppositeFinding pair={manifest.nearestOppositePair} onSelect={setSelectedId} />
          <Legend manifest={manifest} periodLabel={periodLabel} />
        </div>

        <article
          ref={readingRef}
          id="bacaan"
          aria-labelledby="bacaan-nama"
          className="flex scroll-mt-20 flex-col gap-5 rounded-card border border-rule bg-plate/50 p-5 lg:p-6"
        >
          <header className="flex flex-col gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">{selected.province}</p>
              <h2 id="bacaan-nama" className="text-2xl font-extrabold leading-none tracking-tight lg:text-3xl">
                {selected.name}
              </h2>
            </div>
            <FamilyBadges record={selected} />
          </header>

          <CityStats record={selected} manifest={manifest} />

          {/* Keyed on the city so the curve redraws month by month on each
              selection — the orchestrated moment (DESIGN.md §7). */}
          <div className="flex flex-col gap-2 rounded-card bg-stock p-3">
            <CycleCurve
              key={selected.id}
              monthlyMm={selected.monthlyMm}
              annualCurveMm={selected.annualCurveMm}
              semiAnnualCurveMm={selected.semiAnnualCurveMm}
              meanMm={selected.fit.meanMm}
              family={family}
            />
            <div className="overflow-x-auto">
              <CycleTable monthlyMm={selected.monthlyMm} caption={`Curah hujan bulanan normal di ${selected.name}, mm`} />
            </div>
          </div>

          <WhyThisFamily record={selected} manifest={manifest} />

          <SimilarPlaces record={selected} lookup={(id) => byId.get(id)} onSelect={setSelectedId} />

          <div className="flex flex-wrap gap-2 border-t border-rule pt-4">
            <Link
              href={cityHref(selected.id)}
              className="inline-flex items-center gap-2 rounded-full border border-stitch px-4 py-2 text-xs font-bold text-ink no-underline hover:border-ink"
            >
              Halaman {selected.name}
            </Link>
            {compareName && (
              <Link
                href={compareHref(selected.id, compareWith)}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold text-stock no-underline hover:bg-ink/85"
              >
                Bandingkan dengan {compareName} →
              </Link>
            )}
            <Link
              href={explainerHref(selected.id)}
              className="inline-flex items-center gap-2 rounded-full border border-stitch px-4 py-2 text-xs font-bold text-ink no-underline hover:border-ink"
            >
              Ubah gelombangnya sendiri
            </Link>
          </div>

          <ArchetypeStrip archetypes={archetypes} activeFamily={family} />
        </article>
      </div>

      <RegimeWall
        records={visibleRecords}
        totalCount={records.length}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          readingRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }}
        onHover={setHoverId}
      />

      {/* Phones only: a slim bar naming the selection while the reading is off screen. */}
      <a
        href="#bacaan"
        aria-hidden={readingVisible}
        tabIndex={readingVisible ? -1 : 0}
        className={`fixed inset-x-3 bottom-3 z-20 flex items-center justify-between gap-3 rounded-full bg-ink px-5 py-3 text-stock no-underline shadow-[0_12px_30px_-10px_rgba(20,23,31,0.6)] transition duration-state lg:hidden ${
          readingVisible ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
        }`}
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <span className="min-w-0 truncate text-sm font-bold">
          {selected.name} <span className={`font-semibold opacity-80`}>· {FAMILY_LABEL[family]}</span>
        </span>
        <span className="flex-none text-xs font-semibold">Lihat bacaan ↓</span>
      </a>
    </div>
  );
}
