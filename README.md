# Pola Hujan

Rainfall regime atlas for Indonesia. Classifies the annual precipitation
cycle at a set of locations by harmonic decomposition into **monsunal**,
**ekuatorial**, and **lokal** families — the same three-family structure
BMKG's own Zona Musim uses — and reports, but never tunes toward,
agreement with BMKG's published families. Static site, no backend, no
runtime network.

Read [`PRD.md`](PRD.md) for what this is and why, and
[`DESIGN.md`](DESIGN.md) before touching any UI. [`CLAUDE.md`](CLAUDE.md)
has the working conventions and invariants.

## Status

**M0–M6 all have a working first pass, on real data**: `pnpm data:fetch`
pulls a genuine 10-year (2006–2015) climatology from CHIRPS 2.0's
public Indonesia-region product for all 15 locations (see
`data/source/README.md`), the pipeline (`lib/harmonic`,
`scripts/build-data.ts`) classifies it, and the atlas (`/peta`),
two-place comparison (`/banding`), the method page (`/metode`), and
the live harmonic explainer (`/harmonik`) all work end to end and build
to a static export. 9 of the 15 BMKG comparison labels are now cited
against BMKG's real "Pemutakhiran Zona Musim Indonesia Periode
1991-2020" (see `data/source/README.md`); the other 6 are still
unverified estimates. See `CLAUDE.md`'s "Current state" for that and
everything else still open.

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
