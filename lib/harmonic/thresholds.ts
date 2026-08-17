/**
 * Named, cited classification constants. Changing any of these changes the
 * regime map — see CLAUDE.md invariant 2 and PRD.md §3/§7. Do not inline
 * a magic number at a call site; import from here.
 *
 * The three-family structure (monsoonal / equatorial / local rainfall
 * regions of Indonesia) follows Aldrian, E. & Susanto, R. D. (2003),
 * "Identification of three dominant rainfall regions within Indonesia and
 * their relationship to sea surface temperature", Int. J. Climatol. 23,
 * which is also the basis for BMKG's own Monsunal / Ekuatorial / Lokal
 * Zona Musim families. The exact amplitude-ratio and phase-displacement
 * cut points below are this project's own calibration for a harmonic fit
 * (Aldrian & Susanto classify by correlation against reference stations,
 * not by Fourier amplitude ratio), and are validated only by the reported
 * agreement rate against BMKG's published families (PRD.md §4, §8) — they
 * are never tuned to raise that number.
 */

/**
 * Month of the centre of the Asian-monsoon wet peak across most of
 * western/central Indonesia, Jan = 0. BMKG and Aldrian & Susanto place
 * this in December–February; January is the midpoint.
 */
export const MONSOON_PEAK_CENTER_MONTH = 0;

/**
 * Circular distance in months (0-6) from `MONSOON_PEAK_CENTER_MONTH` at
 * or below which an annual-dominant cycle is classified Monsunal. A
 * quarter of the year: the peak falls within the DJF-to-shoulder window.
 */
export const MONSUNAL_MAX_DISPLACEMENT_MONTHS = 3;

/**
 * Circular distance in months (0-6) from `MONSOON_PEAK_CENTER_MONTH`
 * above which an annual-dominant cycle is classified Lokal — the wet
 * peak falls in the "wrong" half of the year. Set equal to
 * `MONSUNAL_MAX_DISPLACEMENT_MONTHS` so every displacement value falls on
 * one side or the other; the six-month case (exact antiphase) is the
 * clearest possible Lokal signal and is asserted permanently in tests.
 */
export const LOKAL_MIN_DISPLACEMENT_MONTHS = MONSUNAL_MAX_DISPLACEMENT_MONTHS;

/**
 * Ratio of semi-annual to annual amplitude at or above which the annual
 * cycle is treated as semi-annual-dominant, i.e. Ekuatorial (two peaks
 * per year) rather than annual-dominant (one peak). 1.0 = the two
 * harmonics carry equal weight.
 */
export const EKUATORIAL_DOMINANCE_RATIO = 1.0;

/**
 * Ratio of semi-annual to annual amplitude at or above which an
 * Ekuatorial cycle is further split into the Ekuatorial-4 sub-type — a
 * clearly four-season cycle (two distinct dry periods, two distinct wet
 * periods) rather than a weakly bimodal one.
 */
export const EKUATORIAL_4_RATIO = 1.5;

/**
 * Ratio of the secondary harmonic (the one that did not decide the
 * family) to the dominant one, at or above which a Monsunal or Lokal
 * cycle is given the "-2" sub-type: a single dominant peak with a
 * noticeable secondary shoulder, as opposed to a clean single-peak "-1".
 */
export const SECONDARY_HARMONIC_SUBTYPE_RATIO = 0.5;
