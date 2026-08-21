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

The material world is the **agricultural almanac** — printed on warm stock, twelve-month grids, hand-tinted regional maps, ruled monthly columns. It is the register in which "when does it rain here" has always been asked, and it suits a product about annual rhythm.

## 3. Colour — three families, three channels

The encoding problem is that there are three levels of information — family, sub-type, and confidence — and only one is allowed to be hue.

**Family = hue. Sub-type = tint. Disagreement = hatch.**

Three channels, three meanings, no overload.

### Ground

```
--stock    #F2F0E7    warm almanac paper
--ink      #23211C    warm near-black
--rule     #D6D2C4    hairlines, month gridlines
```

### The three families

```
--monsunal    #3A6B8A    blue
--ekuatorial  #4A7C59    green
--lokal       #B5652E    burnt orange
```

Distinguishable at small size and under common colour-vision deficiencies. **None of them reads as good or bad** — these are climate regimes, not scores, and a red-to-green ramp would imply a ranking that does not exist.

**Sub-types are tints of the family hue**, never new colours. Monsunal-1 and Monsunal-2 are two values of the same blue. This keeps the three-family structure readable at a glance while the sub-type stays available on inspection.

### Overlays

```
--you         #8B3A62    your location — plum, outside all three families
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

## 6. Layout

**An atlas spread, not a full-bleed canvas.** This app has two co-equal objects — the map and the curve — and neither should dominate.

**Desktop:** map on the left two-thirds, the selected location's meta panel and archetype strip on the right third. The field plate (§4.1) runs full width beneath that row — a third tier, not a third column, so it doesn't compete with the map/meta split above it. Comparison mode splits the curve panel into two stacked curves sharing one month axis.

**Mobile:** map at 45vh, meta panel and archetypes beneath, the field plate beneath that.

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
Alegreya          display, headings — humanist serif, almanac warmth
Alegreya Sans     body, controls, labels
IBM Plex Mono     millimetres, month codes, thresholds, citations
```

Self-hosted via `next/font`.

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

Point 1 appears on the map itself, not only on the method page.

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
