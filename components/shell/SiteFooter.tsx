import Link from "next/link";
import { manifest } from "@/lib/grid/lookup";
import { ROUTES } from "@/lib/routes";
import { LogoMark } from "@/components/shell/Logo";
import { MakerSignature } from "@/components/MakerSignature";

/**
 * Every page ends on the framing statement (CLAUDE.md "Framing"): derived,
 * not BMKG's Zona Musim; normals, not a forecast; BMKG is the authority
 * for onset predictions. The map's own caption still carries it too —
 * this is in addition to that, never instead of it (invariant 6).
 */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule bg-plate">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr] lg:px-6">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2.5 text-sm font-extrabold tracking-tight">
            <LogoMark size={24} />
            Pola Hujan
          </p>
          <p className="max-w-[60ch] text-xs text-ink-muted">
            <strong className="font-semibold text-ink">Klasifikasi turunan dari data presipitasi grid terbuka, bukan Zona Musim resmi BMKG.</strong>{" "}
            Semua angka adalah normal jangka panjang, bukan prakiraan. Untuk prakiraan awal musim, rujuk{" "}
            <a href="https://www.bmkg.go.id/iklim/" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
              BMKG
            </a>
            . Istilah Monsunal, Ekuatorial dan Lokal mengikuti kerangka BMKG.
          </p>
          <p className="font-mono text-xs text-ink-muted">
            CHIRPS 2.0 · {manifest.climatologyPeriod.split(" (")[0]} · {manifest.generatedFromLocations} lokasi
          </p>
        </div>
        <nav aria-label="Navigasi kaki" className="flex flex-wrap content-start gap-x-6 gap-y-2 text-xs lg:justify-end">
          <Link href={ROUTES.home} className="text-ink-muted hover:text-ink">Beranda</Link>
          <Link href={ROUTES.atlas} className="text-ink-muted hover:text-ink">Peta</Link>
          <Link href={ROUTES.compare} className="text-ink-muted hover:text-ink">Bandingkan</Link>
          <Link href={ROUTES.method} className="text-ink-muted hover:text-ink">Cara kerja</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-[1440px] border-t border-rule px-4 py-3 lg:px-6">
        <MakerSignature />
      </div>
    </footer>
  );
}
