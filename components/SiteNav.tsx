import { Fragment } from "react";
import Link from "next/link";

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
  return (
    <nav aria-label="Navigasi utama" className="flex gap-4 border-b border-rule px-4 py-2 text-sm lg:px-6">
      {LINKS.map((link) => {
        const descriptionId = `nav-desc-${link.label.toLowerCase()}`;
        return (
          <Fragment key={link.href}>
            <Link
              href={link.href}
              aria-describedby={descriptionId}
              className="text-ink underline-offset-4 hover:underline"
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
    </nav>
  );
}
