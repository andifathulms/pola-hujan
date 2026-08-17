# CLAUDE.md — Pola Hujan

Rainfall regime atlas for Indonesia. Classifies the annual cycle at every grid cell by harmonic decomposition into monsunal, equatorial and local families, and shows where that derived map disagrees with BMKG's published one. Static site, GitHub Pages, no backend, no runtime network.

Read `PRD.md` before starting any task, and **`DESIGN.md` before writing any UI** — it opens with the shared house layer used across these projects.

**Four things shape everything:**

1. **This is a derived classification, not BMKG's official Zona Musim.** Their zones come from station networks and expert judgement. The derived map will differ, and where it differs is a finding — not something to tune away.
2. **Climatology, never forecast.** BMKG issues seasonal onset predictions. **No onset date is ever presented as a prediction here**, and no agricultural advice is given. Someone could plant a season on a wrong number.
3. **Family is hue, sub-type is tint, disagreement is hatch.** Three levels of information, three channels, no overload. `DESIGN.md` §3.
4. **Agreement with BMKG is a reported metric, never a test.** Tuning thresholds until the map matches would replace analysis with imitation.

---

## Stack

- Next.js 14, App Router, `output: 'export'` — static only
- TypeScript, `strict: true`
- Tailwind CSS, tokens from `DESIGN.md`
- Zod for manifest and threshold validation
- Vitest
- pnpm
- **No charting library, no mapping library with a tile dependency, no statistics library.** The harmonic fit and the curve are the project.
- Fonts via `next/font`, self-hosted.

## Commands

```bash
pnpm dev
pnpm build                  # static export; runs data:validate first
pnpm preview                # serve ./out under the production basePath
pnpm test                   # vitest watch
pnpm test:run               # vitest once — before every commit
pnpm test:harmonic          # synthetic recovery of amplitude and phase
pnpm test:classify          # threshold boundaries, both sides; the six-month case
pnpm data:fetch             # DEV/CI — pull IMERG or CHIRPS
pnpm data:build             # climatology, harmonic fit, classify, emit grids + reports
pnpm data:validate          # manifest, thresholds cited, coverage + agreement generated
pnpm typecheck
pnpm lint
```

`pnpm test:harmonic`, `pnpm test:classify` and `pnpm data:validate` gate the build and CI.

## Layout

```
app/
  [locale]/                 # id (default), en
    peta/                   # regime map + curve + archetypes
    banding/                # two-place comparison
    metode/                 # dataset, thresholds, agreement rate, limitations
    harmonik/               # the live decomposition explainer
components/
  map/                      # categorical regime rendering, selection
  curve/                    # twelve monthly bars + the two harmonics
  archetypes/               # the three reference curves, permanent
  compare/                  # stacked curves, shared month axis
  table/                    # curve's text equivalent
lib/
  harmonic/                 # THE CORE. Pure. Runs in Node.
    fit.ts                  # annual + semi-annual least squares
    amplitude.ts
    phase.ts
    classify.ts             # family + sub-type from amplitude ratio and phase
    thresholds.ts           # named, cited constants — ONE place
  grid/                     # decode, lookup
scripts/
  build-data.ts             # DEV/CI — climatology → fit → classify → emit
data/
  grids/                    # regime grid, curve grid, agreement layer, manifest
  bmkg/                     # published family per region, for agreement only
tests/
  harmonic/  classify/
```

## Invariants

1. **`lib/harmonic` is pure and runs in Node.** Numbers in, numbers out. No DOM, no React, no clock, no network, no module-level mutable state. This is what makes the synthetic suite possible.

2. **Thresholds live in `thresholds.ts` as named, cited constants.** Never a magic number at a call site. **Changing a threshold changes the map**, so it is a documented decision with its rationale in the file.

3. **Agreement with BMKG is computed and displayed, never asserted.** There is no test that fails when agreement drops. If a change moves the agreement rate, report it — do not tune toward it.

4. **No onset date is ever rendered as a prediction.** Normals only, labelled as normals. No "musim hujan starts in…" phrasing that could be read forward.

5. **No agricultural advice.** No planting windows, no recommendations, no "best time to". The app states climatology; the reader decides.

6. **The derived-not-official statement appears on the map itself**, not only the method page. `DESIGN.md` §9.

7. **No ZOM boundary is drawn that was not derived.** The map shows regime regions from the grid. **Do not render BMKG's polygons** unless their licence has been verified, and even then not as if they were this app's output.

8. **Month order is fixed January to December, always.** Never rotated to centre a peak. Peaks sitting in different months is the entire finding, and re-centring would destroy it.

9. **The two harmonics render separately, not summed.** Seeing the annual and semi-annual components individually is what makes the classification legible.

10. **Family is hue, sub-type is tint, disagreement is hatch.** Never a fourth hue, never a gradient across families, never a colour for confidence.

11. **No continuous ramp on the regime map.** The data is categorical; a gradient would invent an ordering between families that does not exist.

