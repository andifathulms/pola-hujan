# PRD — Pola Hujan

**"Musim hujan" does not mean the same months across Indonesia. In some places the wettest period falls exactly when Java is driest, and a few places have four seasons.**

| | |
|---|---|
| **Status** | Draft — pre-implementation |
| **Owner** | Andi Fathul Mukminin Salahuddin |
| **Type** | Personal portfolio project, open source, educational |
| **Deployment** | GitHub Pages (static export, no server, no runtime network) |
| **Language** | Indonesian-first UI; English secondary |
| **Data** | GPM IMERG or CHIRPS gridded precipitation — open terms |
| **Design** | See `DESIGN.md`. Authoritative for every visual decision. |

*Name: explanatory. Deliberately **not** "Zona Musim" — that is BMKG's own framework name and the resemblance would imply affiliation. Alternatives: **Musim Nusantara**, **Rainfall Regimes**.*

---

## 1. The finding

BMKG divides Indonesia into **699 Zona Musim**, grouped into three families:

- **Monsunal** — one rainfall peak and one trough, with the peak falling during the Asian monsoon, usually around the start or end of the year.
- **Ekuatorial** — two rainfall peaks. The **Ekuatorial-4** sub-type has four seasons: two dry periods and two wet.
- **Lokal** — one high and one low period, but **the wettest period does not fall during the Asian monsoon**. Effectively inverted. Thirty-four zones are this type.

So a person in a Lokal zone and a person in Java both say *musim hujan* and mean opposite halves of the year. And most Indonesians were taught the country has two seasons, when some of it has four.

**That is the whole product.** Not a monsoon animation — a demonstration that Indonesia is three climate countries, not one.

## 2. A scope decision worth recording

The obvious build is a wind field animated across twelve months. **It should not be built that way**, because it would be structurally the third version of the same app in this portfolio — gridded field, month dial, canvas render, particle advection. Two of those already exist.

**The regime framing is genuinely different**: polygons and time series rather than a vector field, categorical classification rather than a continuous ramp, small-multiple cycle curves rather than particle trails. Different data shape, different visual language, different question.

## 3. Method — the classification is derived, not drawn

The three families fall out of **harmonic analysis of the annual rainfall cycle**. Fit the annual and semi-annual harmonics to each grid cell's monthly climatology:

| Signature | Regime |
|---|---|
| Annual harmonic dominant, peak in the Asian-monsoon window | **Monsunal** |
| Semi-annual harmonic dominant | **Ekuatorial** |
| Annual harmonic dominant, peak roughly six months displaced | **Lokal** |

**The families emerge from the data rather than being coloured in.** That makes this an analysis with a result, not a rendering of someone else's map — and it reuses the same first-and-second-harmonic machinery as the tidal project, which is a pleasing thread rather than a coincidence.

## 4. Data, and the honesty position

**Precipitation:** GPM IMERG at 0.1° under NASA's EOSDIS terms, or CHIRPS at 0.05°. Both open, both usable without a licence question.

**ZOM polygon boundaries: unverified.** BMKG publishes them in bulletins and PDFs; whether shapefiles are downloadable and redistributable has not been checked. **Do not build on them before verifying.**

**The resolution: BMKG's published classification is the validation target, not the input.** The app derives its own regime map from open gridded data and then reports agreement against BMKG's published families. That sidesteps the licensing question entirely and turns a dependency into a result.

Three things must be stated plainly and repeatedly:

1. **This is a derived classification, not BMKG's official one.** Their zones come from station networks and expert judgement, not from harmonic fitting of a satellite grid.
2. **The map shows regime, not zone boundaries.** No ZOM borders are drawn that were not derived. A grid classification produces regions, not the official polygons.
3. **This is climatology, not forecast.** BMKG issues onset predictions each season; this shows long-term normals. **No onset date is ever presented as a prediction.**

## 5. Non-goals

- **No forecast, no onset prediction, no seasonal outlook.** BMKG does that; implying otherwise would be harmful to anyone planning a planting season on it.
- **No ZOM boundary reproduction** unless the data proves redistributable.
- **No agricultural advice.** The app says what the climatology is, never what to plant or when.
- **No wind field animation.** §2.
- **No accounts, no server, no runtime network.**
- **No ML.** The classification is a harmonic fit with stated thresholds, fully inspectable.

## 6. Features

### 6.1 The regime map
The archipelago coloured by family — three categorical hues, sub-types as tints within a family. Selecting anywhere opens that cell's annual cycle.

### 6.2 The cycle curve
Twelve monthly bars for the selected location, with the fitted annual and semi-annual harmonics overlaid. **The shape is the evidence** — a single hump, a double hump, or a hump in the wrong half of the year.

### 6.3 The archetype strip
Three reference curves — monsunal, ekuatorial, lokal — always visible, so a selected place can be pattern-matched against them without remembering what each family looks like.

