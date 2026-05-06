// ─── THEME DEFINITIONS ─────────────────────────────────────────────────────────
// Each theme is a map of CSS custom property → concrete hex value.
// ThemeProvider applies these to :root so every inline style using var(--t-*)
// responds to theme changes without component-level changes.

const LIGHT = {
  // Brand — Awnex deep enterprise blue
  '--t-brand':           '#1B5FA8',
  '--t-brand-dark':      '#0D3F72',
  '--t-brand-deep':      '#07244A',
  '--t-brand-soft':      '#BCD4F4',
  '--t-brand-subtle':    '#E8F1FB',
  '--t-brand-light':     '#3D7EC4',
  // Accent — amber (active states, expiring status, sidebar accent strip)
  '--t-accent':          '#F5A623',
  '--t-accent-soft':     '#FDE68A',
  '--t-accent-subtle':   '#FEF6E4',
  '--t-accent-dark':     '#C97E0A',
  // Success — warm green
  '--t-success':         '#97C459',
  '--t-success-text':    '#27500A',
  '--t-success-subtle':  '#EAF3DE',
  // Danger — soft red
  '--t-danger':          '#E24B4A',
  '--t-danger-hover':    '#C83B3A',
  '--t-danger-text':     '#791F1F',
  '--t-danger-subtle':   '#FCEBEB',
  '--t-danger-fill':     '#F3B8B8',
  // Warning — same amber as accent
  '--t-warning':         '#F5A623',
  '--t-warning-text':    '#C97E0A',
  '--t-warning-soft':    '#FEF6E4',
  '--t-warning-fill':    '#FDE68A',
  // Text — warm gray scale
  '--t-text1':           '#1C1C1B',
  '--t-text2':           '#636260',
  '--t-text3':           '#959490',
  // Surfaces — blue-tinted bg, warm white surfaces
  '--t-bg':              '#E8EDF4',
  '--t-card':            '#FFFFFF',
  '--t-surface':         '#FAFAF8',
  '--t-surface-warm':    '#F0F2F5',
  // Borders — warm gray
  '--t-border':          '#E5E4E0',
  '--t-border-mid':      '#C4C3BD',
  // Sidebar — deep navy
  '--t-sidebar':         '#07244A',
  '--t-sidebar-hover':   'rgba(255,255,255,0.07)',
  '--t-sidebar-active':  'rgba(255,255,255,0.14)',
  '--t-sidebar-text':    'rgba(255,255,255,0.55)',
  '--t-sidebar-muted':   'rgba(255,255,255,0.4)',
  '--t-sidebar-border':  'rgba(255,255,255,0.08)',
  '--t-purple':          '#7C3AED',
  '--t-purple-subtle':   '#F5F3FF',
  '--t-purple-text':     '#5B21B6',
  '--t-orange':          '#EA580C',
  '--t-pink':            '#EC4899',
  '--t-teal':            '#0D9488',
  '--t-teal-subtle':     '#ECFEFF',
  '--t-teal-text':       '#0E7490',
  '--t-indigo':          '#6366F1',
  '--t-shadow-card':     '0 1px 4px rgba(0,0,0,0.07)',
  '--t-shadow-elevated': '0 4px 12px rgba(0,0,0,0.12)',
  '--t-shadow-brand':    '0 2px 8px rgba(27,95,168,0.25)',
  '--t-shadow-danger':   '0 2px 6px rgba(226,75,74,0.28)',
};

const DARK = {
  '--t-brand':           '#60A5FA',
  '--t-brand-dark':      '#3B82F6',
  '--t-brand-deep':      '#2563EB',
  '--t-brand-soft':      '#1E40AF',
  '--t-brand-subtle':    '#1E3A8A',
  '--t-brand-light':     '#93C5FD',
  '--t-accent':          '#22D3EE',
  '--t-accent-soft':     '#0E7490',
  '--t-accent-subtle':   '#164E63',
  '--t-accent-dark':     '#22D3EE',
  '--t-success':         '#4ADE80',
  '--t-success-text':    '#86EFAC',
  '--t-success-subtle':  '#14532D',
  '--t-danger':          '#F87171',
  '--t-danger-hover':    '#EF4444',
  '--t-danger-text':     '#FCA5A5',
  '--t-danger-subtle':   '#450A0A',
  '--t-danger-fill':     '#7F1D1D',
  '--t-warning':         '#FBBF24',
  '--t-warning-text':    '#FDE68A',
  '--t-warning-soft':    '#451A03',
  '--t-warning-fill':    '#78350F',
  '--t-text1':           '#F1F5F9',
  '--t-text2':           '#CBD5E1',
  '--t-text3':           '#64748B',
  '--t-bg':              '#0F172A',
  '--t-card':            '#1E293B',
  '--t-surface':         '#1E293B',
  '--t-surface-warm':    '#334155',
  '--t-border':          '#334155',
  '--t-border-mid':      '#475569',
  '--t-sidebar':         '#020617',
  '--t-sidebar-hover':   '#0F172A',
  '--t-sidebar-active':  '#3B82F6',
  '--t-sidebar-text':    '#E2E8F0',
  '--t-sidebar-muted':   '#94A3B8',
  '--t-sidebar-border':  '#0F172A',
  '--t-purple':          '#A78BFA',
  '--t-purple-subtle':   '#2E1065',
  '--t-purple-text':     '#DDD6FE',
  '--t-orange':          '#FB923C',
  '--t-pink':            '#F472B6',
  '--t-teal':            '#2DD4BF',
  '--t-teal-subtle':     '#164E63',
  '--t-teal-text':       '#67E8F9',
  '--t-indigo':          '#818CF8',
  '--t-shadow-card':     '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  '--t-shadow-elevated': '0 4px 12px rgba(0,0,0,0.4)',
  '--t-shadow-brand':    '0 2px 8px rgba(96,165,250,0.30)',
  '--t-shadow-danger':   '0 2px 6px rgba(248,113,113,0.30)',
};

