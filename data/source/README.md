# data/source

`locations.json` is a **placeholder dataset**, not GPM IMERG or CHIRPS
output. PRD.md §4 names IMERG (0.1°, NASA EOSDIS terms) or CHIRPS (0.05°)
as the intended precipitation source; pulling either requires credentials
and a fetch pipeline (`pnpm data:fetch`, currently a stub — see
`scripts/fetch-data.ts`) that this environment does not have access to.

What is here instead: monthly climatology for 15 Indonesian cities, hand
constructed from the same annual + semi-annual harmonic shape the real
pipeline will fit, tuned to plausibly represent each of the three
families (monsunal, ekuatorial, lokal) described in PRD.md §1 — including
Ambon as the Java-inverted Lokal example the product exists to
demonstrate (PRD.md §6.4). Each location carries a `bmkgFamily` field
used only for the agreement report (`lib/harmonic`'s classifier never
reads it); a few are set to disagree with the derived classification on
purpose, to exercise the disagreement layer described in PRD.md §6.5.

**Do not treat these numbers as measured rainfall.** Replacing this file
with real gridded climatology, reduced to the same
`locationSourceSchema` shape (`lib/grid/schema.ts`), is the next real
step past M0 and does not require touching the pipeline that consumes
it.
