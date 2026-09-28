import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

// "/peta/" is deliberately excluded while it renders byte-identical
// content to "/" (see app/peta/page.tsx). /metode/ and /harmonik/ are
// excluded because they merged into /cara-kerja/ and are noindex.
const ROUTE_PATHS = ["", "banding/", "cara-kerja/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTE_PATHS.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
