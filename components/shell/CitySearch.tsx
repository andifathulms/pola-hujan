"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchCities, type CityIndexEntry } from "@/lib/citySearch";
import { FAMILY_BG_CLASS, FAMILY_LABEL } from "@/lib/family";
import { cityHref } from "@/lib/routes";

/** Shown when the box is focused but empty — the three cities the story is told through. */
const SUGGESTED_IDS = ["jakarta", "ambon", "padang"];

/**
 * "Cari kota atau provinsi" — a WAI-ARIA combobox. ⌘K / Ctrl+K or "/"
 * focuses it from anywhere; arrows move, Enter opens, Escape closes.
 * Matching is lib/citySearch.ts; this only renders it.
 */
export function CitySearch({
  index,
  className = "",
  shortcut = true,
  size = "sm",
}: {
  index: CityIndexEntry[];
  className?: string;
  /** Only the header instance owns ⌘K and "/"; an inline copy on a page must not steal them. */
  shortcut?: boolean;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    if (query.trim() === "") return index.filter((c) => SUGGESTED_IDS.includes(c.id));
    return searchCities(index, query);
  }, [index, query]);

  useEffect(() => {
    if (!shortcut) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  function go(entry: CityIndexEntry | undefined) {
    if (!entry) return;
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(cityHref(entry.id));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showList = open && results.length > 0;
  const noMatch = open && query.trim() !== "" && results.length === 0;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={`${listId}-input`} className="sr-only">
        Cari kota atau provinsi
      </label>
      <div
        className={`flex items-center gap-2 rounded-full border bg-stock transition-colors duration-fast focus-within:border-ink ${
          size === "lg" ? "border-stitch py-3 pl-5 pr-3" : "border-rule py-1.5 pl-3.5 pr-1.5"
        }`}
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" className="flex-none stroke-ink-muted" fill="none" strokeWidth="1.8">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 4 4" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="Cari kota atau provinsi"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-muted focus:outline-none ${size === "lg" ? "text-base" : "text-xs"}`}
        />
        {shortcut && <kbd className="hidden flex-none rounded border border-rule px-1.5 py-0.5 font-mono text-tick text-ink-muted sm:inline">⌘K</kbd>}
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Hasil pencarian kota"
        hidden={!showList}
        className="absolute right-0 top-full z-40 mt-2 w-full min-w-[260px] overflow-hidden rounded-card border border-rule bg-stock py-1 shadow-[0_18px_40px_-20px_rgba(20,23,31,0.45)]"
      >
        {query.trim() === "" && <li className="px-3.5 pb-1 pt-2 font-mono text-tick uppercase tracking-[0.12em] text-ink-muted">Coba</li>}
        {results.map((entry, i) => (
          <li
            key={entry.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => {
              e.preventDefault();
              go(entry);
            }}
            onMouseEnter={() => setActive(i)}
            className={`flex cursor-pointer items-center gap-3 px-3.5 py-2 ${i === active ? "bg-plate" : ""}`}
          >
            <span className={`h-2.5 w-2.5 flex-none rounded-full ${FAMILY_BG_CLASS[entry.family]}`} aria-hidden="true" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-ink">{entry.name}</span>
              <span className="truncate text-xs text-ink-muted">
                {entry.province} · {FAMILY_LABEL[entry.family]}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {noMatch && (
        <p role="status" className="absolute right-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-card border border-rule bg-stock px-3.5 py-3 text-xs text-ink-muted">
          Tidak ada kota yang cocok dengan &ldquo;{query.trim()}&rdquo;.
        </p>
      )}
    </div>
  );
}
