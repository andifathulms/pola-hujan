"use client";

import { useRouter } from "next/navigation";
import type { Mosaic, RegimeRecord } from "@/lib/grid/schema";
import { RegimeMap } from "@/components/map/RegimeMap";
import { cityHref } from "@/lib/routes";

/** Where this city sits among the others; any other dot opens that city's page. */
export function CityLocator({ records, selectedId, mosaic }: { records: RegimeRecord[]; selectedId: string; mosaic?: Mosaic }) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-card border border-rule">
      <RegimeMap
        records={records}
        selectedId={selectedId}
        onSelect={(id) => router.push(cityHref(id))}
        mosaic={mosaic}
        ariaLabel="Peta lokasi: pilih titik lain untuk membuka kota itu"
      />
    </div>
  );
}
