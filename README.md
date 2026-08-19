<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/lockup-dark.png">
    <img src=".github/assets/lockup-light.png" alt="Pola Hujan — rezim, bukan batas zona" width="440">
  </picture>
</p>

<p align="center">
  <a href="https://andifathulms.github.io/pola-hujan/"><img alt="Live site" src="https://img.shields.io/badge/live-andifathulms.github.io%2Fpola--hujan-23211C"></a>
  <a href="https://github.com/andifathulms/pola-hujan/actions/workflows/deploy.yml"><img alt="Build and deploy" src="https://github.com/andifathulms/pola-hujan/actions/workflows/deploy.yml/badge.svg"></a>
  <img alt="No backend, no runtime network" src="https://img.shields.io/badge/backend-none-8B3A62">
</p>

Rainfall regime atlas for Indonesia. Classifies the annual precipitation
cycle at 34 locations by harmonic decomposition into **monsunal**,
**ekuatorial**, and **lokal** families — the same three-family structure
BMKG's own Zona Musim uses — and reports, but never tunes toward,
agreement with BMKG's published families.

> *"In some places the wettest period falls exactly when Java is driest,
> and a few places have four seasons."* Most of Indonesia was taught it
> has two.

**[→ Live atlas](https://andifathulms.github.io/pola-hujan/)**

## What this is

A place's rainy season isn't defined by how much it rains but by the
*shape* of its annual cycle — one peak timed with the Asian monsoon, two
peaks, or one peak timed opposite the monsoon. That shape is derived by
decomposing twelve months of rainfall into an annual and a semi-annual
harmonic wave and classifying purely by comparing their amplitude ratio
and peak timing against named, cited thresholds — never by hand-drawing
zones, and never tuned to match BMKG's map after the fact.

| Page | What's there |
|---|---|
| [`/peta`](https://andifathulms.github.io/pola-hujan/peta/) | The atlas — regime map, cycle curve, archetype strip, "your place" |
| [`/banding`](https://andifathulms.github.io/pola-hujan/banding/) | Two places side by side on the same month axis |
| [`/metode`](https://andifathulms.github.io/pola-hujan/metode/) | Dataset, thresholds, agreement rate, limitations — the receipts |
| [`/harmonik`](https://andifathulms.github.io/pola-hujan/harmonik/) | Drag the harmonics yourself and watch the classification change live |

Read [`PRD.md`](PRD.md) for the full brief and [`DESIGN.md`](DESIGN.md)
before touching any UI. [`CLAUDE.md`](CLAUDE.md) has the working
conventions and invariants — start there for the four things that shape
everything (derived-not-official, climatology-not-forecast, the
hue/tint/hatch channel system, agreement-reported-never-tuned).

## Status

**M0–M6 all have a working first pass, on real data.** `pnpm data:fetch`
pulls a genuine 10-year (2006–2015) climatology from CHIRPS 2.0's public
Indonesia-region product for 34 locations (see
[`data/source/README.md`](data/source/README.md)); the pipeline
(`lib/harmonic`, `scripts/build-data.ts`) classifies it; the atlas,
comparison view, method page, and live harmonic explainer all build to a
static export. 14 of the 34 BMKG comparison labels are cited directly
against BMKG's real *"Pemutakhiran Zona Musim Indonesia Periode
1991-2020"*; the other 20 are unverified best-effort estimates, marked as
such throughout the UI. See [`CLAUDE.md`](CLAUDE.md)'s "Current state"
for everything still open.

## Setup

```bash
pnpm install
pnpm data:fetch      # downloads real CHIRPS rasters (~120 files); takes a minute or two
pnpm data:build      # generates data/grids/ (gitignored, not committed)
pnpm dev
```

```bash
pnpm test:run         # full suite
pnpm test:harmonic    # synthetic recovery
pnpm test:classify    # threshold boundaries + the six-month fixture
pnpm typecheck
pnpm lint
pnpm build             # data:validate, then next build
pnpm preview            # serve ./out under the production basePath
```
