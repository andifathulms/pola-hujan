# DESIGN — Pola Hujan

Authoritative for every visual decision in this repository. `PRD.md` says what the product is; this says what it looks like and why. When code and this document disagree, this document is right.

---

## 1. The house layer

These projects should read as siblings — recognisably from the same hand — without looking like one template recoloured. **What is shared is rhythm and rigour; what is per-app is identity.**

**Shared across every project:**

```
space    4 8 12 16 24 32 48 64 96 128     4px base
motion   fast 120ms · state 240ms · orchestrated 500–600ms · ease cubic-bezier(0.2,0,0,1)
edge     hairline 0.5px · radius 2px on data marks
```

- **One orchestrated moment per app.** Everything else is state change.
- **The legend contract.** Every data view states what it is showing, from what period, and what it cannot show.
- **The citation line.** Small, monospace, always present where a claim is made.
- **Type floor 16px.** Tabular figures on anything that updates.
- **Zero runtime network. Offline after first load. Self-hosted fonts.**
- **Reduced motion gets a complete alternative**, never a degraded one.
- **No component library.**

**Per-app deviation, recorded:** Pola Hujan softens the radius rule. Data marks (bars, dots, gauges, swatches) stay at 2px; cards, panels and sheets take `rounded-card` (10px) or `rounded-sheet` (22px); chips and pills are `rounded-full`. The atlas is read by a general public audience on phones, and controls that look like controls earn that.

**Per-app:** colour, typeface, layout, and the instrument.

## 2. This app's identity — and why it's light

The two sibling atlases (lightning, currents) are dark field animations. **This one is deliberately light and categorical**, because the data is a different shape and because a portfolio of three dark canvases reads as one idea repeated.

The material world is **batik pesisir** — and specifically its bright side. The coastal batik of Pekalongan and Lasem is known for vivid dyes brought by trade; the brown *sogan* palette belongs to the Solo and Yogya courts. An earlier version of this palette (indigo, olive and soga gold on unbleached mori) was sogan in spirit, and on a map it read as mud. **Pesisir Terang** takes the coastal dyes — Pekalongan indigo, leaf green, turmeric — on *mori primissima*, the fine white cotton good batik is drawn on.

The register is still printed, ruled and annual. What changed is that it is now allowed to be bright, because the audience is the general public and the first screen has to earn a second look.

## 3. Colour — three families, three channels

The encoding problem is that there are three levels of information — family, sub-type, and confidence — and only one is allowed to be hue.

**Family = hue. Sub-type = tint. Disagreement = hatch.**

Three channels, three meanings, no overload.

### Ground

```
--stock       #FAF8F3  [0.939]  mori primissima — the page ground
--sea         #EDF1F2  [0.873]  the map's water — the one cool step
--plate       #F0ECE3  [0.841]  the field plate's mount, cards
--land        #E8E2D4  [0.763]  the map's landmass
--rule        #DDD7CA  [0.682]  hairlines, month gridlines
--stitch      #B9B09C  [0.438]  the plate's seam, the coastline hairline
--ink         #14171F           jelaga — 16.88:1 on stock, 15.20:1 on plate
--ink-muted   #545A66           6.53:1 on stock — declared, not ink/70%
```

Bracketed figures are relative luminance. The ramp descends monotonically. `--sea` is the one neutral with a cool bias: a faint water tint lets the coast read against warm land without a heavy stroke.

### The three families

```
--monsunal    #1F3F99  [0.061]  nila Pekalongan
--ekuatorial  #3B7A1F  [0.149]  hijau daun
--lokal       #B86A00  [0.205]  kunyit
```

**None of them reads as good or bad** — these are climate regimes, not scores, and a red-to-green ramp would imply a ranking that does not exist.

#### Hue is not the only channel the reader receives

Family is encoded as hue, but a reader may be receiving that hue through greyscale, through the print stylesheet, or through a colour-vision deficiency. So the three hues carry **two constraints beyond being three different colours**, and both are asserted in `tests/design/palette.test.ts` rather than trusted to this document:

1. **They stay apart in value.** The three luminances span 0.144 with no adjacent pair closer than 0.04. The first palette spanned 0.061 and collapsed into one grey; the sogan palette after it spanned 0.120.
2. **They stay apart under dichromacy.** The closest pair is ΔE 56.9 under deuteranopia, 44.9 under protanopia, 22.8 under tritanopia. Below about 10 two colours stop being tellable apart.

