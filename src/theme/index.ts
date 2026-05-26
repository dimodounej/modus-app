/**
 * Modus design tokens — matches the web app's CSS variables exactly.
 * Update both here and in src/app/modus/layout.tsx when changing the palette.
 */
export const colors = {
  bg:       '#0f1117',
  surface:  '#161b22',
  border:   'rgba(255,255,255,0.08)',
  borderHi: 'rgba(255,255,255,0.15)',
  accent:   '#58a6ff',
  muted:    'rgba(255,255,255,0.45)',
  hi:       'rgba(255,255,255,0.92)',
  green:    '#3fb950',
  yellow:   '#d29922',
  red:      '#f85149',
  oxblood:  '#7A1F2B',
} as const;

export const fonts = {
  // Platform system monospace — no extra font loading step needed.
  // iOS renders as Courier New, Android as monospace.
  mono: 'courier' as const,
  sans: undefined,    // system default (SF Pro on iOS, Roboto on Android)
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;
