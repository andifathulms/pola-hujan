# Design Audit — Pola Hujan

Factual as-built audit. Describes what is in the codebase today, not recommendations.

## 1. What this app is

Pola Hujan ("Rain Pattern") is a static, offline, Indonesian-first atlas that classifies the annual rainfall cycle at 34 Indonesian locations into three regime families — **monsunal** (one wet peak, during the Asian monsoon), **ekuatorial** (two wet peaks per year), and **lokal** (one wet peak, roughly six months out of phase with the monsoon) — via harmonic decomposition (annual + semi-annual least-squares sine fit) of monthly precipitation climatology (CHIRPS 2.0, 2006–2015, per-city sample; `data/source/README.md`). It exists to show that "musim hujan" does not mean the same months everywhere in Indonesia, and where the derived classification disagrees with BMKG's published Zona Musim, that disagreement is reported as a finding.

The core object the app manipulates is **the cycle curve** — twelve monthly rainfall bars for a selected location with its two fitted harmonics drawn as overlaid lines — rendered by `components/curve/CycleCurve.tsx`, paired with **the regime map** — a plain inline-SVG point map (no tile/mapping dependency) plotting each location as a coloured dot by family — rendered by `components/map/RegimeMap.tsx`. Both are composed together by `components/AtlasView.tsx`, which is the actual content of the home page (`app/page.tsx` and `app/peta/page.tsx` render byte-identical output).

## 2. Stack & constraints

- **Framework**: Next.js 14.2.5, App Router, `output: "export"` (`next.config.js`) — fully static, no server runtime. `basePath: "/pola-hujan"` in production, `trailingSlash: true`. Deployed via GitHub Actions to `https://andifathulms.github.io/pola-hujan/`.
- **Language**: TypeScript strict; React 18.3.1.
- **Validation**: Zod, `lib/grid/schema.ts` (`LocationSource`, `RegimeRecord`, `ArchetypeRecord`, `Manifest`).
- **Testing**: Vitest, `tests/`.
- **Package manager**: pnpm 9.15.9.
- **No CSS-in-JS, no component library** — plain Tailwind classes throughout.

**Vis/animation libraries actually imported**: none. Grep across `app/`, `components/`, `lib/` finds zero imports of any charting library (no d3, recharts, chart.js, visx), zero mapping library (no leaflet, mapbox, react-simple-maps), zero animation library (no framer-motion, GSAP). All charts (`RegimeMap.tsx`, `CycleCurve.tsx`, `ArchetypeStrip.tsx`, `HarmonicExplainer.tsx`) are hand-authored inline `<svg>`; all motion is CSS `transition` / inline `transitionProperty`/`transitionDelay`. This matches the stack rule in `CLAUDE.md`.

- **Fonts**: self-hosted via `next/font/google` in `app/layout.tsx` — Alegreya (weight 600), Alegreya Sans (400, 700), IBM Plex Mono (400, 500). No runtime request to Google Fonts.

**Stated/observed constraints**:
- Zero network requests after first load, per `CLAUDE.md`; the one browser API used is `navigator.geolocation` in `YourPlace.tsx`, invoked only on user click.
- No backend, no accounts.
- Locale routing is not implemented: `CLAUDE.md`'s intended `app/[locale]/` (`id`/`en`) layout does not exist yet — current routes are flat (`app/peta`, `app/banding`, `app/metode`, `app/harmonik`), Indonesian only, `<html lang="id">` in `app/layout.tsx`.
- Mobile/responsive handling is Tailwind breakpoint classes (`lg:` prefix) only.
- `.nojekyll` required in `out/` for GitHub Pages; `pnpm preview` symlinks `out` under `.preview/pola-hujan` to reproduce `basePath` locally.

### Theme/token config verbatim

`tailwind.config.ts`:
```ts
colors: {
  stock: "#F2F0E7",
  ink: "#23211C",
  rule: "#D6D2C4",
  monsunal: "#3A6B8A",
  ekuatorial: "#4A7C59",
  lokal: "#B5652E",
  you: "#8B3A62",
  "ekuatorial-text": "#437050",
  "lokal-text": "#99552A",
},
fontFamily: {
  display: ["var(--font-alegreya)", "serif"],
  sans: ["var(--font-alegreya-sans)", "sans-serif"],
  mono: ["var(--font-plex-mono)", "monospace"],
},
fontSize: { xs: "14px", sm: "16px", base: "18px", lg: "22px", xl: "28px", "2xl": "36px", "3xl": "46px" },
spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 6: "24px", 8: "32px", 12: "48px", 16: "64px", 24: "96px", 32: "128px" },
borderRadius: { DEFAULT: "2px" },
transitionDuration: { fast: "120ms", state: "240ms", curve: "600ms" },
transitionTimingFunction: { DEFAULT: "cubic-bezier(0.2, 0, 0, 1)" },
```

