// ─── QMS DESIGN SYSTEM TOKENS ─────────────────────────────────────────────────
// Colors resolve to CSS custom properties set by ThemeProvider (lib/ThemeContext.jsx).
// Concrete hex values per theme live in lib/themes.js.
// Version: 3.0.0

export const colors = {
  // Primary brand — deep enterprise blue
  brand:          'var(--t-brand)',
  brandDark:      'var(--t-brand-dark)',
  brandDeep:      'var(--t-brand-deep)',
  brandSoft:      'var(--t-brand-soft)',
  brandSubtle:    'var(--t-brand-subtle)',
  brandLight:     'var(--t-brand-light)',

  // QC accent — teal/cyan for quality signals
  accent:         'var(--t-accent)',
  accentSoft:     'var(--t-accent-soft)',
  accentSubtle:   'var(--t-accent-subtle)',

  // Success
  success:        'var(--t-success)',
  successText:    'var(--t-success-text)',
  successSubtle:  'var(--t-success-subtle)',

  // Danger
  danger:         'var(--t-danger)',
  dangerHover:    'var(--t-danger-hover)',
  dangerText:     'var(--t-danger-text)',
  dangerSubtle:   'var(--t-danger-subtle)',

  // Warning
  warningText:    'var(--t-warning-text)',

  // Text — cool slate scale
  text1:          'var(--t-text1)',
  text2:          'var(--t-text2)',
  text3:          'var(--t-text3)',

  // Surfaces
  bg:             'var(--t-bg)',
  card:           'var(--t-card)',
  surface:        'var(--t-surface)',
  surfaceWarm:    'var(--t-surface-warm)',

  // Borders
  borderLight:    'var(--t-border)',
  borderMid:      'var(--t-border-mid)',
  borderWarm:     'var(--t-border-mid)',

  // Sidebar (dark)
  sidebar:        'var(--t-sidebar)',
  sidebarHover:   'var(--t-sidebar-hover)',
  sidebarActive:  'var(--t-sidebar-active)',
  sidebarText:    'var(--t-sidebar-text)',
  sidebarMuted:   'var(--t-sidebar-muted)',
  sidebarBorder:  'var(--t-sidebar-border)',
};

export const fontFamily = {
  sans: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
};

