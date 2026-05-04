# Theme Switcher

The theme system lets users switch the app's visual appearance at runtime. It uses CSS custom properties applied to `:root` — no stylesheet swaps, no class toggling, no re-renders.

## Architecture

```
lib/themes.js           → concrete hex values per theme (the source of truth)
lib/ThemeContext.jsx    → React context, applyTheme(), useTheme() hook
lib/tokens.js           → JS color aliases that resolve to var(--t-*) strings
components/ui/ThemeSwitcher.jsx  → dropdown UI (sidebar + header variants)
pages/_app.jsx          → wraps the app in <ThemeProvider>, inlines default theme to prevent FOUC
```

### How it works

1. `pages/_app.jsx` inlines the light-theme variables as a `<style>` tag in `<Head>` so the page renders with correct colors before any JS runs.
2. `ThemeProvider` mounts, reads `localStorage.getItem('awntrak_theme')`, and calls `applyTheme()`.
3. `applyTheme()` iterates the theme's `vars` object and calls `root.style.setProperty(prop, val)` for each CSS custom property. It also sets `data-theme="<id>"` on `<html>` for debugging.
4. Because every component uses `var(--t-*)` references (via `lib/tokens.js`), the entire UI updates instantly — no React re-renders required.
5. The chosen theme ID is written back to `localStorage` so it persists across sessions.

---

## File Reference

### `lib/themes.js`

Exports:

| Export | Type | Description |
|---|---|---|
| `THEMES` | `{ [id]: Theme }` | All registered themes keyed by ID |
| `THEME_SWATCHES` | `{ [id]: string }` | Single hex color per theme for the picker preview dot |
| `DEFAULT_THEME` | `string` | ID of the theme applied when no preference is saved (`'light'`) |

**Theme object shape:**

```js
{
  id: string,   // unique slug — also used as the localStorage value
  name: string, // display name shown in the picker
  vars: {       // every --t-* property must be present
    '--t-brand':           '#1D4ED8',
    // ... (see CSS Variable Reference below)
  }
}
```

### `lib/ThemeContext.jsx`

**`<ThemeProvider>`** — wrap your app root once (already done in `pages/_app.jsx`).

**`useTheme()`** — hook for any component that needs to read or change the theme:

```js
const { themeId, setTheme, themes } = useTheme();

themeId          // string — ID of the currently active theme
setTheme('dark') // instantly switches + persists to localStorage
themes           // the full THEMES object from lib/themes.js
```

Throws if called outside `<ThemeProvider>`.

### `lib/tokens.js`

JS aliases that map semantic names → `var(--t-*)` strings. Use these in inline styles instead of bare CSS variable strings:

```js
import { colors, T } from '../lib/tokens.js';

// Good:
style={{ background: colors.card, color: colors.text1 }}

// Avoid:
style={{ background: 'var(--t-card)', color: 'var(--t-text1)' }}
```

`T` is a flat alias for all tokens (backward-compat). `colors` contains the color subset.

### `components/ui/ThemeSwitcher.jsx`

Drop-in picker component. Two variants:

```jsx
// In the header:
<ThemeSwitcher />                        // variant="default" (default)

// In the sidebar (respects collapsed state):
<ThemeSwitcher variant="sidebar" collapsed={collapsed} />
```

The menu opens above in the sidebar variant and below in the default variant. A full-screen transparent overlay closes it on outside click.

---

## CSS Variable Reference

All variables must be defined in every theme. Grouped by semantic role:

### Brand

| Variable | Role |
|---|---|
| `--t-brand` | Primary brand color — buttons, links, active nav items |
| `--t-brand-dark` | Hover state for brand-colored elements |
| `--t-brand-deep` | Pressed/focus state |
| `--t-brand-soft` | Soft brand tint (backgrounds, focus rings) |
| `--t-brand-subtle` | Very light brand wash (badges, pill backgrounds) |

### Accent (QC / secondary)

| Variable | Role |
|---|---|
| `--t-accent` | Secondary action color (teal/cyan by default) |
| `--t-accent-soft` | Accent tint |
| `--t-accent-subtle` | Very light accent wash |
| `--t-accent-dark` | Darker accent for text on light accent backgrounds |

### Semantic Status

