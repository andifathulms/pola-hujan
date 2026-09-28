import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { regimeRecords } from "@/lib/grid/lookup";

// /metode/ and /harmonik/ are excluded: they merged into /cara-kerja/
// and are noindex.
const ROUTE_PATHS = ["", "peta/", "banding/", "cara-kerja/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ROUTE_PATHS.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  // One page per city — the pages a search for "pola hujan <kota>" should land on.
  const cities = regimeRecords.map((r) => ({
    url: new URL(`kota/${r.id}/`, SITE_URL).toString(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...cities];
}
