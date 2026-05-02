// ─── QMS DESIGN SYSTEM TOKENS ─────────────────────────────────────────────────
// Enterprise Quality Management System — blues/grays palette
// Version: 2.0.0

export const colors = {
  // Primary brand — deep enterprise blue
  brand:          '#1D4ED8',
  brandDark:      '#1E40AF',
  brandDeep:      '#1E3A8A',
  brandSoft:      '#BFDBFE',
  brandSubtle:    '#EFF6FF',

  // QC accent — teal/cyan for quality signals
  accent:         '#0891B2',
  accentSoft:     '#A5F3FC',
  accentSubtle:   '#ECFEFF',

  // Success
  success:        '#16A34A',
  successText:    '#14532D',
  successSubtle:  '#F0FDF4',

  // Danger
  danger:         '#DC2626',
  dangerHover:    '#B91C1C',
  dangerText:     '#7F1D1D',
  dangerSubtle:   '#FEF2F2',

  // Warning
  warningText:    '#92400E',

  // Text — cool slate scale
  text1:          '#0F172A',
  text2:          '#475569',
  text3:          '#94A3B8',

  // Surfaces
  bg:             '#F1F5F9',
  card:           '#FFFFFF',
  surface:        '#F8FAFC',
  surfaceWarm:    '#F1F5F9',

  // Borders
  borderLight:    '#E2E8F0',
  borderMid:      '#CBD5E1',
  borderWarm:     '#CBD5E1',

  // Sidebar (dark)
  sidebar:        '#0F172A',
  sidebarHover:   '#1E293B',
  sidebarActive:  '#1D4ED8',
  sidebarText:    '#CBD5E1',
  sidebarMuted:   '#64748B',
  sidebarBorder:  '#1E293B',
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
  card:      '16px',
  widget:    '14px',
  container: '12px',
  item:      '10px',
  input:     '8px',
  inputSm:   '6px',
  buttonSm:  '6px',
};

export const shadows = {
  card:       '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
  elevated:   '0 4px 12px rgba(15, 23, 42, 0.10)',
  brandGlow:  '0 2px 8px rgba(29, 78, 216, 0.25)',
  dangerGlow: '0 2px 6px rgba(220, 38, 38, 0.28)',
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
  dangerFill:    '#FCA5A5',
  warning:       '#D97706',
  warningSoft:   '#FFFBEB',
  warningFill:   '#FDE68A',
  accentDark:    '#0E7490',
};

// ─── SEMANTIC TOKENS ──────────────────────────────────────────────────────────

export const semanticStatus = {
  positive: {
    bg:     colors.successSubtle,
    fg:     colors.successText,
    accent: colors.success,
  },
  warning: {
    bg:     '#FFFBEB',
    fg:     colors.warningText,
    accent: '#D97706',
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
  active:   { bg: colors.successSubtle, text: colors.successText, border: colors.success,   dot: colors.success,   label: 'Active'   },
  expiring: { bg: '#FFFBEB',            text: colors.warningText, border: '#FDE68A',         dot: '#D97706',         label: 'Expiring' },
  expired:  { bg: colors.dangerSubtle,  text: colors.dangerText,  border: '#FCA5A5',         dot: '#FCA5A5',         label: 'Expired'  },
};

export const RISK_CFG = {
  critical: { label: 'Critical', bg: colors.dangerSubtle,  text: colors.dangerText,  border: '#FCA5A5',         dot: colors.danger   },
  high:     { label: 'High',     bg: '#FFFBEB',            text: colors.warningText, border: '#FDE68A',         dot: '#D97706'       },
  medium:   { label: 'Medium',   bg: colors.brandSubtle,   text: colors.brandDark,   border: colors.brandSoft,  dot: colors.brand    },
  low:      { label: 'Low',      bg: colors.successSubtle, text: colors.successText, border: colors.success,    dot: colors.success  },
};

export const CHART_PALETTE = [
  colors.brand, colors.accent, colors.danger, colors.success,
  '#7C3AED', '#D97706', '#EC4899', '#0D9488', '#6366F1', colors.borderMid,
];
