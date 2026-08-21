# DESIGN-REWORK — Pola Hujan

**A change document.** `DESIGN.md` stays authoritative — the house layer, the almanac identity, the three-channel encoding, the type stack, the legend contract. Nothing in it is reopened. What follows closes one gap between that document and the code, and adds three things the pipeline already computes.

`CLAUDE.md`'s invariants outrank everything here. In particular invariant 3 (agreement is reported, never asserted), invariant 4 (no onset date as a prediction), invariant 8 (month order fixed Jan–Dec, never rotated), invariant 10 (family is hue, sub-type is tint, disagreement is hatch), invariant 11 (no continuous ramp on the regime map), and invariant 15 (nothing computed in a component). Nothing here touches `lib/harmonic`, `thresholds.ts`, or the pipeline.

---

## 1. The finding: the demonstration has no shared axis

`DESIGN.md` §6 specifies comparison mode as *"two **stacked** curves **sharing one month axis**."* §7 calls the simultaneous draw *"the demonstration."* `PRD.md` §6.4 names Java against Maluku as the demonstration and asks for it as a one-tap preset.

`CompareView` renders `grid gap-8 lg:grid-cols-2` — two independent `CycleCurve` SVGs, each with its own month axis, in two columns. Your audit states it directly: nothing spans both columns, nothing connects the two.

**Two axes means the reader performs the alignment mentally.** One axis means the six-month displacement is visible before a word is read — which is the whole product, per `PRD.md` §1.

### 1.1 Build it as specified

- **Stacked, not side by side.** Two curve panels one above the other, sharing a single January–December axis drawn once.
- **Month gridlines run through both panels**, so a given month is the same x in both. That single fact is what makes the inversion legible.
- **Month labels appear once**, beneath the lower panel.
- Each panel keeps its own y-axis in mm with its own scale — rainfall totals differ by place and forcing a shared y-scale would flatten one of them. Label both scales; the comparison is of *shape and timing*, not magnitude.
- The two curves still draw simultaneously at `--dur-curve`, per §7. That is unchanged and correct.

### 1.2 Mark the displacement

Once the axis is shared, the peak-to-peak distance is a measurable thing on screen. Draw it: a vertical marker at each curve's peak month, running through both panels, with the displacement stated between them in months.

This is the number that defines the Lokal family — `PRD.md` §3, "peak roughly six months displaced" — and it becomes visible rather than asserted. It is derived from the fitted phase the pipeline already emits; nothing is computed in a component (invariant 15).

Where the two places are the *same* family, no displacement marker is drawn. Absence is information.

### 1.3 On mobile

Stacking is already the mobile layout, so the shared axis costs nothing there and is the natural form. The desktop change is bringing desktop in line with mobile rather than the reverse.

---

## 2. The classification is a position on a line

`AtlasView`'s `<details>` renders the semi-to-annual amplitude ratio and the displacement in months as a `<dl>` of label/value pairs, with the applicable cutoff appended as trailing text — *"— ambang Ekuatorial 0.XX"*.

That is a **value, a threshold, and the distance between them**, rendered as two numbers next to each other.

### 2.1 A gauge per criterion

For each of the two decisive quantities, a short horizontal line with the threshold marked and this location's value placed on it. Two of them, stacked, inside the existing disclosure.

- Family hue for the value marker, `ink` hairline for the line, mono label for the threshold — all existing tokens.
- Both criteria shown even when only one was decisive, so the reader sees what the classification turned on.

### 2.2 What this reveals, and why it matters more than it looks

**Proximity to a threshold is fragility.** `CLAUDE.md` invariant 2 exists because *changing a threshold changes the map* — so a location whose amplitude ratio sits a hair from the Ekuatorial cutoff is a location whose family would flip under a defensible different choice.

Your disagreement hatch shows where the derived method differs from BMKG. **Nothing currently shows where the method is close to differing from itself.** That is the same honesty position — a tool that shows where its own method is uncertain is worth more than one that hides it (`PRD.md` §6.5) — and every number it needs is already in the emitted grid.

Do not turn this into a confidence *colour*. Invariant 10 is explicit: three channels, three meanings, never a colour for confidence. The gauge is a position, and position is a fourth channel that costs nothing.

### 2.3 Two more instances of the same shape on `/metode`

