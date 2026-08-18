"use client";

import { useState } from "react";
import type { RegimeRecord } from "@/lib/grid/schema";
import { findNearest, haversineDistanceKm } from "@/lib/geo/nearest";
import { FAMILY_LABEL, MONTH_LABELS_ID, type Family } from "@/lib/family";

export interface YourPlaceProps {
  records: RegimeRecord[];
  onFound: (id: string) => void;
}

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "found"; distanceKm: number };

/**
 * "Your place" (PRD.md §6.6): family, sub-type, peak and driest month,
 * normal cycle — practical without being predictive, no onset date, no
 * advice. Matches the browser's reported coordinate to the nearest
 * location this build has data for; the geolocation permission prompt
 * is a browser API, not a request this app makes over the network, so
 * it doesn't touch CLAUDE.md invariant 14.
 */
export function YourPlace({ records, onFound }: YourPlaceProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [nearest, setNearest] = useState<RegimeRecord | undefined>(undefined);

  function locate() {
    if (!("geolocation" in navigator)) {
      setStatus({ kind: "error", message: "Geolokasi tidak tersedia di peramban ini." });
      return;
    }
    setStatus({ kind: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const target = { lat: position.coords.latitude, lon: position.coords.longitude };
        const match = findNearest(target, records);
        if (!match) {
          setStatus({ kind: "error", message: "Tidak ada lokasi pembanding." });
          return;
        }
        const distanceKm = haversineDistanceKm(target.lat, target.lon, match.lat, match.lon);
        setNearest(match);
        setStatus({ kind: "found", distanceKm });
        onFound(match.id);
      },
      () => setStatus({ kind: "error", message: "Izin lokasi ditolak atau gagal." }),
      { timeout: 10_000 },
    );
  }

  return (
    <div className="flex flex-col gap-2 border border-rule bg-stock p-3 text-sm">
      <button
        type="button"
        onClick={locate}
        className="self-start rounded border border-ink px-2 py-1 font-medium transition-colors duration-fast hover:bg-ink hover:text-stock"
      >
        Gunakan lokasi saya
      </button>
      {status.kind === "loading" && <p className="text-ink/70">Mencari lokasi terdekat…</p>}
      {status.kind === "error" && <p className="text-ink/70">{status.message}</p>}
      {status.kind === "found" && nearest && (
        <p className="text-ink/70">
          Lokasi pembanding terdekat: <strong>{nearest.name}</strong> (~{Math.round(status.distanceKm)} km) —{" "}
          {FAMILY_LABEL[nearest.family as Family]}, puncak {MONTH_LABELS_ID[Math.round(nearest.peakMonth) % 12]}.
          Ini adalah pembanding terdekat dari data yang tersedia, bukan hasil interpolasi tepat di titikmu.
        </p>
      )}
    </div>
  );
}