### 6.4 Comparison
Two places side by side, curves aligned on the same month axis. **Java against Maluku is the demonstration**, and it should be a one-tap preset.

### 6.5 The disagreement layer
Where the derived classification differs from BMKG's published family, shown as a hatch over the regime colour. Expected in transition areas and complex terrain — **and interesting rather than embarrassing.** A tool that shows where its own method is uncertain is worth more than one that hides it.

### 6.6 Your place
Regime family, sub-type, peak month, driest month, and normal cycle. Practical without being predictive.

### 6.7 The harmonic explainer
How the classification works, with a live decomposition: drag the annual and semi-annual amplitudes and watch a synthetic cycle become monsunal, equatorial or local. The method made playable.

### 6.8 Method page
Dataset, version, period, the classification thresholds, agreement rate against BMKG, and everything in §4.

## 7. Architecture

Static Next.js 14 App Router export. No backend, no runtime network.

```
IMERG/CHIRPS monthly climatology (build time)
  → crop to region → per-cell harmonic fit
  → classify by amplitude ratio + phase
  → emit: regime grid, cycle curves, agreement layer, coverage report
  → map | curve | archetypes | comparison
```

**`lib/harmonic` is pure and runs in Node.** Fit, amplitude, phase, classification. Same shape as the tidal project's core, and testable the same way.

**Thresholds are named, cited constants in one place** — not scattered magic numbers. Changing a threshold changes the map, so it must be a visible, documented decision.

**The agreement layer is generated by the pipeline**, not hand-authored, so it cannot drift from the actual classification.

## 8. Testing

**Synthetic ground truth.** Generate a cycle from known annual and semi-annual amplitudes and phases, fit it, and assert recovery within tolerance. Sweep across noise levels and amplitude ratios. **You control the answer, so correctness is provable.**

**Classification boundaries.** Synthetic cycles constructed just either side of each threshold must classify as intended. Both directions.

**Phase handling.** A cycle displaced by six months must classify as Lokal, not Monsunal. This is the case that defines the product and it gets a permanent fixture.

**Agreement is reported, not asserted.** The agreement rate against BMKG's published families is computed by the pipeline and displayed. **It is not a pass/fail test** — a derived method legitimately differs from an expert-drawn one, and forcing agreement would mean tuning thresholds until the answer matched, which is not analysis.

**Pipeline integrity.** Grid dimensions, bounds, value ranges asserted against source metadata. Coverage report generated, not hand-written.

**Determinism.** Same source version and thresholds produce a byte-identical bundle.

## 9. Milestones

| | | |
|---|---|---|
| **M0** | Pipeline | Scaffold; IMERG/CHIRPS fetch, crop, monthly climatology; harmonic fit; synthetic test suite green. **No UI.** |
| **M1** | Classification | Thresholds, family and sub-type assignment, coverage report. Console only. |
| **M2** | The atlas | Regime map, cycle curve, archetype strip. **Ship publicly here.** |
| **M3** | Comparison | Two-place mode, the Java-versus-Maluku preset, your place. |
| **M4** | Honesty | Agreement layer against BMKG, method page, thresholds documented. |
| **M5** | Explainer | Live harmonic decomposition, editorial. |
| **M6** | Polish | Sharing, print, a11y. |

## 10. Success criteria

- Synthetic cycles recover their amplitudes and phases within tolerance.
- A six-month-displaced cycle classifies as Lokal, asserted permanently.
- Threshold boundaries classify correctly on both sides.
- Agreement rate against BMKG computed and displayed, never tuned toward.
- No onset date presented as a prediction anywhere.
- The derived-not-official statement appears on the map itself, not only the method page.
- No ZOM boundary drawn that was not derived.
- Zero network requests after first load. JS ≤ 200 KB gzipped, excluding grids.

## 11. Deployment

`output: 'export'`, `basePath` matching the repository name, `.nojekyll` in the output root. Grids ship as separate chunks. Pipeline validation gates the deploy. Fonts self-hosted. Verify under the production `basePath` with `pnpm preview` before pushing.

## 12. Risks

| Risk | Mitigation |
|---|---|
| **Read as an official BMKG product.** | Different name, no institutional branding, derived-not-official stated on the map. |
| **Read as a forecast.** | No onset prediction anywhere; climatology framing throughout; BMKG named as the forecast authority. |
| **Someone plants on it.** | No agricultural advice, no onset dates as predictions, explicit statement. |
| **Thresholds tuned until the map matches BMKG.** | Agreement is a reported metric, never a test. Thresholds are cited constants and changing one is a documented decision. |
| **ZOM polygon licence assumed.** | Not used unless verified. The derived map does not need them. |
| **Third field-animation app.** | §2 is a recorded scope decision. Categorical atlas, not a flow field. |
