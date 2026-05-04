// ─── NEW THEME TEMPLATE ─────────────────────────────────────────────────────────
// Copy this file, rename MY_THEME / 'mytheme' / 'My Theme', fill in every hex
// value, then register the theme in lib/themes.js.
//
// See docs/theme-switcher.md for the full variable reference and step-by-step guide.
//
// Quick-start: spread an existing theme and override only what differs:
//
//   import { THEMES } from './themes.js';
//   const MY_THEME = { ...THEMES.light.vars, '--t-brand': '#FF6B00', ... };
//
// Otherwise fill in every variable below from scratch.

const MY_THEME_VARS = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  // Primary interaction color: buttons, active nav, links, focus rings.
  '--t-brand':           '#REPLACE_ME',   // e.g. '#1D4ED8' (blue), '#F97316' (orange)
  '--t-brand-dark':      '#REPLACE_ME',   // hover darkening of brand
  '--t-brand-deep':      '#REPLACE_ME',   // pressed / focus state
  '--t-brand-soft':      '#REPLACE_ME',   // light tint — focus ring glow, chip backgrounds
  '--t-brand-subtle':    '#REPLACE_ME',   // very light wash — badge backgrounds, row highlights

  // ── Accent (secondary / QC signals) ───────────────────────────────────────
  // Used for quality-control indicators, secondary actions, and chart series.
  '--t-accent':          '#REPLACE_ME',   // e.g. teal '#0891B2'
  '--t-accent-soft':     '#REPLACE_ME',   // tint of accent
  '--t-accent-subtle':   '#REPLACE_ME',   // lightest accent wash
  '--t-accent-dark':     '#REPLACE_ME',   // darker accent (text on light accent bg)

  // ── Semantic: Success ──────────────────────────────────────────────────────
  '--t-success':         '#REPLACE_ME',   // icon / text color for positive states
  '--t-success-text':    '#REPLACE_ME',   // text on success-subtle backgrounds
  '--t-success-subtle':  '#REPLACE_ME',   // badge / pill background

  // ── Semantic: Danger / Error ──────────────────────────────────────────────
  '--t-danger':          '#REPLACE_ME',   // error state — borders, icons, text
  '--t-danger-hover':    '#REPLACE_ME',   // danger hover (slightly darker)
  '--t-danger-text':     '#REPLACE_ME',   // text color inside danger badges
  '--t-danger-subtle':   '#REPLACE_ME',   // danger badge / banner background
  '--t-danger-fill':     '#REPLACE_ME',   // chart fill / progress bar color for danger

  // ── Semantic: Warning ─────────────────────────────────────────────────────
  '--t-warning':         '#REPLACE_ME',   // warning icons, border highlights
  '--t-warning-text':    '#REPLACE_ME',   // text on warning backgrounds
  '--t-warning-soft':    '#REPLACE_ME',   // warning badge / banner background
  '--t-warning-fill':    '#REPLACE_ME',   // warning chart fill

  // ── Text Scale ────────────────────────────────────────────────────────────
  // Three steps from primary to muted. All must be legible against --t-card.
  '--t-text1':           '#REPLACE_ME',   // headings, bold labels — highest contrast
  '--t-text2':           '#REPLACE_ME',   // body text, descriptions
  '--t-text3':           '#REPLACE_ME',   // placeholders, timestamps, hint text

  // ── Surfaces & Backgrounds ────────────────────────────────────────────────
  // Layering: bg < card < surface. Each step is slightly elevated/lighter.
  '--t-bg':              '#REPLACE_ME',   // outermost page background
  '--t-card':            '#REPLACE_ME',   // card / panel surface
  '--t-surface':         '#REPLACE_ME',   // inner surface (table rows, input fields)
  '--t-surface-warm':    '#REPLACE_ME',   // warm-tinted hover / highlight surface

  // ── Borders ───────────────────────────────────────────────────────────────
  '--t-border':          '#REPLACE_ME',   // default hairline border
  '--t-border-mid':      '#REPLACE_ME',   // stronger border (dividers, active inputs)

  // ── Sidebar ───────────────────────────────────────────────────────────────
  // Sidebar can be dark (like LIGHT / DARK themes) or medium (like SLATE).
  '--t-sidebar':         '#REPLACE_ME',   // sidebar panel background
  '--t-sidebar-hover':   '#REPLACE_ME',   // nav item hover background
  '--t-sidebar-active':  '#REPLACE_ME',   // active nav item background (often = --t-brand)
  '--t-sidebar-text':    '#REPLACE_ME',   // nav label text color
  '--t-sidebar-muted':   '#REPLACE_ME',   // section headers, sub-labels
  '--t-sidebar-border':  '#REPLACE_ME',   // sidebar internal dividers

  // ── Fixed Accent Colors (charts / badges) ─────────────────────────────────
  // Choose hues that remain visually distinct and legible against --t-card.
  '--t-purple':          '#REPLACE_ME',   // e.g. '#7C3AED'
  '--t-orange':          '#REPLACE_ME',   // e.g. '#EA580C'
  '--t-pink':            '#REPLACE_ME',   // e.g. '#EC4899'
  '--t-teal':            '#REPLACE_ME',   // e.g. '#0D9488'
  '--t-indigo':          '#REPLACE_ME',   // e.g. '#6366F1'

  // ── Shadows ───────────────────────────────────────────────────────────────
  // Use rgba() with low alpha for light themes; higher alpha for dark themes.
  '--t-shadow-card':     'REPLACE_ME',    // default card shadow — box-shadow value string
  '--t-shadow-elevated': 'REPLACE_ME',    // modals, dropdowns — more prominent shadow
  '--t-shadow-brand':    'REPLACE_ME',    // brand-colored glow on primary CTA buttons
  '--t-shadow-danger':   'REPLACE_ME',    // danger-colored glow on destructive confirms
};

// ─── Registration ──────────────────────────────────────────────────────────────
// After filling in MY_THEME_VARS above, add the following to lib/themes.js:
//
// 1. Export your vars object (or paste it inline in THEMES):
//
//      const MY_THEME = MY_THEME_VARS;
//
// 2. Add to THEMES:
//
//      export const THEMES = {
//        light:      { id: 'light',    name: 'Light',    vars: LIGHT    },
//        dark:       { id: 'dark',     name: 'Dark',     vars: DARK     },
//        slate:      { id: 'slate',    name: 'Slate',    vars: SLATE    },
//        industrial: { id: 'industrial', name: 'Industrial', vars: INDUSTRIAL },
//        mytheme:    { id: 'mytheme',  name: 'My Theme', vars: MY_THEME },  // ← your entry
//      };
//
// 3. Add a swatch hex for the picker preview:
//
//      export const THEME_SWATCHES = {
//        // ... existing entries
//        mytheme: '#YOUR_BRAND_HEX',
//      };
//
// The ThemeSwitcher will automatically pick up the new theme — no UI changes needed.

export { MY_THEME_VARS };
