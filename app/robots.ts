import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

// GitHub Pages project sites (as opposed to a user/org root site) can't
// serve this at the true origin root (a crawler only checks
// https://andifathulms.github.io/robots.txt, not the /pola-hujan/
// subpath) — publishing here is a no-cost, no-risk courtesy for the
// tools that do read it at the subpath, not a claim that it's the
// authoritative robots.txt for the domain. Absence would mean the same
// thing in practice: default-allow.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("sitemap.xml", SITE_URL).toString(),
  };
}
