"use client";

import { useRouter } from "next/navigation";
import type { RegimeRecord } from "@/lib/grid/schema";
import { RegimeMap } from "@/components/map/RegimeMap";
import { cityHref } from "@/lib/routes";

/** Where this city sits among the others; any other dot opens that city's page. */
export function CityLocator({ records, selectedId }: { records: RegimeRecord[]; selectedId: string }) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-card border border-rule">
      <RegimeMap
        records={records}
        selectedId={selectedId}
        onSelect={(id) => router.push(cityHref(id))}
        ariaLabel="Peta lokasi: pilih titik lain untuk membuka kota itu"
      />
    </div>
  );
}
