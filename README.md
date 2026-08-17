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

**M0–M6 all have a working first pass**: the pipeline (`lib/harmonic`,
`scripts/build-data.ts`), the atlas (`/peta`), two-place comparison
(`/banding`), the method page (`/metode`), and the live harmonic
explainer (`/harmonik`) all work end to end and build to a static
export. The precipitation source is currently a **documented
placeholder** (`data/source/README.md`) — real GPM IMERG/CHIRPS
ingestion is the next real step. See `CLAUDE.md`'s "Current state" for
what's still open.

## Setup

```bash
pnpm install
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