| Variable | Role |
|---|---|
| `--t-success` | Positive state — icons, text |
| `--t-success-text` | Success text on subtle backgrounds |
| `--t-success-subtle` | Success badge / pill background |
| `--t-danger` | Error / destructive state |
| `--t-danger-hover` | Danger hover |
| `--t-danger-text` | Danger text |
| `--t-danger-subtle` | Danger badge background |
| `--t-danger-fill` | Danger chart fill / progress |
| `--t-warning` | Warning state — icons, text |
| `--t-warning-text` | Warning text |
| `--t-warning-soft` | Warning badge background |
| `--t-warning-fill` | Warning chart fill |

### Text

| Variable | Role |
|---|---|
| `--t-text1` | Primary text (headings, labels) |
| `--t-text2` | Secondary text (body, descriptions) |
| `--t-text3` | Muted text (placeholders, timestamps) |

### Surfaces & Backgrounds

| Variable | Role |
|---|---|
| `--t-bg` | Page / outermost background |
| `--t-card` | Card surface (slightly elevated from bg) |
| `--t-surface` | Inner surface (table rows, input fields) |
| `--t-surface-warm` | Warm-tinted surface variant (hover states) |

### Borders

| Variable | Role |
|---|---|
| `--t-border` | Default hairline border |
| `--t-border-mid` | Slightly stronger border (dividers, active inputs) |

### Sidebar

| Variable | Role |
|---|---|
| `--t-sidebar` | Sidebar background |
| `--t-sidebar-hover` | Sidebar item hover background |
| `--t-sidebar-active` | Active nav item background (usually matches brand) |
| `--t-sidebar-text` | Sidebar label text |
| `--t-sidebar-muted` | Sidebar muted text (section headers, sub-labels) |
| `--t-sidebar-border` | Sidebar internal border |

### Accent Colors (charts / badges)

These are fixed accent hues available for charting and badge use. They should be chosen to remain legible against `--t-card`.

| Variable |
|---|
| `--t-purple` |
| `--t-orange` |
| `--t-pink` |
| `--t-teal` |
| `--t-indigo` |

### Shadows

| Variable | Role |
|---|---|
| `--t-shadow-card` | Default card box-shadow |
| `--t-shadow-elevated` | Modals, dropdowns |
| `--t-shadow-brand` | Brand-colored glow (primary CTA buttons) |
| `--t-shadow-danger` | Danger-colored glow (destructive action confirmation) |

---

## Adding a New Theme

**1. Open `lib/themes.js` and define your vars object.**

You can start from an existing theme as a base using spread:

```js
const MY_THEME = {
  ...LIGHT,           // inherit every LIGHT value as a starting point
  '--t-brand':        '#YOUR_BRAND_HEX',
  '--t-brand-dark':   '#YOUR_BRAND_DARK_HEX',
  // ... override only what differs
};
```

Or define all variables from scratch using the template in `lib/theme.template.js`.

**2. Register the theme in the `THEMES` export:**

```js
export const THEMES = {
  light:      { id: 'light',    name: 'Light',    vars: LIGHT    },
  dark:       { id: 'dark',     name: 'Dark',      vars: DARK     },
  slate:      { id: 'slate',    name: 'Slate',     vars: SLATE    },
  industrial: { id: 'industrial', name: 'Industrial', vars: INDUSTRIAL },
  mytheme:    { id: 'mytheme',  name: 'My Theme',  vars: MY_THEME }, // ← add here
};
```

**3. Add a swatch color for the picker preview:**

```js
export const THEME_SWATCHES = {
  // ... existing entries
  mytheme: '#YOUR_BRAND_HEX',
};
```

That's it. The `ThemeSwitcher` iterates `Object.values(THEMES)` and will pick up the new entry automatically. No component changes needed.

---

## LocalStorage

| Key | Value |
|---|---|
| `awntrak_theme` | Theme ID string — e.g. `'dark'`, `'industrial'` |

The key is read once on mount by `ThemeProvider`. Writing a new value via `setTheme()` updates localStorage immediately. If the stored value is not a key in `THEMES`, it falls back to `DEFAULT_THEME`.

---

## Preventing Flash of Unstyled Content (FOUC)

`pages/_app.jsx` builds a `<style>` string from `THEMES.light.vars` at module evaluation time (Node.js) and inlines it in `<Head>`. This means the browser receives correct CSS variable values in the initial HTML before any JavaScript runs.

If you change `DEFAULT_THEME` in `lib/themes.js`, update the reference in `pages/_app.jsx` accordingly:

```js
// pages/_app.jsx
const defaultThemeVars = Object.entries(THEMES.light.vars)  // ← change 'light' if needed
  .map(([prop, val]) => `${prop}:${val}`)
  .join(';');
```
