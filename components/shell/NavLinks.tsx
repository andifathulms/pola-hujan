"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const LINKS = [
  { href: ROUTES.home, label: "Beranda", description: "Cerita singkat: tiga pola hujan Indonesia" },
  { href: ROUTES.atlas, label: "Peta", description: "Peta rezim hujan dan kurva bulanan tiap kota" },
  { href: ROUTES.compare, label: "Bandingkan", description: "Bandingkan kurva hujan dua kota pada satu sumbu bulan" },
  { href: ROUTES.method, label: "Cara kerja", description: "Dekomposisi harmonik, ambang, data, dan kecocokan dengan BMKG" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === ROUTES.home) return pathname === "/";
  // A city page belongs to the atlas; the old method URLs belong to Cara kerja.
  if (href === ROUTES.atlas) return pathname.startsWith("/peta") || pathname.startsWith("/kota");
  if (href === ROUTES.method) return ["/cara-kerja", "/metode", "/harmonik"].some((p) => pathname.startsWith(p));
  return pathname.startsWith(href.replace(/\/$/, ""));
}

/**
 * The per-link description is exposed through aria-describedby on
 * visually hidden text — `title` is mouse-hover-only in most browsers
 * and never reaches keyboard or screen-reader users reliably.
 */
export function NavLinks({ idPrefix, className = "" }: { idPrefix: string; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={`flex gap-1 ${className}`}>
      {LINKS.map((link) => {
        const descriptionId = `${idPrefix}-${link.label.toLowerCase().replace(/\s+/g, "-")}`;
        const current = isCurrent(pathname, link.href);
        return (
          <Fragment key={link.href}>
            <Link
              href={link.href}
              aria-describedby={descriptionId}
              aria-current={current ? "page" : undefined}
              className={`flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold no-underline transition-colors duration-fast ${
                current ? "bg-plate text-ink" : "text-ink-muted hover:bg-plate/70 hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
            <span id={descriptionId} className="sr-only">
              {link.description}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
