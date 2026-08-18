import Link from "next/link";

const LINKS = [
  { href: "/peta/", label: "Peta", title: "Peta rezim hujan dan kurva bulanan tiap kota" },
  { href: "/banding/", label: "Banding", title: "Bandingkan kurva hujan dua kota berdampingan" },
  { href: "/metode/", label: "Metode", title: "Dataset, ambang batas, dan tingkat kecocokan dengan BMKG" },
  { href: "/harmonik/", label: "Harmonik", title: "Lihat cara dekomposisi harmonik menghasilkan klasifikasi" },
];

export function SiteNav() {
  return (
    <nav aria-label="Navigasi utama" className="flex gap-4 border-b border-rule px-4 py-2 text-sm lg:px-6">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} title={link.title} className="text-ink underline-offset-4 hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