The green is pulled toward yellow on purpose: a teal green scored ΔE 8.8 against the indigo under tritanopia and would fail. A leaf green separates from indigo in a way a blue-green does not.

**The value spread is bounded by the map, not by taste.** The lightest family hue has to keep 3:1 against `--land`, the darkest surface a map dot is ever drawn on, which is what fixes the top of the range.

Two of the three also carry a **text-only variant** — `--ekuatorial-text` `#2F6A18` and `--lokal-text` `#8A5200`. The canonical hues clear the 3:1 a dot fill needs but not the 4.5:1 normal-weight text needs on both `stock` and `plate`. `--monsunal` needs no variant. A text variant is never used as a fill and a fill hue is never used as text.

**Sub-types are tints of the family hue**, never new colours. Monsunal-1 and Monsunal-2 are two values of the same blue. This keeps the three-family structure readable at a glance while the sub-type stays available on inspection.

```
--monsunal-tint    #8FA2D6    monsunal-2
--ekuatorial-tint  #A6C794    ekuatorial-4
--lokal-tint       #E6BC7E    lokal-2
```

A tinted mark is always stroked in its canonical family hue, so its edge keeps the 3:1 a dot needs. The test asserts each tint is lighter than its family and within 20° of its hue.

### Overlays

```
--you         #A1286A    your location — magenta Lasem, outside all three families
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
- **The two harmonics drawn separately, not summed** — the annual as a solid ink line, the semi-annual as a dashed `ink-muted` line. The dashes are in user units: an earlier version normalised the path with `pathLength`, which scaled the dash pattern past the line's length and drew it solid — seeing the annual and semi-annual components individually is what makes the classification legible rather than asserted.
- Y-axis in mm, tabular figures, always labelled.
- **Fixed month order Jan–Dec, always.** Never rotated to centre a peak; the whole point is that peaks sit in different months in different places, and re-centring would destroy the comparison.

### 4.1 The field plate

**The one signature element, now on the city page.** Each `/kota/[id]` page restates the city's curve full width as a mounted plate — `--plate` ground, `--stitch` seam, the name at `--text-4xl`, heavier harmonic strokes and letterspaced month labels. It no longer appears on the atlas, where the city card carries the standard curve beside the map: a second copy of the same curve beneath the first was repetition, not emphasis.

One plate per page, one location. It is never repeated in a list.

## 5. The archetype strip

Three reference curves — one per family — always visible along one edge. A selected location can be pattern-matched against them without the reader having to remember what each family looks like.

Small, quiet, permanent. Not a legend that expands; a fixed part of the page.

### 5.1 The regime wall

**Every location's cycle, at once, on one shared twelve-month axis.** The atlas's founding claim is a comparison — that "musim hujan" does not mean the same months everywhere — and a map that reveals one location per click makes the reader hold that comparison in their head. The wall puts it on the page.

- One cell per location: twelve bars, month gridlines, the name, the peak month and the wettest month's value. **Every cell divides its width into the same twelve slots**, Jan at the left, so a month sits at the same place across the whole wall. This is §1.1 of `DESIGN-REWORK.md` — one shared axis — applied to 34 panels instead of two.
- **Each cell keeps its own mm scale and states it.** A shared y-scale across the archipelago would flatten the dry places to nothing; the comparison here is of shape and timing, not magnitude.
- **The two harmonics are not drawn at wall size.** They are the evidence for the classification (§4) and need room to be read as two separate lines; at thumbnail size they overlap into one smudge, which would assert the fit rather than show it. The reading panel and the field plate still draw them apart.
- Cards on the page ground (`rounded-card`, `rule` border, ink border on hover and selection). Hovering or focusing a card rings its dot on the map, so the wall and the map read as one view.
- Sortable by peak month (the default), by family, or by annual rainfall. Peak-month sorting orders by the wettest month the card is labelled with, then by fitted phase. **Sorting by peak month is the proof**: the Monsunal cells bunch at the two ends of the year and the Lokal ones sit in the middle of it, with no interaction and no copy required.
- Month order stays fixed Jan–Des in every cell, never rotated (§4).

### 5.2 The filter bar

Search by city or province, three family toggles, and **the disagreement toggle** — driving the map and the wall from one filter state, so the two views can never show different answers to the same question.

The disagreement toggle is the point of it. Where the derived classification differs from BMKG's published family is the finding, and as a hatch texture alone it was visible but not addressable. As a control with a count it can be asked for. **It still reports and never asserts** — no threshold moves when it is on, and the bar says so. A location with no BMKG family to compare against is never counted as a disagreement.

## 6. Layout

**The home page is a story; the atlas is a tool.** `/` is for a reader who has been taught that Indonesia has two seasons: the headline, one story sentence assembled from pipeline fields (`lib/storyCopy.ts`), the year sweep (§7), three family chapters each told through one real city, Jakarta and Ambon on one shared axis, then a search for your own city and three facts about the method (the agreement rate, the period, a link to Cara kerja). The map on the home page is a picture — no dot is a tab stop — and the same derived-not-official caption sits directly under it.

**An atlas spread, not a full-bleed canvas.** This app has two co-equal objects — the map and the curve — and neither should dominate.

**Reading order on the atlas (`/peta`) is: header, filter chips, map with the city reading beside it, the wall.** The header is an eyebrow, the title, one story sentence and the "your location" action — never a stack of cards in front of the atlas.

**Desktop:** the map takes the left column (about 60%), sticky while the page scrolls, with the mode switch (Rezim / Hujan per bulan), the nearest-opposite finding and the legend beneath it as its caption. The right column is the **city reading**: province and name, family and BMKG badges, four numbers of the normal year, the curve with its table, why this family (a sentence, two gauges, the exact figures in a disclosure), similar places, two actions, and the archetype strip. The wall runs full width beneath.

**Mobile:** map first at full width, then the caption, then the reading, then the wall at two columns. While the reading is off screen, a slim ink bar at the bottom names the selected city and jumps to it.

**Month mode** sizes each dot by that month's normal (area ∝ mm) and keeps family hue. Size is a separate channel, so no ramp is introduced and the categorical encoding is untouched.

**Boxes are the last resort, not the default.** Value steps (`stock` → `plate`, `sea` → `land`) and hairline rules separate things; a border around every block leaves nothing in the foreground.

**Never overlay the curve on the map.** They are different kinds of statement and stacking them would muddle both.

## 7. Motion

**The orchestrated moment is the year sweep on the home page.** The months step January to December (about 900 ms each) and every dot on the map grows or shrinks with that month's normal. The founding claim — that the wet season does not arrive everywhere at once — is shown as movement rather than stated. A big month name and the month's wettest and driest city update with it, and the twelve-button scrubber beneath the map shows the 34-city mean for each month as a small bar, so the controls are also a chart.

The sweep starts on its own only when motion is allowed, pauses while the hero is off screen or the tab is hidden, and stops for good once the reader picks a month.

**The curve drawing month by month is now a state transition**, not the orchestrated moment: it still runs (bars rise January to December, the annual harmonic draws, the semi-annual fades in) whenever a city is selected, and in comparison mode both curves draw at once.

**Reduced motion:** no autoplay; the month buttons step through the same frames; curves render complete and instant. Nothing is lost but the movement.

```
--dur-fast    120ms
--dur-state   240ms
--dur-curve   600ms
```

**Reduced motion:** curves render complete and instant, both at once in comparison mode. Nothing is lost but the drawing.

## 8. Type

```
Plus Jakarta Sans   structure — headings, controls, labels, body
Newsreader Italic   story — only sentences that carry a finding
IBM Plex Mono       millimetres, month codes, thresholds, citations
```

Self-hosted via `next/font`, addressed through role-named variables (`--font-body`, `--font-story`, `--font-mono`) and Tailwind roles (`font-display`, `font-sans`, `font-story`, `font-mono`). `font-display` and `font-sans` point at the same face.

**Structure and story never share a face.** This replaces the older rule that display and body must not share a skeleton. The problem that rule solved was headings with no voice. Here, headings get their voice from weight (800) and tight tracking, and the sentences that state a finding — the hero lead, chapter takeaways, comparison captions — get a different face altogether. A reader learns fast that italic serif means "this is what the data says".

**Plus Jakarta Sans** was drawn by Tokotype for Jakarta's own city identity. The subject is Indonesian, and so is the typeface.

**Newsreader is scoped.** It is never a label, never a control, never a number, and never below `--text-base`.

**IBM Plex Mono does not change.** It is the house data face carried across the sibling projects.

```
14  16  18  22  28  36  46  (58)  (64)
```

58 is the field plate's location name; 64 is the home page headline only.

Light ground, so no dark-mode weight correction — body 400, headings 800, sub-headings 700.

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
- No story serif below `--text-base`, and never on a label, control or number.
- No second face for structure — story is the only other voice.