- **"Ambang klasifikasi"** renders six thresholds as a plain `<table>`, on a page whose sibling route contains SVG machinery built to visualise exactly this amplitude/phase relationship. The thresholds are the method; a small diagram of the decision — which region of the amplitude-ratio-versus-displacement space each family occupies — would say in one figure what six rows say in six. Keep the table beneath it; it is the precise reading and the accessible path.
- **"Cakupan"** renders family and sub-type counts as flat `<ul>` lists of *"family: N lokasi"*, while family colour-coding exists in `Legend` and `RegimeMap` and is not reused here. A single proportion bar in the three family hues, with counts labelled, reuses an encoding the reader has already learned.

---

## 3. `NearestOppositeFinding` belongs on the map

One bordered paragraph with two inline name-buttons and a distance figure. It is the most striking sentence in the app: two places some tens of kilometres apart whose wet seasons are opposite halves of the year. That is `PRD.md` §1's "three climate countries, not one" made local and concrete.

Draw it. A hairline connection between the two dots on `RegimeMap`, with the distance labelled on it. The paragraph stays as the text equivalent — `DESIGN.md` §10 requires colour never to be the only channel, and a drawn line is not a text label.

The connection is `ink` hairline, not a family hue: it is a relationship between two regimes, not a regime.

---

## 4. Smaller items

**Two token files kept in sync by hand.** `tailwind.config.ts` and `globals.css`'s `:root` block hold the same values, with a comment saying they are maintained manually because Tailwind cannot read CSS custom properties at build time. That comment is honest and the arrangement is a known drift risk. Generate one from the other at build time, or add a test asserting the two agree — the second is five minutes and the portfolio already has this exact test in another repo.

**`/` and `/peta/` render byte-identical output.** The reasoning is recorded and sound: avoiding a JS-dependent redirect for crawlers and no-JS clients. Leave it, but make sure only one of the two is canonical in metadata, or the two URLs compete.

**Locale routing is described in two documents and does not exist.** `CLAUDE.md`'s layout and `DESIGN.md` both assume `app/[locale]/`; the app serves Indonesian flat. `CLAUDE.md`'s "Current state" already records this as deferred, which is the right handling — make sure the layout block in the same file carries a matching note, so a future session reading the tree diagram does not restructure the routes to match a plan that was consciously postponed.

**`text-[10px]` on SVG axis ticks.** Scoped by a comment in `globals.css` to "micro-labels, table figures, axis ticks only — never prose," which is a legitimate carve-out from the 16px floor. Worth promoting from an arbitrary value to a named `--text-tick` token so the exception is declared rather than written inline twice.

**No `prefers-contrast` handling.** Not required, and the palette already carries measured contrast variants. Noted only because the audit surfaced it; low priority.

---

## 5. Build order

1. **Token sync test** (§4). Five minutes, and it protects the thing every other change touches.
2. **Shared month axis in `CompareView`** (§1.1) — stacked panels, one axis, month labels once. This is the product.
3. **Displacement marker** (§1.2) between the two peaks.
4. **Threshold gauges** in `AtlasView`'s disclosure (§2.1), both criteria always shown.
5. **`NearestOppositeFinding` drawn on the map** (§3).
6. **`/metode`**: the classification-space diagram and the coverage proportion bar (§2.3), tables and lists retained beneath.
7. **`--text-tick` token** (§4).

Step 2 before anything else visual. Everything after it is an improvement; step 2 is the difference between the demonstration working and the reader having to assemble it.

Check the stacked comparison at 375px after step 2. Two twelve-bar charts plus a shared axis on a phone is the tight case, and the answer is probably fewer month labels — every second month, or quarter marks — rather than smaller type, since the 16px floor already has only one declared exception.

---

## 6. Do not

- Do not rotate or re-centre the month axis to align the two peaks (invariant 8). The displacement is the finding; aligning it would delete it.
- Do not force a shared y-scale on the two comparison panels. Shape and timing are the comparison; magnitude is not.
- Do not give threshold proximity a colour. Confidence is not a hue (invariant 10) — the gauge is a position.
- Do not draw the nearest-opposite connection in a family hue. It is a relationship between regimes, not a regime.
- Do not present the displacement in months as anything forward-looking. It is a property of the climatology, not an onset (invariant 4).
- Do not compute the gauge positions or the displacement in a component. They come from the emitted grid (invariant 15).
- Do not add a charting library for any of this. Every figure here is bars, hairlines and marks on an axis, and the codebase already hand-authors all four of its charts.
- Do not let the classification-space diagram on `/metode` imply an ordering between families, or use a continuous ramp inside it (invariant 11).
- Do not remove the tables or lists these figures sit beside. Both remain the precise reading and the accessible path (`DESIGN.md` §10).
