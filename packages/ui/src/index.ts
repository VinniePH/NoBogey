/** Raw brand palette. Prefer semantic `colors` values in product UI. */
export const palette = {
  ink: "#17201B",
  muted: "#647067",
  surface: "#FFFFFF",
  canvas: "#F5F2EA",
  fairway: "#1F7A4D",
  fairwayDark: "#115436",
  flag: "#D14B2F",
  sand: "#D8B66A",
  sky: "#D8EAF2",
  line: "#D8DDD6"
} as const;

/** Purpose-based colour roles shared by the mobile app and admin web. */
export const colors = {
  ...palette,
  background: palette.canvas,
  backgroundElevated: palette.surface,
  text: palette.ink,
  textMuted: palette.muted,
  border: palette.line,
  primary: palette.fairway,
  primaryPressed: palette.fairwayDark,
  onPrimary: palette.surface,
  accent: palette.flag,
  warning: palette.sand,
  focus: palette.fairway
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12
} as const;

export const typography = {
  display: 36,
  heading: 28,
  title: 20,
  body: 16,
  small: 13,
  caption: 12
} as const;

/** Font names registered by the mobile root layout. */
export const fonts = {
  sans: "Inter",
  mono: "JetBrainsMono"
} as const;

export const lineHeights = {
  display: 42,
  heading: 34,
  title: 28,
  body: 23,
  small: 19,
  caption: 16
} as const;

export const borderWidths = {
  hairline: 1,
  standard: 1,
  focus: 2
} as const;

export const elevation = {
  card: "0 1px 2px rgba(23, 32, 27, 0.08)",
  raised: "0 8px 20px rgba(23, 32, 27, 0.12)"
} as const;