`app/globals.css` mirrors these values as CSS custom properties (`--color-stock`, `--color-ink`, `--color-ink-muted: #615f59`, `--color-rule`, `--color-monsunal`, `--color-ekuatorial`, `--color-lokal`, `--color-you`, `--color-ekuatorial-text`, `--color-lokal-text`, plus `--text-xs…--text-3xl`, `--space-1…--space-32`). A code comment states the two files are "kept in sync by hand" because Tailwind cannot read CSS custom properties at build time.

## 3. Visual system as-built

**Colour literals**: exactly one raw hex value appears anywhere in `app/`/`components/`/`lib/` outside the two token files — inside a code *comment* in `components/MakerSignature.tsx:6` (`` `you` (#8B3A62) ``), not a rendered value. No `rgb()`/`hsl()` literals exist. All rendered colour goes through Tailwind tokens defined in §2. Token-class occurrence counts (grep across `app/`+`components/`):

| token class | count |
|---|---|
| `text-ink/70` | 40 |
| `border-rule` | 16 |
| `text-ink` | 7 |
| `stroke-ink` | 6 |
| `border-ink` | 6 |
| `bg-stock` | 6 |
| `bg-ink` | 4 |
| `text-stock` | 3 |
| `stroke-rule` | 3 |
| `fill-ink` | 3 |
| `text-you` | 2 |
| `stroke-ink/50` | 2 |
| `border-ink/50` | 2 |
| `text-ink/50` | 1 |
| `fill-stock` | 1 |
| `fill-ink/10` | 1 |
| `border-ink/30` | 1 |
| `bg-rule/60` | 1 |

Family-hue classes (`fill-monsunal`, `text-ekuatorial-text`, etc.) are produced through lookup maps in `lib/family.ts` (`FAMILY_BG_CLASS`, `FAMILY_FILL_CLASS`, `FAMILY_STROKE_CLASS`, `FAMILY_TEXT_CLASS`) rather than appearing as literal class strings at each call site; a code comment there explains this exists because Tailwind's content scanner matches on literal substrings, not runtime-constructed class names.

**Fonts**: `font-display` (Alegreya) — 15 uses; `font-mono` (IBM Plex Mono) — 23 uses; `font-sans` (Alegreya Sans) — 2 explicit uses plus the body default set once on `<body>` in `app/layout.tsx`. Only display weight 600 and body weights 400/700 are downloaded. Weight utilities in use: `font-medium` (16), `font-semibold` (16), `font-normal` (1).

**Font sizes** (all resolve through the custom scale in §2, not Tailwind's defaults): `text-xs` — 19, `text-sm` — 33, `text-base` — 4, `text-lg` — 15, `text-xl` — 4, `text-2xl` — 6, `text-3xl` — 3. Two additional uses of an arbitrary `text-[10px]` appear (`CycleCurve.tsx`, `HarmonicExplainer.tsx`), scoped to SVG axis-tick/month-label microtext.

**Spacing** (all resolve through the custom scale — no off-scale arbitrary spacing values found): `gap-2` (19), `gap-1` (16), `py-1` (11), `p-6` (7), `p-4` (7), `pr-4` (6), `gap-4` (6), `py-2` (5), `gap-6` (5), `px-2` (4), `mt-1` (4), `px-6` (2), `px-4` (2), `px-1` (2), `pt-4` (2), `pt-3` (2), `pl-5` (2), `p-3` (2), `p-1` (2), `gap-8` (2), `gap-3` (2), `py-4` (1), `px-3` (1), `pt-2` (1).

**Border-radius**: `rounded` — 7 uses, resolves to the single custom token `borderRadius.DEFAULT: 2px`. `rounded-full` — 2 uses, on `Legend.tsx`'s dot swatches (Tailwind's built-in `9999px`, not from the custom token). No other radius classes.

**Box-shadow**: none found anywhere in the codebase (grep for "shadow" returns zero hits) — no elevation styling of any kind.

**Centralization**: Tokens live in two files kept in sync by hand — `tailwind.config.ts` (Tailwind-consumable) and `app/globals.css`'s `:root` block (CSS custom properties, used for contexts Tailwind can't reach, e.g. inline-SVG hatch patterns). `lib/family.ts` is a second centralization layer mapping the `Family` discriminated union to Tailwind class-name strings. No scattered ad hoc raw colour/spacing values were found in any component file.

**Dark mode**: absent. `app/globals.css:18` hardcodes `color-scheme: light`. Grep confirms zero `dark:` variant usage and zero `prefers-color-scheme` queries anywhere in the codebase. No theme-toggle component exists.

## 4. Screen & component inventory

### Routes

- **`app/page.tsx`** (`/`) — atlas home; renders `SiteNav` → `AtlasView`. Deliberately duplicates `/peta/`'s output rather than redirecting, to avoid a JS-dependent redirect for crawlers/no-JS clients.
- **`app/peta/page.tsx`** (`/peta/`) — same render as `/`: `SiteNav` → `AtlasView`.
- **`app/banding/page.tsx`** (`/banding/`) — two-place comparison, Jakarta/Ambon default. Renders `SiteNav` → `CompareView`.
- **`app/metode/page.tsx`** (`/metode/`) — dataset/thresholds/agreement/limitations. Renders `SiteNav` → header → "Yang harus dinyatakan" list → "Dataset" `<dl>` + `DownloadData` button → "Cakupan" (family/sub-type counts as plain `<ul>` lists) → "Ambang klasifikasi" `<table>` → "Kecocokan dengan BMKG" prose → "Yang tidak dilakukan aplikasi ini" list → footer citation line.
- **`app/harmonik/page.tsx`** (`/harmonik/`) — live harmonic decomposition explainer. Renders `SiteNav` → header/prose → `HarmonicExplainer`.
- **`app/not-found.tsx`** — custom static 404 (`out/404.html`). Renders `SiteNav` → "404" mono label → heading → prose → link home.

Within `AtlasView` (shared by `/` and `/peta/`), top-to-bottom: header (`h1` "Pola Hujan" + lead + sub-line) → `NearestOppositeFinding` → `Legend` → `YourPlace` → helper line → sr-only live region → grid of `RegimeMap` (`lg:col-span-2`, `h-[45vh]` on mobile) + right column (selected location's name/province/family-subtype/peak-driest-month text, optional BMKG comparison line, `classificationReason()` text, `<details>` numeric disclosure, link to `/harmonik/?dari=`, `CycleCurve`, `CycleTable`, `ArchetypeStrip`) → bottom nav of all-location buttons.

### Reusable components (`components/`)

- **`AtlasView.tsx`** — orchestrates the atlas page layout described above.
- **`SiteNav.tsx`** — horizontal top bar: SVG logo icon + wordmark left, four nav links (Peta/Banding/Metode/Harmonik) right, bottom hairline, current page underlined + bold.
- **`Legend.tsx`** — bordered box: heading, derived-not-official disclaimer paragraph, dataset/period mono line, three family dot-swatches with one-line descriptions, a diagonal-hatch swatch row for "disagreement," an agreement-rate mono line, bottom hairline-separated dataset-status caption.
- **`YourPlace.tsx`** — bordered box: one "Gunakan lokasi saya" button, below it a `role="status"` region showing loading/error/found text.
- **`NearestOppositeFinding.tsx`** — one bordered paragraph with two inline underlined name-buttons and a distance figure ("titik terdekat: X km").
- **`DownloadData.tsx`** — one bordered/outlined button ("Unduh data lokasi (CSV)") that builds and downloads a client-side Blob CSV.
- **`MakerSignature.tsx`** — site footer: credit line + four icon-only social links (custom inline SVG icons).
- **`map/RegimeMap.tsx`** — SVG (viewBox 640×320): faint Indonesia coastline silhouette (`fill-ink/10`, static path from `lib/geo/indonesiaOutline.ts`), one circle per location coloured by family (r=7, r=9 if selected, ink stroke if selected), diagonal-hatch overlay for BMKG-disagreement points, invisible r=13 hit target per point for keyboard/click.
- **`curve/CycleCurve.tsx`** — SVG bar+line chart (480×240): 12 monthly-rainfall bars (family-hue fill), ink solid line for the annual harmonic, semi-transparent ink dashed line for the semi-annual harmonic, mono axis ticks/month labels, figcaption legend.
- **`table/CycleTable.tsx`** — plain 12-column HTML `<table>` (mono, tabular-nums) of month labels over rounded mm values; sr-only caption.
- **`archetypes/ArchetypeStrip.tsx`** — horizontally-scrollable row of three cards (min-w-140px), each with a family-coloured label, a small sparkline SVG (140×40), and a "contoh sintetis" mono caption; the active/matching family gets a thin border.
- **`compare/CompareView.tsx`** — header + two `<select>` location pickers + a "Jawa vs Maluku" reset button, then a two-column grid of `CompareSide` blocks (name/family-subtype heading, `CycleCurve`, `CycleTable`).
- **`harmonic/HarmonicExplainer.tsx`** — two-column layout: left, four range-slider controls (`aria-valuetext`) plus a resulting classification readout; right, an SVG bar+harmonic-line chart of the synthetic cycle, recomputed on every slider change (the one component that classifies client-side rather than reading pipeline output).

### Core-object viewport share

`RegimeMap` is the largest single visual object. On desktop it occupies `lg:col-span-2` of a 3-column grid (roughly two-thirds of content width) at its natural SVG-aspect-ratio height. On mobile it is fixed at `h-[45vh]` (`AtlasView.tsx`), full width. `CycleCurve` occupies the remaining third on desktop (`lg:col-span-1`), stacking below the map on mobile at natural height (no fixed vh).

## 5. Interaction & state

**Interactive elements**:
- `onClick` — 7 occurrences: map dot hit-circles (`RegimeMap.tsx`), location-list buttons (`AtlasView.tsx`), nearest-opposite-pair name buttons (`NearestOppositeFinding.tsx`), "Gunakan lokasi saya" (`YourPlace.tsx`), CSV download button (`DownloadData.tsx`), "Jawa vs Maluku" preset button (`CompareView.tsx`).
- `onChange` — 12 occurrences: two `<select>` pickers (`CompareView.tsx`), four range-slider inputs (`HarmonicExplainer.tsx`).
- `onKeyDown` — 1 occurrence, `components/map/RegimeMap.tsx:103`: handles Enter/Space on the SVG map's hit-circle, a custom `role="button"` element.
- `tabIndex={0}` — 1 occurrence, same map hit-circle (`RegimeMap.tsx:98`).
- `aria-*` — `aria-hidden` (12), `aria-label` (9), `aria-describedby` (3, `SiteNav.tsx`), `aria-valuetext`/`aria-labelledby` (slider pattern, `HarmonicExplainer.tsx`), `aria-pressed` (2 — map dot selection, location-list buttons), `aria-live` (2 — sr-only announcements in `AtlasView.tsx`/`CompareView.tsx`), `aria-current` (1, nav "page" state).
- `role=` — `role="button"` (map hit-circle), `role="group"` (map SVG), `role="img"` (3, on the chart SVGs), `role="status"` (2, `YourPlace.tsx` live region).

**Animation (CSS only, no JS library)**:
- `CycleCurve.tsx` bars animate in via a `requestAnimationFrame`-triggered `drawn` boolean, inline `transitionProperty: "height, y"`, `transitionDuration: "600ms"`, easing `cubic-bezier(0.2,0,0,1)`, per-bar stagger `transitionDelay: ${t*40}ms`. A code comment notes this is inline (not a Tailwind arbitrary class) because Tailwind's `transition-[height,y]` silently drops comma-separated properties.
- The two harmonic lines in `CycleCurve.tsx` draw via `strokeDasharray`/`strokeDashoffset` with `pathLength={1}` — 600ms for the annual line, 600ms with a 100ms delay for the semi-annual line.
- `CompareView.tsx` deliberately does not stagger its two `CycleCurve` instances against each other, so both animate simultaneously.
- Hover/focus state transitions use Tailwind's `transition-colors`/`transition` utilities at `duration-fast` (120ms).
- `app/globals.css` has a `@media (prefers-reduced-motion: reduce)` block zeroing `animation-duration`, `animation-iteration-count`, `transition-duration`, and `transition-delay` — a comment notes the delay override exists specifically because `CycleCurve`'s inline per-bar delays (up to 440ms) would otherwise still produce a visible sequential reveal even with instant transitions.

**States found**:
- `YourPlace.tsx` — explicit `Status` union (`idle | loading | error | found`), each rendering distinct text: loading ("Mencari lokasi terdekat…"), error (three distinct messages for no geolocation API / no comparable location / permission denied), found (result sentence).
- `AtlasView.tsx` and `CompareView.tsx` each have a minimal no-data fallback (`<p className="p-6">Tidak ada data lokasi.</p>`), reachable only if the bundled data array were empty.
- `app/not-found.tsx` — custom-styled 404 page with an explanation and a link home.

**States searched for and not found**:
- No skeleton/spinner loading state for the map, curve, or any chart (data is bundled at build time, so there is no runtime fetch to show a spinner for; there is also no visual affordance while `CycleCurve`'s `requestAnimationFrame`-gated draw-in is pending).
- No dedicated onboarding/first-visit walkthrough component.
- No toast/snackbar notification system.
- No "empty search results" state — there is no search/filter input anywhere in the app; selection is via map click, the bottom button list, or the `<select>` pickers in `/banding/`.

## 6. Weak points, stated plainly

- `app/metode/page.tsx`'s "Ambang klasifikasi" section (lines ~136–157) renders six numeric classification thresholds — a monsoon peak center month, two displacement-month cutoffs, three amplitude ratios — as a plain HTML `<table>` with no accompanying diagram, although `HarmonicExplainer.tsx` elsewhere contains SVG machinery for visualizing exactly this kind of amplitude/phase relationship.
- `app/metode/page.tsx`'s "Cakupan" section (lines ~108–126) renders family and sub-type location counts as two flat `<ul>` lists of `"family: N lokasi"` text strings, not any bar/proportion visual, despite family colour-coding existing elsewhere (`Legend.tsx`, `RegimeMap.tsx`) and not being reused here.
- `AtlasView.tsx`'s `<details><summary>Lihat angka pastinya</summary>` disclosure (lines ~166–190) renders the semi-to-annual amplitude ratio and displacement-months values as a plain `<dl>` of label/value pairs with the applicable threshold appended as trailing text (e.g. "— ambang Ekuatorial 0.XX"), with no visual gauge/line showing where the value sits relative to the cutoff.
- `app/banding/page.tsx` / `CompareView.tsx` is a two-column responsive grid (`grid gap-8 lg:grid-cols-2`) of near-identical `CompareSide` blocks — a generic side-by-side card pattern. Nothing in the layout itself (beyond each side's independent curve/table) visually reinforces the shared-month-axis relationship between the two locations — no shared/locked axis element spans both columns, no connecting element links the two independent SVGs.
- Accessibility present: `role="img"` + `aria-label` on all four chart SVGs; `:focus-visible { outline: 3px solid var(--color-ink); outline-offset: 2px; }` globally in `app/globals.css`; `prefers-reduced-motion` handling in `app/globals.css` (see §5); `aria-describedby` on nav links; `aria-valuetext`/`aria-labelledby` on the harmonic-explainer sliders; `role="status"` live region for geolocation state; `aria-live="polite"` sr-only announcements on selection change in `AtlasView.tsx`/`CompareView.tsx`; code comments in `tailwind.config.ts` and `app/globals.css` citing the WCAG contrast rationale for the `ekuatorial-text`/`lokal-text` darker variants (4.5:1 floor for text vs. 3:1 for swatch fills).
- Accessibility absent/partial: no `alt` text usage anywhere in the codebase except one empty `alt=""` on the decorative nav logo image (`SiteNav.tsx:34`) — there are no other `<img>`/photographic assets to caption. No `prefers-contrast` or high-contrast-mode handling found anywhere. The SVG chart tick/month labels use `text-[10px]`, below the codebase's own general type-size floor of 16px; `app/globals.css`'s `--text-xs` comment scopes this exception to "micro-labels, table figures, axis ticks only — never prose."

## Open questions

- Whether `DESIGN.md`'s stated intent for `app/[locale]/` routing (§ referenced in `CLAUDE.md`) has any partial scaffolding elsewhere in the repo beyond `app/` (e.g. translation dictionaries) was not checked beyond the routes listed above.
- Whether any components outside `app/`/`components/`/`lib/` (e.g. in `scripts/`) affect rendered output was not audited — the research pass was scoped to rendering-relevant code.
- Exact line numbers for `app/metode/page.tsx` and `AtlasView.tsx` sections cited in §6 are approximate ranges from the research pass, not independently re-verified line-by-line in this write-up.
