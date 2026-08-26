"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ArchetypeRecord, Manifest, RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";
import { RegimeMap } from "@/components/map/RegimeMap";
import { FieldPlate } from "@/components/curve/FieldPlate";
import { ArchetypeStrip } from "@/components/archetypes/ArchetypeStrip";
import { Legend } from "@/components/Legend";
import { YourPlace } from "@/components/YourPlace";
import { NearestOppositeFinding } from "@/components/NearestOppositeFinding";
import { ThresholdGauge } from "@/components/ThresholdGauge";
import { RegimeWall } from "@/components/wall/RegimeWall";
import { AtlasFilters } from "@/components/AtlasFilters";
import { EMPTY_FILTERS, applyFilters, type AtlasFilterState } from "@/lib/atlasFilters";
import { ATLAS_LEAD } from "@/lib/pageCopy";

/** Circular distance in months is always in [0, 6] — lib/harmonic/thresholds.ts's own documented range for the quantity, not a threshold itself, so fixing it as the gauge's axis doesn't touch thresholds.ts. */
const DISPLACEMENT_GAUGE_MAX_MONTHS = 6;

/**
 * The plain-language bridge from a raw ratio/displacement number to
 * what it actually means — the disclosure below cites the exact number
 * and its threshold (so the label is checkable), but a number alone
 * doesn't explain why crossing it means "two peaks" or "wrong half of
 * the year." Exhaustive switch, never default, per CLAUDE.md
 * Conventions — adding a family surfaces this as a compile error.
 */
function classificationReason(family: Family, detail: RegimeRecord["classificationDetail"], thresholds: Manifest["thresholds"]): string {
  switch (family) {
    case "ekuatorial": {
      const ratioText = detail.semiToAnnualRatio === null ? "tak terhingga" : detail.semiToAnnualRatio.toFixed(2);
      return `Harmonik dua-puncak-per-tahunnya lebih kuat dari yang satu-puncak (rasio ${ratioText}, ambang ${thresholds.ekuatorialDominanceRatio.toFixed(2)}) — dua musim hujan dalam setahun, bukan satu.`;
    }
    case "monsunal": {
      const displacement = (detail.displacementMonths ?? 0).toFixed(1);
      return `Puncak hujannya jatuh ${displacement} bulan dari pusat monsun Asia, masih dalam ambang Monsunal (≤${thresholds.monsunalMaxDisplacementMonths} bulan) — musim hujannya bertepatan dengan sebagian besar Indonesia.`;
    }
    case "lokal": {
      const displacement = (detail.displacementMonths ?? 0).toFixed(1);
      return `Puncak hujannya jatuh ${displacement} bulan dari pusat monsun Asia, melewati ambang Lokal (>${thresholds.lokalMinDisplacementMonths} bulan) — musim hujannya justru di luar musim hujan Asia.`;
    }
    default: {
      const exhaustive: never = family;
      return exhaustive;
    }
  }
}

export interface AtlasViewProps {
  records: RegimeRecord[];
  archetypes: ArchetypeRecord[];
  manifest: Manifest;
}

/**
 * The atlas spread (DESIGN.md §6): map and curve panel as two co-equal
 * objects, never overlaid. Desktop puts the map on the left two-thirds
 * and the curve panel — with the archetype strip along its bottom — on
 * the right third; mobile stacks map, curve, then archetypes.
 */