export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const fontSizes = {
  micro: '0.6875rem',
  xs:    '0.75rem',
  sm:    '0.875rem',
  base:  '1rem',
  lg:    '1.125rem',
  xl:    '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

export const fontWeights = {
  normal:    400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
};

export const lineHeights = {
  tight:   '1.2',
  snug:    '1.375',
  normal:  '1.5',
  relaxed: '1.625',
};

export const letterSpacing = {
  wide:  '0.12em',
  wider: '0.14em',
};

export const radius = {
  pill:      '9999px',
  card:      '6px',
  widget:    '10px',
  container: '9px',
  item:      '7px',
  input:     '6px',
  inputSm:   '5px',
  buttonSm:  '5px',
};

export const shadows = {
  card:       'var(--t-shadow-card)',
  elevated:   'var(--t-shadow-elevated)',
  brandGlow:  'var(--t-shadow-brand)',
  dangerGlow: 'var(--t-shadow-danger)',
};

export const motion = {
  duration: {
    fast:     '120ms',
    quick:    '150ms',
    standard: '200ms',
    moderate: '300ms',
    slow:     '400ms',
    progress: '700ms',
  },
  easing: {
    standard:   'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    linear:     'cubic-bezier(0, 0, 1, 1)',
  },
};

export const elevation = {
  level0:            'none',
  level1:            shadows.card,
  level2:            shadows.elevated,
  accentPositive:    shadows.brandGlow,
  accentDestructive: shadows.dangerGlow,
};

// ─── FLAT TOKEN ALIAS ─────────────────────────────────────────────────────────

export const T = {
  // Brand
  brand:         colors.brand,
  brandDark:     colors.brandDark,
  brandDeep:     colors.brandDeep,
  brandSoft:     colors.brandSoft,
  brandSubtle:   colors.brandSubtle,
  brandLight:    colors.brandLight,

  // Accent
  accent:        colors.accent,
  accentSoft:    colors.accentSoft,
  accentSubtle:  colors.accentSubtle,

  // Success
  success:       colors.successText,
  successText:   colors.successText,
  successFill:   colors.success,
  successSubtle: colors.successSubtle,

  // Danger
  danger:        colors.danger,
  dangerHover:   colors.dangerHover,
  dangerText:    colors.dangerText,
  dangerSubtle:  colors.dangerSubtle,

  // Warning
  warningText:   colors.warningText,

  // Text
  text1:         colors.text1,
  text2:         colors.text2,
  text3:         colors.text3,

  // Surfaces
  bg:            colors.bg,
  card:          colors.card,
  surface:       colors.surface,
  surfaceWarm:   colors.surfaceWarm,

  // Borders
  borderLight:   colors.borderLight,
  borderMid:     colors.borderMid,
  borderWarm:    colors.borderWarm,

  // Sidebar
  sidebar:       colors.sidebar,
  sidebarHover:  colors.sidebarHover,
  sidebarActive: colors.sidebarActive,
  sidebarText:   colors.sidebarText,
  sidebarMuted:  colors.sidebarMuted,
  sidebarBorder: colors.sidebarBorder,

  // Shadows
  cardShadow:    shadows.card,
  cardHover:     shadows.elevated,
  brandGlow:     shadows.brandGlow,
  dangerGlow:    shadows.dangerGlow,

  // ── Backward-compat aliases ─────────────────────────────────────────────────
  brandDarkest:  colors.brandDeep,
  white:         colors.card,
  bgApp:         colors.bg,
  bgCard:        colors.card,
  text:          colors.text1,
  textSec:       colors.text2,
  textMuted:     colors.text3,
  border:        colors.borderLight,
  successSoft:   colors.successSubtle,
  dangerSoft:    colors.dangerSubtle,
  dangerFill:    'var(--t-danger-fill)',
  warning:       'var(--t-warning)',
  warningSoft:   'var(--t-warning-soft)',
  warningFill:   'var(--t-warning-fill)',
  accentDark:    'var(--t-accent-dark)',
};

// ─── SEMANTIC TOKENS ──────────────────────────────────────────────────────────

export const semanticStatus = {
  positive: {
    bg:     colors.successSubtle,
    fg:     colors.successText,
    accent: colors.success,
  },
  warning: {
    bg:     'var(--t-warning-soft)',
    fg:     colors.warningText,
    accent: 'var(--t-warning)',
  },
  negative: {
    bg:     colors.dangerSubtle,
    fg:     colors.dangerText,
    accent: colors.danger,
  },
};

export const semanticInteractive = {
  primaryBg:      colors.brand,
  primaryBgHover: colors.brandDark,
  surfaceHover:   colors.surface,
  focusRing:      colors.brandSoft,
};

// ─── SEMANTIC CONFIG OBJECTS ──────────────────────────────────────────────────

export const STATUS_CFG = {
  active:   { bg: colors.successSubtle, text: colors.successText,  border: colors.success,          dot: colors.success,          label: 'Active'   },
  expiring: { bg: 'var(--t-warning-soft)', text: colors.warningText, border: 'var(--t-warning-fill)', dot: 'var(--t-warning)',       label: 'Expiring' },
  expired:  { bg: colors.dangerSubtle,  text: colors.dangerText,   border: 'var(--t-danger-fill)',   dot: 'var(--t-danger-fill)',   label: 'Expired'  },
};

export const RISK_CFG = {
  critical: { label: 'Critical', bg: colors.dangerSubtle,  text: colors.dangerText,  border: 'var(--t-danger-fill)',   dot: colors.danger              },
  high:     { label: 'High',     bg: 'var(--t-warning-soft)', text: colors.warningText, border: 'var(--t-warning-fill)', dot: 'var(--t-warning)'         },
  medium:   { label: 'Medium',   bg: colors.brandSubtle,   text: colors.brandDark,   border: colors.brandSoft,         dot: colors.brand               },
  low:      { label: 'Low',      bg: colors.successSubtle, text: colors.successText, border: colors.success,           dot: colors.success             },
};

export const CHART_PALETTE = [
  colors.brand, colors.accent, colors.danger, colors.success,
  'var(--t-purple)', 'var(--t-orange)', 'var(--t-pink)', 'var(--t-teal)', 'var(--t-indigo)', colors.borderMid,
];
