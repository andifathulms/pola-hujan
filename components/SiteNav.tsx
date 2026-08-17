import Link from "next/link";

const LINKS = [
  { href: "/peta/", label: "Peta" },
  { href: "/banding/", label: "Banding" },
  { href: "/metode/", label: "Metode" },
  { href: "/harmonik/", label: "Harmonik" },
];

export function SiteNav() {
  return (
    <nav aria-label="Navigasi utama" className="flex gap-4 border-b border-rule px-4 py-2 text-sm lg:px-6">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="text-ink underline-offset-4 hover:underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
