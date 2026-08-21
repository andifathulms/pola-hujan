/**
 * Layout geometry shared by CycleCurve and the comparison view's shared
 * month axis and gridlines. Pure numbers describing where things sit on
 * an SVG canvas — not a domain computation (CLAUDE.md invariant 15) —
 * kept in one place so a given month sits at the same x in every chart
 * that draws against it.
 */
export const CURVE_WIDTH = 480;
export const CURVE_HEIGHT = 240;
export const CURVE_PAD_LEFT = 40;
export const CURVE_PAD_BOTTOM = 24;
export const CURVE_PAD_TOP = 12;
export const CURVE_PLOT_WIDTH = CURVE_WIDTH - CURVE_PAD_LEFT - 8;
export const CURVE_PLOT_HEIGHT = CURVE_HEIGHT - CURVE_PAD_TOP - CURVE_PAD_BOTTOM;

export function monthCenterX(monthIndex: number): number {
  return CURVE_PAD_LEFT + (CURVE_PLOT_WIDTH / 12) * monthIndex + (CURVE_PLOT_WIDTH / 12) / 2;
}
