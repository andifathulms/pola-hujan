# DESIGN — Pola Hujan

Authoritative for every visual decision in this repository. `PRD.md` says what the product is; this says what it looks like and why. When code and this document disagree, this document is right.

---

## 1. The house layer

These projects should read as siblings — recognisably from the same hand — without looking like one template recoloured. **What is shared is rhythm and rigour; what is per-app is identity.**

**Shared across every project:**

```
space    4 8 12 16 24 32 48 64 96 128     4px base
motion   fast 120ms · state 240ms · orchestrated 500–600ms · ease cubic-bezier(0.2,0,0,1)
edge     hairline 0.5px · radius 2px only
```

- **One orchestrated moment per app.** Everything else is state change.
- **The legend contract.** Every data view states what it is showing, from what period, and what it cannot show.
- **The citation line.** Small, monospace, always present where a claim is made.
- **Type floor 16px.** Tabular figures on anything that updates.
- **Zero runtime network. Offline after first load. Self-hosted fonts.**
- **Reduced motion gets a complete alternative**, never a degraded one.
- **No component library.**

**Per-app:** colour, typeface, layout, and the instrument.

## 2. This app's identity — and why it's light

The two sibling atlases (lightning, currents) are dark field animations. **This one is deliberately light and categorical**, because the data is a different shape and because a portfolio of three dark canvases reads as one idea repeated.

The material world is **batik pesisir** — the north-coast cloth, dyed in indigo, olive and soga gold on unbleached mori. The almanac reference this replaced was a real one, and the twelve-month grid it gave the product stays; what it could not survive was being a *Western* almanac wrapped around an atlas of Indonesian rainfall. The register is still the same: printed, ruled, hand-tinted, annual. The material is now the one the subject belongs to.

Practically this means warm cloth rather than bleached paper, three dye colours rather than three pigments, and no red — which the dye triad happens to agree with (§3).

## 3. Colour — three families, three channels

The encoding problem is that there are three levels of information — family, sub-type, and confidence — and only one is allowed to be hue.

**Family = hue. Sub-type = tint. Disagreement = hatch.**

Three channels, three meanings, no overload.

### Ground

```
--stock       #F1EADD  [0.828]  unbleached mori — the page ground
--sea         #ECE3D2  [0.774]  the map's water
--plate       #E7DECA  [0.735]  the field plate's mount
--land        #E1D7C2  [0.685]  the map's landmass
--rule        #DBD1BD  [0.643]  hairlines, month gridlines
--stitch      #BFB092  [0.442]  the plate's seam, the coastline hairline
--ink         #231D17           13.94:1 on stock, 12.46:1 on plate
--ink-muted   #605648           6.01:1 on stock — declared, not ink/70%
```

Bracketed figures are relative luminance. The neutrals are **value-steps of one warm family, not new hues** — they give the page a floor, a mount and a map ground without a box-shadow or a border doing the work, and the ramp descends monotonically.

### The three families

```
--monsunal    #2B477B  [0.065]  nila indigo
--ekuatorial  #527030  [0.136]  olive green
--lokal       #977121  [0.185]  soga gold
```

**None of them reads as good or bad** — these are climate regimes, not scores, and a red-to-green ramp would imply a ranking that does not exist.

#### Hue is not the only channel the reader receives

Family is encoded as hue, but a reader may be receiving that hue through greyscale, through the print stylesheet, or through a colour-vision deficiency. So the three hues carry **two constraints beyond being three different colours**, and both are asserted in `tests/design/palette.test.ts` rather than trusted to this document:

1. **They stay apart in value.** The three luminances span 0.120 with no adjacent pair closer than 0.04. The palette this replaced spanned 0.061, and in greyscale the three families collapsed into one grey.
2. **They stay apart under dichromacy.** The closest pair is ΔE 33.8 under deuteranopia, 27.8 under protanopia, 21.4 under tritanopia. Below about 10 two colours stop being tellable apart. The previous palette sat at 12.4 under tritanopia.

The olive is what buys most of this: a green pulled toward yellow separates from indigo in a way a blue-green does not.

**The value spread is bounded by the map, not by taste.** The lightest family hue has to keep 3:1 against `--land`, the darkest surface a map dot is ever drawn on, which is what fixes the top of the range.

Two of the three also carry a **text-only variant** — `--ekuatorial-text` `#4F6B2E` and `--lokal-text` `#7D5D1B`. The canonical hues clear the 3:1 a dot fill needs but not the 4.5:1 normal-weight text needs on both `stock` and `plate`. `--monsunal` needs no variant. A text variant is never used as a fill and a fill hue is never used as text.