12. **Coverage and agreement reports are generated by the pipeline**, not hand-written, so they cannot drift from the actual classification.

13. **Raw grids are never committed.** The pipeline emits quantised regime and curve grids with a stated scale.

14. **Zero network requests at runtime.**

15. **Nothing is computed in a component.**

## Working style

- **Write the synthetic generator before the fit.** Build a cycle from amplitudes and phases you chose, then recover them — you control the answer, so correctness is provable rather than plausible.
- **The six-month-displacement case is the product.** A cycle whose peak sits half a year from the Asian monsoon window must classify as Lokal. Fixture it first, permanently.
- **When a classification looks wrong, check the phase convention before the threshold.** Phase wrap-around at the year boundary is where this kind of code bleeds.
- **Never adjust a threshold to improve the agreement rate.** If a threshold changes, it changes because of a stated methodological reason, and the agreement rate moves as a consequence.
- **Build the disagreement layer early**, at M4 and not later. A map without it claims more confidence than the method has.
- **Don't touch `next.config.js`, the Actions workflow, `thresholds.ts`, or `data:validate` without saying so explicitly.**
- **Don't add a charting, mapping or statistics dependency.**
- **Never weaken a test to make something pass.**

## Conventions

- Named exports; defaults only where Next requires them.
- Discriminated unions for families, sub-types and results, keyed on `type`. Exhaustive `switch` with a `never` default — this is how adding a sub-type surfaces every site that must handle it.
- No `any`. No non-null `!` in `lib/harmonic`.
- Rainfall in millimetres named `*Mm`. Phase in months named `*PhaseMonths`, always within `[0, 12)` with wrap handled in one documented place. Amplitudes named `*Amp`.
- Family ids follow BMKG's terminology: `monsunal`, `ekuatorial`, `lokal`, with sub-types `monsunal-1`, `ekuatorial-4`, `lokal-2` and so on. **Use their names — this is their framework and renaming it would be both discourteous and confusing.**
- Comments cite the dataset version or the source of any threshold.
- Indonesian first in UI copy; family names in BMKG's form.
- Tabular figures on every rainfall value.
- Tailwind tokens exactly as in `DESIGN.md` — `stock`, `ink`, `rule`, `monsunal`, `ekuatorial`, `lokal`, `you`. Never raw hex in components.

## Testing rules

- `pnpm test:run` before every commit; `test:harmonic` and `test:classify` before any commit touching `lib/harmonic` or the pipeline.
- Synthetic recovery swept across noise levels and amplitude ratios; amplitudes and phases within stated tolerance.
- Classification asserted on both sides of every threshold.
- **The six-month-displacement fixture is permanent**: a cycle peaking half a year from the monsoon window classifies as Lokal, not Monsunal.
- Phase wrap-around asserted at the December–January boundary.
- Grid decode asserted against source metadata; quantisation round-trips within its scale.
- Coverage and agreement reports asserted to be generated, not hardcoded.
- Determinism: same source version and thresholds produce a byte-identical bundle.
- Bug fix → failing test first.

## Deployment

`main` builds and deploys via Actions; data validation and both test suites gate it. `basePath` must match the repository name; `.nojekyll` must exist in `out/`. Grids ship as separate chunks. Verify with `pnpm preview` before pushing.

## Framing

The site states on the map itself that this is a classification derived from open gridded precipitation, not BMKG's official Zona Musim; that it shows long-term normals rather than a forecast; and that BMKG is the authority for seasonal onset predictions. The method page carries the thresholds, the agreement rate, and the limitations. BMKG's terminology is used and credited. No OIKN or government branding anywhere.

## Current state

**M0 through M6 all have a working first pass.** `lib/harmonic` (fit,
classify, thresholds) is built with its full synthetic test suite
green (43 tests total across harmonic, classify, and geo), and the
site builds to a static export with: the atlas (`/peta` — regime map,
cycle curve, archetype strip, legend, "your place"), two-place
comparison with the Jakarta/Ambon preset (`/banding`), the method page
(`/metode`), and the live harmonic explainer (`/harmonik`). Shareable
URLs, a skip link, visible focus, and a print stylesheet are in.

**Real caveat: the precipitation source is a placeholder.** GPM
IMERG/CHIRPS ingestion (`pnpm data:fetch`) is not implemented — it
requires credentials this environment doesn't have. `data/source/locations.json`
is a documented, hand-constructed stand-in for 15 cities (see
`data/source/README.md`); replacing it with real gridded climatology,
reduced to `locationSourceSchema`, is the next real step and does not
require touching the pipeline or UI that consume it.

Still open: `app/[locale]/` locale routing (English is deferred —
Indonesian is served flat at the app root), the ZOM-polygon licence
question (§4, still unverified and still unused), and further
milestone-6 depth (the disagreement layer is a hatch on point markers,
not yet a polygon layer; sharing/print/a11y are a first pass, not
exhaustive).