export function AtlasView({ records, archetypes, manifest }: AtlasViewProps) {
  const [selectedId, setSelectedId] = useState<string>(records[0]?.id ?? "");
  const selected = records.find((r) => r.id === selectedId) ?? records[0];

  // The map and the wall draw the same filtered set, from one filter
  // state — two views of one atlas, never two answers to the same
  // question. The selected reading is deliberately not cleared when it
  // filters out: the reader asked for that place, and a filter is about
  // what else is on screen beside it.
  const [filters, setFilters] = useState<AtlasFilterState>(EMPTY_FILTERS);
  const visibleRecords = useMemo(() => applyFilters(records, filters), [records, filters]);

  // Read the initial selection from ?lokasi= on mount (window, not a
  // Next.js hook, so no Suspense boundary is needed for a static
  // export), and keep the URL in sync afterwards — this is the M6
  // "sharing" feature: a location's URL is enough to reproduce the view.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lokasi");
    if (fromUrl && records.some((r) => r.id === fromUrl)) {
      setSelectedId(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lokasi", selectedId);
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  // Announces the selection change to screen readers (see the sr-only
  // <p> below) — but not on first mount/page load, where it would just
  // duplicate what's already read from the visible panel.
  const isFirstSelection = useRef(true);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (isFirstSelection.current) {
      isFirstSelection.current = false;
      return;
    }
    if (!selected) return;
    const selectedFamily = selected.family as Family;
    setAnnouncement(
      `${selected.name}, ${FAMILY_LABEL[selectedFamily]}, puncak ${MONTH_LABELS_ID[Math.round(selected.peakMonth) % 12]}.`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!selected) {
    return <p className="p-6">Tidak ada data lokasi.</p>;
  }

  const family = selected.family as Family;
  const driestMonthIndex = selected.monthlyMm.reduce(
    (minIdx, mm, idx, arr) => (mm < (arr[minIdx] ?? Infinity) ? idx : minIdx),
    0,
  );

  return (
    <div id="main-content" className="flex flex-col gap-6 p-4 lg:p-6">
      {/* One eyebrow, one name, one sentence, one finding. The atlas used
          to sit under five stacked blocks — a headline, a lead, a
          caption, a bordered finding and a bordered legend — so a reader
          who came to see where it rains met four paragraphs first. The
          legend contract is not weakened by this; it moved to where it
          belongs, directly under the map it qualifies. */}
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/70">
          Atlas rezim curah hujan tahunan · Indonesia
        </p>
        <h1 className="font-display text-2xl font-semibold lg:text-3xl">Pola Hujan</h1>
        <p className="max-w-prose text-lg">{ATLAS_LEAD}</p>
        <NearestOppositeFinding pair={manifest.nearestOppositePair} onSelect={setSelectedId} />
      </header>

      <div className="flex flex-col gap-3">
        <AtlasFilters records={records} filters={filters} onChange={setFilters} visibleCount={visibleRecords.length} />
        <YourPlace records={records} onFound={setSelectedId} />
      </div>

      {/* Selecting a city (map dot, bottom button list, the nearest-
          opposite-pair callout, or "your place") rewrites the panel
          below without moving focus there — this announces what changed
          for screen reader users, who'd otherwise get no signal that
          anything happened. Visually hidden; sighted users already see
          the panel update. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* Mobile: map fixed at 45vh (DESIGN.md §6); desktop: natural
              height within the left two-thirds column. */}
          <div className="h-[45vh] lg:h-auto">
            <RegimeMap
              records={visibleRecords}
              selectedId={selectedId}
              onSelect={setSelectedId}
              nearestOppositePair={manifest.nearestOppositePair}
            />
          </div>

          {/* "On the map itself" (CLAUDE.md invariant 6) read literally:
              the derived-not-official statement is the map's own caption,
              not a card somewhere above it. */}
          <Legend manifest={manifest} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-1">
          <div>
            <h2 className="font-display text-lg font-semibold">{selected.name}</h2>
            <p className="text-xs text-ink/70">{selected.province}</p>
            <p className={`text-sm font-medium ${FAMILY_TEXT_CLASS[family]}`}>
              {FAMILY_LABEL[family]} · {selected.subtype}
            </p>
            <p className="font-mono text-sm text-ink/70">
              Puncak {MONTH_LABELS_ID[Math.round(selected.peakMonth) % 12]} · Terkering{" "}
              {MONTH_LABELS_ID[driestMonthIndex]}
            </p>
            {selected.bmkgFamily && (
              <p className="text-sm text-ink/70">
                BMKG {selected.bmkgFamilySource === "bmkg-zom9120" ? "(terverifikasi ZOM9120)" : "(perkiraan)"}:{" "}
                <span className="font-medium text-ink">{FAMILY_LABEL[selected.bmkgFamily as Family]}</span>
                {selected.agrees === false ? " — berbeda dari klasifikasi turunan" : " — cocok"}
              </p>
            )}

            {/* Plain-language bridge is always visible, not behind a
                click — a reader shouldn't have to seek out why a label
                says what it says. The exact numbers it's paraphrasing
                stay in the disclosure below for anyone checking the
                arithmetic itself. */}
            <p className="mt-1 text-sm text-ink/70">{classificationReason(family, selected.classificationDetail, manifest.thresholds)}</p>

            <details className="mt-1 text-sm text-ink/70">
              <summary className="cursor-pointer select-none font-medium text-ink">Lihat angka pastinya</summary>

              {/* A value's position relative to the threshold that decided it
                  (DESIGN-REWORK.md §2.1) — how close this location sits to a
                  different classification under a defensible different
                  threshold. Both criteria shown even when only one was
                  decisive, so the reader sees the whole picture, not just
                  the winning one. Purely visual; the <dl> below carries the
                  same numbers as the always-present, precise text reading. */}
              <div className="mt-2 flex flex-col gap-3">
                {selected.classificationDetail.semiToAnnualRatio !== null && (
                  <ThresholdGauge
                    label="Rasio semi-tahunan/tahunan"
                    valueText={selected.classificationDetail.semiToAnnualRatio.toFixed(2)}
                    thresholdText={`ambang Ekuatorial ${manifest.thresholds.ekuatorialDominanceRatio.toFixed(2)}`}
                    value={selected.classificationDetail.semiToAnnualRatio}
                    threshold={manifest.thresholds.ekuatorialDominanceRatio}
                    domainMin={0}
                    domainMax={Math.max(
                      manifest.thresholds.ekuatorialDominanceRatio * 2,
                      selected.classificationDetail.semiToAnnualRatio * 1.2,
                    )}
                    family={family}
                  />
                )}
                {selected.classificationDetail.displacementMonths !== undefined && (
                  <ThresholdGauge
                    label="Jarak puncak dari pusat monsun"
                    valueText={`${selected.classificationDetail.displacementMonths.toFixed(2)} bulan`}
                    thresholdText={
                      family === "lokal"
                        ? `ambang Lokal >${manifest.thresholds.lokalMinDisplacementMonths} bulan`
                        : `ambang Monsunal ≤${manifest.thresholds.monsunalMaxDisplacementMonths} bulan`
                    }
                    value={selected.classificationDetail.displacementMonths}
                    threshold={family === "lokal" ? manifest.thresholds.lokalMinDisplacementMonths : manifest.thresholds.monsunalMaxDisplacementMonths}
                    domainMin={0}
                    domainMax={DISPLACEMENT_GAUGE_MAX_MONTHS}
                    family={family}
                  />
                )}
              </div>

              <dl className="mt-2 flex flex-col gap-1 font-mono text-xs">
                <div>
                  <dt className="inline">Rasio semi-tahunan/tahunan: </dt>
                  <dd className="inline tabular-nums">
                    {selected.classificationDetail.semiToAnnualRatio === null
                      ? "tak terhingga (amplitudo tahunan nol)"
                      : selected.classificationDetail.semiToAnnualRatio.toFixed(2)}
                  </dd>
                  <dd className="inline"> — ambang Ekuatorial {manifest.thresholds.ekuatorialDominanceRatio.toFixed(2)}</dd>
                </div>
                {selected.classificationDetail.displacementMonths !== undefined && (
                  <div>
                    <dt className="inline">Jarak puncak dari pusat monsun: </dt>
                    <dd className="inline tabular-nums">{selected.classificationDetail.displacementMonths.toFixed(2)} bulan</dd>
                    <dd className="inline">
                      {" "}
                      — ambang Monsunal ≤{manifest.thresholds.monsunalMaxDisplacementMonths}, Lokal &gt;
                      {manifest.thresholds.lokalMinDisplacementMonths}
                    </dd>
                  </div>
                )}
              </dl>
            </details>

            <Link href={`/harmonik/?dari=${selected.id}`} className="mt-1 inline-block text-sm text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
              Coba ubah angka {selected.name} sendiri di penjelas harmonik →
            </Link>
          </div>

          <ArchetypeStrip archetypes={archetypes} activeFamily={family} />
        </div>
      </div>

      <FieldPlate
        name={selected.name}
        province={selected.province}
        family={family}
        subtype={selected.subtype}
        monthlyMm={selected.monthlyMm}
        annualCurveMm={selected.annualCurveMm}
        semiAnnualCurveMm={selected.semiAnnualCurveMm}
        meanMm={selected.fit.meanMm}
      />

      {/* Replaces a flat list of 34 name buttons. That list was the only
          way to reach a location other than hunting for its dot, and it
          showed nothing about the place it named — so browsing the atlas
          meant clicking through 34 single readings and remembering them.
          The wall names the same 34 locations and draws each one's cycle
          next to its name, which makes the list itself the comparison. */}
      <RegimeWall
        records={visibleRecords}
        totalCount={records.length}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
