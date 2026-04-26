// ─── AWNTRAK DESIGN SYSTEM TOKENS ────────────────────────────────────────────
// Source: https://github.com/EAVYDEV/awntrak-design-system
// Import named groups for new code; use T.xxx for inline-style components.

export const colors = {
  brand:          '#1B5FA8',
  brandDark:      '#0D3F72',
  brandDeep:      '#07244A',
  brandSoft:      '#BCD4F4',
  brandSubtle:    '#E8F1FB',

  accent:         '#F5A623',
  accentSoft:     '#FAD07A',
  accentSubtle:   '#FEF6E4',

  success:        '#97C459',
  successText:    '#27500A',
  successSubtle:  '#EAF3DE',

  danger:         '#E24B4A',
  dangerHover:    '#C93F3E',
  dangerText:     '#791F1F',
  dangerSubtle:   '#FCEBEB',

  warningText:    '#8C5505',

  text1:          '#1C1C1B',
  text2:          '#636260',
  text3:          '#959490',

  bg:             '#F4F3F0',
  card:           '#FFFFFF',
  surface:        '#FAFAF8',
  surfaceWarm:    '#EFECE6',

  borderLight:    '#E5E4E0',
  borderMid:      '#C4C3BD',
  borderWarm:     '#D8D2C8',
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
  card:      '24px',
  widget:    '22px',
  container: '20px',
  item:      '18px',
  input:     '16px',
  inputSm:   '14px',
  buttonSm:  '12px',
};

export const shadows = {
  card:       '0 1px 3px rgba(0, 0, 0, 0.07)',
  elevated:   '0 4px 12px rgba(0, 0, 0, 0.10)',
  brandGlow:  '0 2px 6px rgba(27, 95, 168, 0.28)',
  dangerGlow: '0 2px 6px rgba(226, 75, 74, 0.28)',
};

// ─── FLAT TOKEN ALIAS ─────────────────────────────────────────────────────────
// T.xxx used throughout all components. New names are canonical;
// old names kept as backward-compat aliases.

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
  success:       colors.successText,   // canonical usage = dark text green
  successText:   colors.successText,
  successFill:   colors.success,       // fill/dot green = #97C459
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

  // Shadows
  cardShadow:    shadows.card,
  cardHover:     shadows.elevated,
  brandGlow:     shadows.brandGlow,
  dangerGlow:    shadows.dangerGlow,

  // ── Backward-compat aliases (deprecated — prefer new names above) ───────────
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
  dangerFill:    '#F09595',
  warning:       '#C97E0A',
  warningSoft:   colors.accentSubtle,
  warningFill:   colors.accentSoft,
  accentDark:    '#C97E0A',
};

// ─── SEMANTIC CONFIG OBJECTS ──────────────────────────────────────────────────

export const STATUS_CFG = {
  active:   { bg: colors.successSubtle, text: colors.successText, border: colors.success,   dot: colors.success,   label: 'Active'   },
  expiring: { bg: colors.accentSubtle,  text: colors.warningText, border: colors.accentSoft, dot: colors.accentSoft, label: 'Expiring' },
  expired:  { bg: colors.dangerSubtle,  text: colors.dangerText,  border: '#F09595',         dot: '#F09595',         label: 'Expired'  },
};

export const RISK_CFG = {
  critical: { label: 'Critical', bg: colors.dangerSubtle,  text: colors.dangerText,  border: '#F09595',         dot: colors.danger   },
  high:     { label: 'High',     bg: colors.accentSubtle,  text: colors.warningText, border: colors.accentSoft, dot: colors.accent   },
  medium:   { label: 'Medium',   bg: '#EFF4FB',            text: colors.brand,       border: colors.brandSoft,  dot: '#7DAEE8'       },
  low:      { label: 'Low',      bg: colors.successSubtle, text: colors.successText, border: colors.success,    dot: colors.success  },
};

export const CHART_PALETTE = [
  colors.brand, colors.accent, colors.danger, colors.success,
  '#7DAEE8', colors.accentSoft, '#F09595', '#5DCAA5', '#AFA9EC', colors.borderMid,
];