// Industrial: light chrome with high-energy orange brand, semantic status colors,
// dark sidebar with orange active state, and flat minimal shadows.
const INDUSTRIAL = {
  ...LIGHT,
  // Brand → orange primary (#F97316 per spec)
  '--t-brand-light':     '#FB923C',
  '--t-brand':           '#F97316',
  '--t-brand-dark':      '#EA580C',
  '--t-brand-deep':      '#C2410C',
  '--t-brand-soft':      '#FED7AA',
  '--t-brand-subtle':    '#FFF7ED',
  // Surfaces — cooler, slightly lighter than LIGHT (#F7F9FB per spec)
  '--t-bg':              '#F7F9FB',
  '--t-surface':         '#F1F5F9',
  '--t-surface-warm':    '#F7F9FB',
  // Status colors per spec
  '--t-success':         '#10B981',
  '--t-success-text':    '#065F46',
  '--t-success-subtle':  '#ECFDF5',
  '--t-warning':         '#F59E0B',
  '--t-warning-text':    '#92400E',
  '--t-warning-soft':    '#FFFBEB',
  '--t-warning-fill':    '#FDE68A',
  '--t-danger':          '#EF4444',
  '--t-danger-hover':    '#DC2626',
  '--t-danger-text':     '#7F1D1D',
  '--t-danger-subtle':   '#FEF2F2',
  '--t-danger-fill':     '#FCA5A5',
  // Sidebar active state = orange
  '--t-sidebar-active':  '#F97316',
  // Flat/minimal elevation per spec ("shadow-sm")
  '--t-shadow-card':     '0 1px 2px rgba(15,23,42,0.05), 0 1px 1px rgba(15,23,42,0.03)',
  '--t-shadow-elevated': '0 4px 8px rgba(15,23,42,0.08)',
  '--t-shadow-brand':    '0 2px 8px rgba(249,115,22,0.30)',
};

// Slate: same light chrome but with an indigo brand and a medium-weight sidebar
const SLATE = {
  ...LIGHT,
  '--t-brand-light':     '#818CF8',
  '--t-brand':           '#6366F1',
  '--t-brand-dark':      '#4F46E5',
  '--t-brand-deep':      '#4338CA',
  '--t-brand-soft':      '#C7D2FE',
  '--t-brand-subtle':    '#EEF2FF',
  '--t-text1':           '#1E293B',
  '--t-bg':              '#F8FAFC',
  '--t-sidebar':         '#334155',
  '--t-sidebar-hover':   '#475569',
  '--t-sidebar-active':  '#6366F1',
  '--t-sidebar-text':    '#E2E8F0',
  '--t-sidebar-muted':   '#94A3B8',
  '--t-sidebar-border':  '#475569',
  '--t-shadow-brand':    '0 2px 8px rgba(99,102,241,0.30)',
};

export const THEMES = {
  light:      { id: 'light',      name: 'Light',      vars: LIGHT      },
  dark:       { id: 'dark',       name: 'Dark',        vars: DARK       },
  slate:      { id: 'slate',      name: 'Slate',       vars: SLATE      },
  industrial: { id: 'industrial', name: 'Industrial',  vars: INDUSTRIAL },
};

// Hardcoded swatch colors for theme picker previews (intentionally not CSS vars)
export const THEME_SWATCHES = {
  light:      '#1B5FA8',
  dark:       '#3B82F6',
  slate:      '#6366F1',
  industrial: '#F97316',
};

export const DEFAULT_THEME = 'light';
