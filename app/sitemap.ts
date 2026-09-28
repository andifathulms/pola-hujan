import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

// /metode/ and /harmonik/ are excluded: they merged into /cara-kerja/
// and are noindex.
const ROUTE_PATHS = ["", "peta/", "banding/", "cara-kerja/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTE_PATHS.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
