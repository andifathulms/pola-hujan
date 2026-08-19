import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

// "/peta/" is deliberately excluded — it renders byte-identical content
// to "/" and its canonical points there (see app/peta/page.tsx), so
// listing both here would send a mixed signal about which one to index.
const ROUTE_PATHS = ["", "banding/", "metode/", "harmonik/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTE_PATHS.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
