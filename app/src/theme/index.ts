// ─── Dhan design tokens ──────────────────────────────────────
// Plain-JS mirror of `Dhan App 2/colors_and_type.css` (:root custom
// properties). This is the single source of truth for styling in the
// RN app — no CSS files. Keep in sync by hand if the prototype's
// tokens change; do not import/parse the .css file at runtime.

export const colors = {
  // Brand
  navy: '#141C41',
  navy80: '#2A3158',
  navy60: '#6A7091',
  navy40: '#A8ACC1',
  navy20: '#D4D6E0',
  navy10: '#E8EAF0',
  navy05: '#F3F4F8',

  gold: '#C9A84C',
  goldSoft: '#FED977',
  goldBg: '#FBF5E3',

  // Surfaces
  bgBase: '#FFFFFF',
  bgSurface: '#F5F6FA',
  bgElevated: '#FFFFFF',
  bgOverlay: 'rgba(20, 28, 65, 0.48)',

  // Foreground (text + icon)
  fg1: '#141C41',
  fg2: '#4A5172',
  fg3: '#8A90A8',
  fg4: '#B8BCCB',
  fgOnDark: '#FFFFFF',
  fgOnGold: '#141C41',

  // Borders / dividers
  borderSubtle: '#EEF0F5',
  borderDefault: '#E1E3EC',
  borderStrong: '#C6CAD8',
  cardBorder: 'transparent',

  // Semantic (finance-appropriate, desaturated)
  income: '#2E7D5B',
  incomeBg: '#E6F2EC',
  expense: '#C94A3B',
  expenseBg: '#FBEAE7',
  warning: '#D89838',
  warningBg: '#FBF2DF',
  info: '#3B6FD4',
  infoBg: '#E6EEFB',

  // Category accents — budget/expense category chips
  catFood: '#E88B5C',
  catTransport: '#6A8FD4',
  catShopping: '#C97BB6',
  catBills: '#7C9B5F',
  catEnt: '#B079D9',
  catHealth: '#5CB4A8',
  catEducation: '#D4A84C',
  catOther: '#8A90A8',
} as const;

// Type scale (mobile-first, 390px reference). `letterSpacing` values are
// in px (RN has no `em`); converted from the CSS `em` tracking using each
// token's own font size.
//
// Poppins is loaded as four separate static-weight files (see
// android/app/src/main/assets/fonts), so weight selection is done by
// `fontFamily`, not `fontWeight` — Android won't synthesize a heavier cut
// of a custom font from a numeric fontWeight the way it does for system
// fonts. Always pick a family string here rather than adding fontWeight.
export const typography = {
  family: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  scale: {
    display: { fontSize: 32, lineHeight: 40, letterSpacing: 32 * -0.02 },
    h1: { fontSize: 24, lineHeight: 32, letterSpacing: 24 * -0.01 },
    h2: { fontSize: 20, lineHeight: 28, letterSpacing: 20 * -0.005 },
    h3: { fontSize: 18, lineHeight: 26, letterSpacing: 0 },
    body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
    bodySm: { fontSize: 13, lineHeight: 20, letterSpacing: 0 },
    caption: { fontSize: 12, lineHeight: 16, letterSpacing: 12 * 0.01 },
    label: { fontSize: 11, lineHeight: 14, letterSpacing: 11 * 0.06 },
  },
} as const;

// Radii — the "Shape" tweak values (soft = default shape in the prototype).
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,

  // Shape-language tokens (soft, the prototype default)
  input: 8,
  control: 12,
  cardSm: 14,
  card: 16,
  cardLg: 20,
  sheet: 24,
  // CSS uses `30%` (relative to the icon's own box) — RN borderRadius
  // needs a number, so apply as `size * radii.iconPct` at the call site.
  iconPct: 0.3,
} as const;

// Spacing — 8px grid, 4px half-step allowed.
export const spacing = {
  s0: 0,
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 48,
  s10: 64,
} as const;

// Elevation — RN shadow props (iOS) mirror `--shadow-*`; Android needs
// `elevation` instead of shadow blur, so both are supplied per level.
export const shadows = {
  xs: { shadowColor: colors.navy, shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sm: { shadowColor: colors.navy, shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md: { shadowColor: colors.navy, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  lg: { shadowColor: colors.navy, shadowOpacity: 0.12, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  card: { shadowColor: colors.navy, shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
} as const;

export const theme = { colors, typography, radii, spacing, shadows } as const;

export type Theme = typeof theme;
export default theme;
