"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * A static export has no server redirects, so an old URL renders this:
 * a real link first (for crawlers, no-JS readers and screenshot tools),
 * then a client-side replace so everyone else lands on the new section
 * without an extra click. `replace` keeps the old URL out of history.
 */
export function MovedNotice({ title, href }: { title: string; href: string }) {
  useEffect(() => {
    const base = document.querySelector<HTMLAnchorElement>("[data-moved-link]");
    if (base) window.location.replace(base.href);
  }, []);
  return (
    <div id="main-content" className="mx-auto flex max-w-[640px] flex-col gap-3 px-4 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">Halaman dipindah</p>
      <h1 className="text-xl font-extrabold tracking-tight">{title} sekarang bagian dari Cara kerja.</h1>
      <p className="text-sm text-ink-muted">
        <Link href={href} data-moved-link className="font-semibold text-ink underline underline-offset-4">
          Buka {title} di halaman Cara kerja →
        </Link>
      </p>
    </div>
  );
}
