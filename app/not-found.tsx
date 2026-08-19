import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

// Next's static export writes this to out/404.html, which GitHub Pages
// serves automatically for any unresolved path under the repo — no
// extra routing config needed. Without this file, Next falls back to
// its generic unstyled "This page could not be found," which is what a
// broken/old shared link (e.g. an outdated ?lokasi= or ?kiri=&kanan=
// value) would otherwise show.
export const metadata: Metadata = {
  title: "Halaman tidak ditemukan — Pola Hujan",
};

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <div id="main-content" className="flex flex-col gap-4 p-4 lg:p-6">
        <p className="font-mono text-sm text-ink/70">404</p>
        <h1 className="font-display text-2xl font-semibold lg:text-3xl">Halaman tidak ditemukan</h1>
        <p className="max-w-prose text-lg">
          Alamat ini tidak ada di Pola Hujan. Mungkin tautannya sudah usang, atau ada salah ketik.
        </p>
        <p className="text-sm text-ink/70">
          <Link href="/" className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
            Kembali ke peta rezim
          </Link>
          , atau pilih halaman lain dari navigasi di atas.
        </p>
      </div>
    </>
  );
}
