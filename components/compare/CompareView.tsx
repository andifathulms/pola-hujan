"use client";

import { useEffect, useRef, useState } from "react";
import type { RegimeRecord } from "@/lib/grid/schema";
import { FAMILY_LABEL, FAMILY_TEXT_CLASS, MONTH_LABELS_ID, type Family } from "@/lib/family";
import { circularMonthDistance } from "@/lib/harmonic";
import { CycleTable } from "@/components/table/CycleTable";
import { StackedCompare } from "@/components/compare/StackedCompare";
import { BANDING_LEAD } from "@/lib/pageCopy";

export interface CompareViewProps {
  records: RegimeRecord[];
  defaultLeftId: string;
  defaultRightId: string;
}

function LocationPicker({
  records,
  value,
  onChange,
  label,
}: {
  records: RegimeRecord[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-rule bg-stock px-2 py-1 text-sm"
      >
        {records.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
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
export function CompareView({ records, defaultLeftId, defaultRightId }: CompareViewProps) {
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

  return (
    <div id="main-content" className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-xl font-extrabold tracking-tight lg:text-2xl">Banding dua tempat</h1>
        <p className="max-w-prose text-lg">{BANDING_LEAD}</p>
        <p className="text-sm text-ink-muted">
          Sumbu bulan tidak pernah digeser untuk menyelaraskan puncak — perbedaan letak puncak adalah temuannya.
        </p>
      </header>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <LocationPicker records={records} value={leftId} onChange={setLeftId} label="Tempat pertama" />
        <LocationPicker records={records} value={rightId} onChange={setRightId} label="Tempat kedua" />
        <button
          type="button"
          onClick={() => {
            setLeftId(defaultLeftId);
            setRightId(defaultRightId);
          }}
          className="rounded border border-ink px-3 py-1 text-sm font-medium transition-colors duration-fast hover:bg-ink hover:text-stock"
        >
          Jawa vs Maluku
        </button>
      </div>

      {left.family !== right.family && (
        <p className="text-sm text-ink-muted">
          Puncak {left.name} dan puncak {right.name} terpisah{" "}
          <span className="font-mono tabular-nums">
            {circularMonthDistance(left.peakMonth, right.peakMonth).toFixed(1)}
          </span>{" "}
          bulan.
        </p>
      )}

      <div className="flex flex-col gap-8">
        <StackedCompare left={left} right={right} />
        <div className="grid gap-6 sm:grid-cols-2">
          <CycleTable monthlyMm={left.monthlyMm} caption={`Curah hujan bulanan di ${left.name}, mm`} />
          <CycleTable monthlyMm={right.monthlyMm} caption={`Curah hujan bulanan di ${right.name}, mm`} />
        </div>
      </div>
    </div>
  );
}
