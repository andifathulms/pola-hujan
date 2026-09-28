import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import { MovedNotice } from "@/components/shell/MovedNotice";
import { pageMetadata } from "@/lib/metadata";
import { CARA_KERJA_LEAD } from "@/lib/pageCopy";

// /metode merged into /cara-kerja. Kept as a thin page so shared links
// and search results from before the merge still arrive somewhere.
export const metadata: Metadata = {
  ...pageMetadata({ title: "Metode — Pola Hujan", description: CARA_KERJA_LEAD, path: "/metode/", canonicalPath: "/cara-kerja/" }),
  robots: { index: false, follow: true },
};

export default function MetodePage() {
  return (
    <>
      <SiteNav />
      <MovedNotice title="Metode" href="/cara-kerja/#pernyataan" />
    </>
  );
}