**Sub-types are tints of the family hue**, never new colours. Monsunal-1 and Monsunal-2 are two values of the same blue. This keeps the three-family structure readable at a glance while the sub-type stays available on inspection.

### Overlays

```
--you         #763254    your location — batik plum, outside all three families
--disagree    hatch      diagonal, over the family colour
```

**Disagreement is a pattern, not a colour**, because it is not a fourth family. It is a statement about confidence, and giving it a hue would place it in the same channel as the classification itself.

`--you` sits outside the family palette so it is findable on any regime.

### Not in the palette

**No red.** Nothing here is an error or a hazard.
**No continuous ramp for the regime map.** The data is categorical; a gradient would invent ordering between families that does not exist.

## 4. The cycle curve

The core object. Twelve monthly bars for a location, with the fitted annual and semi-annual harmonics drawn over them as thin curves.

- Bars in the family hue, ink hairline baseline, month labels beneath.
- **The two harmonics drawn separately, not summed** — seeing the annual and semi-annual components individually is what makes the classification legible rather than asserted.
- Y-axis in mm, tabular figures, always labelled.
- **Fixed month order Jan–Dec, always.** Never rotated to centre a peak; the whole point is that peaks sit in different months in different places, and re-centring would destroy the comparison.

### 4.1 The field plate

**"Almanac, Intensified" — the one signature element.** On the atlas, the selected location's curve is restated once, full width, beneath the map-and-meta row, as a mounted plate rather than a chart squeezed into a third-width column. Same `CycleCurve`/`CycleTable`, not a new chart — the ambition is spent on presentation, in one place, rather than spread thin across the page.

- Ground is `--plate` (`#E8E2D0`), one value-step darker than `--stock` — a value-step of the same warm-neutral family, not a new hue. A `--stitch` (`#B7AE95`) hairline stands in for elevation, since the app uses no box-shadow anywhere and this keeps it that way.
- The location name sets in the display serif at `--text-4xl` (58px) — the one place in the app that goes above the 46px ceiling elsewhere in the type scale (§8), scoped to this single heading.
- The two harmonics draw heavier here (2.5px / 1.75px vs. the standard 1.5px / 1px) and the month labels set uppercase, letterspaced, mono — an instrument-plate register for this one reading, not a change to `CycleCurve`'s default appearance anywhere else it's used (`CompareView` is untouched).
- One plate, one location, one moment. It does not appear per-row in a list or repeat anywhere else — repeating it would make it wallpaper, not a signature.

## 5. The archetype strip

Three reference curves — one per family — always visible along one edge. A selected location can be pattern-matched against them without the reader having to remember what each family looks like.

Small, quiet, permanent. Not a legend that expands; a fixed part of the page.

### 5.1 The regime wall

**Every location's cycle, at once, on one shared twelve-month axis.** The atlas's founding claim is a comparison — that "musim hujan" does not mean the same months everywhere — and a map that reveals one location per click makes the reader hold that comparison in their head. The wall puts it on the page.

- One cell per location: twelve bars, month gridlines, the name, the peak month and the wettest month's value. **Every cell divides its width into the same twelve slots**, Jan at the left, so a month sits at the same place across the whole wall. This is §1.1 of `DESIGN-REWORK.md` — one shared axis — applied to 34 panels instead of two.
- **Each cell keeps its own mm scale and states it.** A shared y-scale across the archipelago would flatten the dry places to nothing; the comparison here is of shape and timing, not magnitude.
- **The two harmonics are not drawn at wall size.** They are the evidence for the classification (§4) and need room to be read as two separate lines; at thumbnail size they overlap into one smudge, which would assert the fit rather than show it. The reading panel and the field plate still draw them apart.
- Sortable by family, by peak month, or by annual rainfall. **Sorting by peak month is the proof**: the Monsunal cells bunch at the two ends of the year and the Lokal ones sit in the middle of it, with no interaction and no copy required.
- Month order stays fixed Jan–Des in every cell, never rotated (§4).

### 5.2 The filter bar

Search by city or province, three family toggles, and **the disagreement toggle** — driving the map and the wall from one filter state, so the two views can never show different answers to the same question.

The disagreement toggle is the point of it. Where the derived classification differs from BMKG's published family is the finding, and as a hatch texture alone it was visible but not addressable. As a control with a count it can be asked for. **It still reports and never asserts** — no threshold moves when it is on, and the bar says so. A location with no BMKG family to compare against is never counted as a disagreement.

## 6. Layout

**An atlas spread, not a full-bleed canvas.** This app has two co-equal objects — the map and the curve — and neither should dominate.

