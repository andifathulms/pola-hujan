"use client";

import { useEffect, useRef, useState } from "react";
import type { RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_BG_CLASS, FAMILY_LABEL, type Family } from "@/lib/family";
import { circularMonthDistance } from "@/lib/harmonic";
import { CycleTable } from "@/components/table/CycleTable";
import { StackedCompare } from "@/components/compare/StackedCompare";
import { BANDING_LEAD } from "@/lib/pageCopy";
import type { ComparePreset } from "@/lib/comparePresets";
import { formatDecimal, formatMm } from "@/lib/family";

export interface CompareViewProps {
  records: RegimeRecord[];
  defaultLeftId: string;
  defaultRightId: string;
  presets: ComparePreset[];
}

function LocationPicker({
  records,
  value,
  onChange,
  label,
  id,
}: {
  records: RegimeRecord[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  id: string;
}) {
  const selected = records.find((r) => r.id === value);
  return (
    <label htmlFor={id} className="flex min-w-[200px] flex-1 flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      <span className="relative flex items-center">
        {selected && (
          <span aria-hidden className={`pointer-events-none absolute left-4 h-2.5 w-2.5 rounded-full ${FAMILY_BG_CLASS[selected.family as Family]}`} />
        )}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-full border border-stitch bg-stock py-2.5 pl-9 pr-10 text-sm font-bold text-ink hover:border-ink"
        >
          {records.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {FAMILY_LABEL[r.family as Family]}
            </option>
          ))}
        </select>
        <svg aria-hidden viewBox="0 0 12 12" width="12" height="12" className="pointer-events-none absolute right-4 fill-none stroke-ink" strokeWidth="1.6">
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </span>
    </label>
  );
}

/**
 * Two places, stacked, sharing one fixed Jan-Dec axis (PRD.md §6.4,
 * DESIGN.md §6, DESIGN-REWORK.md §1.1) — one axis drawn once, gridlines
 * running through both panels, rather than two independent axes the
 * reader has to align mentally. Both curves still draw simultaneously —
 * that simultaneity is the demonstration, so this deliberately does not
 * stagger the two CycleCurve mounts against each other.
 */
export function CompareView({ records, defaultLeftId, defaultRightId, presets }: CompareViewProps) {
  const [leftId, setLeftId] = useState(defaultLeftId);
  const [rightId, setRightId] = useState(defaultRightId);

  // Same URL-sync approach as AtlasView: read ?kiri=&kanan= on mount,
  // keep them in sync afterwards, so a comparison can be shared as a
  // link (M6 "sharing" — see the note in components/AtlasView.tsx).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kiri = params.get("kiri");
    const kanan = params.get("kanan");
    if (kiri && records.some((r) => r.id === kiri)) setLeftId(kiri);
    if (kanan && records.some((r) => r.id === kanan)) setRightId(kanan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("kiri", leftId);
    url.searchParams.set("kanan", rightId);
    window.history.replaceState(null, "", url);
  }, [leftId, rightId]);

  const left = records.find((r) => r.id === leftId) ?? records[0];
  const right = records.find((r) => r.id === rightId) ?? records[1] ?? records[0];

  // Announces which two places are now being compared to screen
  // readers when either picker (or the preset button) changes — not on
  // first mount, where it'd duplicate the visible panel content.
  const isFirstSelection = useRef(true);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (isFirstSelection.current) {
      isFirstSelection.current = false;
      return;
    }
    if (!left || !right) return;
    setAnnouncement(
      `Membandingkan ${left.name} (${FAMILY_LABEL[left.family as Family]}) dengan ${right.name} (${FAMILY_LABEL[right.family as Family]}).`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftId, rightId]);

  if (!left || !right) {
    return <p className="p-6">Tidak ada data lokasi.</p>;
  }

  const sorted = [...records].sort((a, b) => a.name.localeCompare(b.name, "id"));
  const activePreset = presets.find((p) => p.leftId === leftId && p.rightId === rightId)?.id;

  return (
    <div id="main-content" className="mx-auto flex max-w-[1100px] flex-col gap-8 px-4 pb-8 pt-8 lg:px-6 lg:pt-12">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">Bandingkan</p>
        <h1 className="text-2xl font-extrabold leading-[1.05] tracking-tight lg:text-3xl">Dua kota, satu sumbu bulan.</h1>
        <p className="max-w-[60ch] font-story text-lg italic leading-snug">{BANDING_LEAD}</p>
      </header>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {presets.length > 0 && (
        <section aria-label="Perbandingan siap pakai" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {presets.map((preset) => {
            const on = preset.id === activePreset;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setLeftId(preset.leftId);
                  setRightId(preset.rightId);
                }}
                className={`flex flex-col gap-1 rounded-card border p-4 text-left transition-colors duration-fast ${
                  on ? "border-ink bg-ink text-stock" : "border-rule bg-stock text-ink hover:border-ink"
                }`}
              >
                <span className="text-sm font-extrabold tracking-tight">{preset.title}</span>
                <span className={`text-xs ${on ? "text-stock/80" : "text-ink-muted"}`}>{preset.description}</span>
              </button>
            );
          })}
        </section>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <LocationPicker id="banding-kiri" records={sorted} value={leftId} onChange={setLeftId} label="Kota pertama" />
        <button
          type="button"
          onClick={() => {
            setLeftId(rightId);
            setRightId(leftId);
          }}
          aria-label="Tukar kedua kota"
          className="grid h-11 w-11 flex-none place-items-center rounded-full border border-stitch text-ink hover:border-ink"
        >
          <svg aria-hidden viewBox="0 0 16 16" width="16" height="16" className="fill-none stroke-current" strokeWidth="1.6">
            <path d="M4 5h9m0 0-2.5-2.5M13 5l-2.5 2.5M12 11H3m0 0 2.5-2.5M3 11l2.5 2.5" />
          </svg>
        </button>
        <LocationPicker id="banding-kanan" records={sorted} value={rightId} onChange={setRightId} label="Kota kedua" />
      </div>

      <section className="flex flex-col gap-4 rounded-sheet bg-plate p-4 sm:p-6">
        <p className="font-story text-lg italic leading-snug">
          {left.family !== right.family ? (
            <>
              Puncak {left.name} dan {right.name} terpisah{" "}
              <span className="font-sans font-bold not-italic tabular-nums">{formatDecimal(circularMonthDistance(left.peakMonth, right.peakMonth))} bulan</span>.{" "}
            </>
          ) : (
            <>Keduanya {FAMILY_LABEL[left.family as Family]}: pola yang sama, jadi tidak ada penanda jarak puncak. </>
          )}
          {left.name} {formatMm(left.annualTotalMm)} mm setahun, {right.name} {formatMm(right.annualTotalMm)} mm.
        </p>
        <div className="mx-auto w-full max-w-[760px] rounded-card bg-stock p-3 sm:p-4">
          <StackedCompare left={left} right={right} />
        </div>
        <p className="text-xs text-ink-muted">
          Sumbu bulan tidak pernah digeser untuk menyamakan puncak. Skala mm tiap panel berdiri sendiri: yang dibandingkan bentuk dan waktu,
          bukan jumlah.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {[left, right].map((r) => (
          <div key={r.id} className="flex flex-col gap-1 overflow-x-auto">
            <p className="text-xs font-bold">{r.name}, mm per bulan (normal)</p>
            <CycleTable monthlyMm={r.monthlyMm} caption={`Curah hujan bulanan di ${r.name}, mm`} />
          </div>
        ))}
      </div>
    </div>
  );
}
