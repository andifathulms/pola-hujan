import Link from "next/link";
import { regimeRecords } from "@/lib/grid/lookup";
import { toCityIndex } from "@/lib/citySearch";
import { ROUTES } from "@/lib/routes";
import { LogoMark } from "@/components/shell/Logo";
import { NavLinks } from "@/components/shell/NavLinks";
import { CitySearch } from "@/components/shell/CitySearch";

/**
 * The top bar: mark, four destinations, and the global city search.
 * A server component on purpose — it trims the full records down to a
 * name/province/family index here, so only that crosses into the
 * client bundle, not 34 monthly curves on every page.
 */
export function SiteNav() {
  const index = toCityIndex(regimeRecords);
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-stock/90 backdrop-blur supports-[backdrop-filter]:bg-stock/80">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 lg:px-6">
        <Link href={ROUTES.home} className="flex flex-none items-center gap-2.5 text-sm font-extrabold tracking-tight text-ink no-underline">
          <LogoMark />
          Pola Hujan
        </Link>
        <NavLinks idPrefix="nav-desc" className="hidden md:flex" />
        <CitySearch index={index} className="ml-auto w-full max-w-[300px]" />
      </nav>
      <NavLinks idPrefix="nav-desc-m" className="overflow-x-auto px-3 pb-2 md:hidden" />
    </header>
  );
}