**Reading order on the atlas is: masthead, filter bar, map spread, field plate, wall.** The masthead is an eyebrow, the name, one sentence and the nearest-opposite finding — **never a stack of cards in front of the atlas.** Explanation that is not one of §9's required statements goes into a disclosure, not into a paragraph above the fold.

**Desktop:** map on the left two-thirds with the legend (§9) set directly beneath it as the map's own caption, the selected location's meta panel and archetype strip on the right third. The field plate (§4.1) runs full width beneath that row — a third tier, not a third column, so it doesn't compete with the map/meta split above it. The regime wall (§5.1) runs full width beneath the plate. Comparison mode splits the curve panel into two stacked curves sharing one month axis.

**Mobile:** map at 45vh, legend, meta panel and archetypes beneath, the field plate beneath that, the wall last at two columns.

**Boxes are the last resort, not the default.** Value steps (`stock` → `plate`, `sea` → `land`) and hairline rules separate things; a border around every block leaves nothing in the foreground.

**Never overlay the curve on the map.** They are different kinds of statement and stacking them would muddle both.

## 7. Motion

**The orchestrated moment is the curve drawing month by month**, January to December, over about 600ms. Slow enough that the reader *reads* the cycle rather than seeing it appear — you follow the rise and the fall.

**In comparison mode both curves draw simultaneously.** That is the demonstration: two places, two shapes, the inversion visible as it happens rather than as a finished picture.

Everything else is state change — map selection, family filter, mode switch.

```
--dur-fast    120ms
--dur-state   240ms
--dur-curve   600ms
```

**Reduced motion:** curves render complete and instant, both at once in comparison mode. Nothing is lost but the drawing.

## 8. Type

```
Fraunces          display, headings — high-contrast serif with a voice
Karla             body, controls, labels — squared grotesque, tall x-height
IBM Plex Mono     millimetres, month codes, thresholds, citations
```

Self-hosted via `next/font`, addressed through role-named variables (`--font-display`, `--font-body`, `--font-mono`) rather than face-named ones, so the next change renames nothing downstream.

**The display and body faces must not share a skeleton.** Alegreya and Alegreya Sans did — one superfamily, drawn twice — and the result was that a heading and the paragraph under it had the same proportions, the same rhythm and the same voice, so nothing read as a heading except size. Fraunces and Karla share nothing, which is the requirement, not a preference.

**Fraunces is scoped to display sizes.** Its stroke contrast is what gives a heading a voice; at label size it becomes decoration. Nothing below `--text-base` is ever set in it.

**IBM Plex Mono does not change with the rest.** It is the house data face carried across the sibling projects — the citation line, the figures, the month codes — and a change there would cost identity without buying legibility.

```
14  16  18  22  28  36  46  (58)    1.25 ratio
```

58 (`--text-4xl`) is scoped to the field plate's location name only (§4.1) — not a general step in the scale.

Light ground, so no dark-mode weight correction — body 400, headings 600.

Tabular figures on every rainfall value and threshold.

## 9. Legend — the honesty contract

Never optional. It always states:

1. **That this classification is derived from open gridded precipitation, not BMKG's official Zona Musim.**
2. The dataset, version, and climatological period.
3. The three families and what each means, in one line apiece.
4. That the map shows **regime, not zone boundaries**.

Point 1 appears on the map itself, not only on the method page — **set directly beneath the map as its caption**, which is what "on the map itself" means in practice. It is never a card stacked in front of the atlas.

The dataset and period are a **short monospace stamp**. Sentences about the data are set in the body face; monospace carries figures, not prose.

## 10. Accessibility

- **Colour is never the only channel.** Every regime region carries a text label on hover and in the location panel; the archetype strip names each family; the disagreement hatch is paired with a text label.
- **The curve has a table equivalent** — twelve months with values — always present, not a fallback. It is also what someone would paste into a message.
- Type floor 16px; AA contrast minimum on `--stock` for all three family hues at the sizes used.
- Map selection keyboard-operable; focus visible at 3px.
- Reduced motion has a complete path. §7.

## 11. What not to do

- No red; no good-to-bad ramp across the families.
- No continuous gradient on a categorical map.
- No hue for sub-types — tints only.
- No hue for disagreement — hatch only.
- No re-centring the month axis to align peaks.
- No curve overlaid on the map.
- No onset date shown as a prediction.
- No ZOM boundary drawn that was not derived.
- No dark mode.
- No component library.
- No border where a value-step will do.
- No monospace paragraph — monospace is for figures, codes and citations.
- No family hue that collapses into another in greyscale or under dichromacy — the floors in §3 are tested, not aspirational.
- No display serif below `--text-base`.
- No superfamily pairing for display and body.
