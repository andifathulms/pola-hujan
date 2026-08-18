"use client";

import { useEffect, useState } from "react";
import type { ArchetypeRecord, Manifest, RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";
import { RegimeMap } from "@/components/map/RegimeMap";
import { CycleCurve } from "@/components/curve/CycleCurve";
import { CycleTable } from "@/components/table/CycleTable";
import { ArchetypeStrip } from "@/components/archetypes/ArchetypeStrip";
import { Legend } from "@/components/Legend";
import { YourPlace } from "@/components/YourPlace";
import { NearestOppositeFinding } from "@/components/NearestOppositeFinding";

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

  const selected = records.find((r) => r.id === selectedId) ?? records[0];

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
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold lg:text-3xl">Pola Hujan</h1>
        <p className="max-w-prose text-lg">
          Setiap kota di peta ini diklasifikasikan ke salah satu dari tiga pola musim hujan tahunan, dihitung
          langsung dari data curah hujan asli — lalu dibandingkan dengan peta resmi BMKG.
        </p>
        <p className="text-sm text-ink/70">Atlas rezim curah hujan tahunan Indonesia — bukan animasi angin, bukan prakiraan.</p>
      </header>

      <NearestOppositeFinding pair={manifest.nearestOppositePair} onSelect={setSelectedId} />

      <Legend manifest={manifest} />
      <YourPlace records={records} onFound={setSelectedId} />

      <p className="text-sm text-ink/70">Pilih kota di peta, atau dari daftar lokasi di bagian bawah halaman.</p>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
        {/* Mobile: map fixed at 45vh (DESIGN.md §6); desktop: natural
            height within the left two-thirds column. */}
        <div className="h-[45vh] lg:h-auto lg:col-span-2">
          <RegimeMap records={records} selectedId={selectedId} onSelect={setSelectedId} />
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
              <p className="font-mono text-sm text-ink/70">
                BMKG {selected.bmkgFamilySource === "bmkg-zom9120" ? "(terverifikasi ZOM9120)" : "(perkiraan)"}:{" "}
                {FAMILY_LABEL[selected.bmkgFamily as Family]}
                {selected.agrees === false ? " (berbeda dari klasifikasi turunan)" : " (cocok)"}
              </p>
            )}

            <details className="mt-1 text-sm text-ink/70">
              <summary className="cursor-pointer select-none font-medium text-ink">Kenapa {selected.name} diklasifikasi {FAMILY_LABEL[family]}?</summary>
              <dl className="mt-1 flex flex-col gap-0.5 font-mono text-xs">
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
          </div>

          <CycleCurve
            monthlyMm={selected.monthlyMm}
            annualCurveMm={selected.annualCurveMm}
            semiAnnualCurveMm={selected.semiAnnualCurveMm}
            meanMm={selected.fit.meanMm}
            family={family}
          />

          <CycleTable monthlyMm={selected.monthlyMm} caption={`Curah hujan bulanan di ${selected.name}, mm`} />

          <ArchetypeStrip archetypes={archetypes} />
        </div>
      </div>

      <nav aria-label="Daftar lokasi" className="flex flex-wrap gap-2 border-t border-rule pt-4">
        {records.map((record) => (
          <button
            key={record.id}
            type="button"
            onClick={() => setSelectedId(record.id)}
            aria-pressed={record.id === selectedId}
            className={`rounded border px-2 py-1 text-sm transition-colors duration-fast ${
              record.id === selectedId ? "border-ink font-medium" : "border-rule text-ink/70"
            }`}
          >
            {record.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
