"use client";

import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logoIcon from "@/public/logo/pola-hujan-icon.svg";

const LINKS = [
  { href: "/peta/", label: "Peta", description: "Peta rezim hujan dan kurva bulanan tiap kota" },
  { href: "/banding/", label: "Banding", description: "Bandingkan kurva hujan dua kota berdampingan" },
  { href: "/metode/", label: "Metode", description: "Dataset, ambang batas, dan tingkat kecocokan dengan BMKG" },
  { href: "/harmonik/", label: "Harmonik", description: "Lihat cara dekomposisi harmonik menghasilkan klasifikasi" },
];

/**
 * The per-link description used to live in a `title` attribute — but
 * `title` is mouse-hover-only in most browsers (unreachable by keyboard
 * focus) and inconsistently exposed to screen readers, so it wasn't
 * reliably reaching anyone. `aria-describedby` pointing at visually
 * hidden text reaches both without changing the visible label.
 */
export function SiteNav() {
  // usePathname() already excludes next.config.js's basePath. "/" renders
  // the same AtlasView as "/peta/" (see app/page.tsx) — treated as the
  // same destination here so "Peta" reads as current on either URL.
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule px-4 py-2 text-sm lg:px-6"
    >
      <Link href="/" className="flex items-center gap-2 font-display font-semibold text-ink no-underline">
        <Image src={logoIcon} alt="" width={24} height={24} className="rounded" priority />
        Pola Hujan
      </Link>
      <div className="flex flex-wrap gap-4">
        {LINKS.map((link) => {
          const descriptionId = `nav-desc-${link.label.toLowerCase()}`;
          const isCurrent = pathname === link.href || (link.href === "/peta/" && pathname === "/");
          return (
            <Fragment key={link.href}>
              <Link
                href={link.href}
                aria-describedby={descriptionId}
                aria-current={isCurrent ? "page" : undefined}
                className={`underline-offset-4 hover:underline ${isCurrent ? "font-medium text-ink underline" : "text-ink/70"}`}
              >
                {link.label}
              </Link>
              {/* Outside the link, not inside it — aria-describedby reads
                  this by id regardless of position, but nesting it inside
                  the <a> would fold it into the link's accessible NAME too,
                  doubling the announcement. */}
              <span id={descriptionId} className="sr-only">
                {link.description}
              </span>
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
