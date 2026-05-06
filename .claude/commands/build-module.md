# /build-module — Awnex QMS Module Builder

You are building a new QMS module for the Awnex warranty platform. This skill
encodes every convention the codebase enforces so the result is drop-in
compatible with the design system, theme switcher, sidebar, and QB plumbing.

Read the user's request (`$ARGUMENTS`). If it is vague (e.g. "build a
Suppliers module"), infer reasonable KPIs, table columns, and status states for
that domain. Ask nothing — just build.

---

## STEP 0 — Gather context before writing any code

Read these files in full before writing a single line:

- `lib/tokens.js` — the complete color/shadow/overlay token surface
- `lib/themes.js` — to confirm all tokens resolve correctly in all four themes
- `lib/dashboardStorage.js` — to see the MODULE_QB_KEYS map and localStorage keys
- `components/QMSShell.jsx` — MODULE_COMPONENTS map + registration pattern
- `components/QMSSidebar.jsx` — NAV_ITEMS array + ICON_PATHS map
- `components/modules/InspectionsModule.jsx` — canonical module anatomy reference
- `pages/api/inspections.js` — canonical QB proxy reference
- `components/modules/QMSOverview.jsx` — module card grid (add the new card here)

---

## STEP 1 — Plan the module

Decide before writing code:

| Decision | Rule |
|---|---|
| **moduleId** | lowercase, no spaces, matches the sidebar `id` key (e.g. `"suppliers"`) |
| **ComponentName** | PascalCase + "Module" suffix (e.g. `SuppliersModule`) |
| **FileName** | `components/modules/{ComponentName}.jsx` |
| **ACCENT color** | Pick ONE from the token set: `C.teal`, `C.danger`, `C.purple`, `C.warning`, `C.success`, `C.indigo`, `C.orange`, `C.pink`. Never use a hex literal. |
| **API route** | `/api/{moduleId}` (e.g. `/api/suppliers`) |
| **QB env prefix** | `QB_{UPPER_ID}` (e.g. `QB_SUPPLIERS`) |
| **localStorage keys** | `awntrak_{moduleId}_table_id` / `awntrak_{moduleId}_report_id` |
| **KPIs** | 4–6 cards; derive from domain (counts, rates, totals, averages) |
| **Status states** | 3–5 mutually exclusive states with semantic colors from token set |
| **Table columns** | 5–8 columns relevant to the domain |
| **Sidebar icon** | Pick from existing ICON_PATHS keys, or add a new SVG path |

---

## STEP 2 — Write the module file

File: `components/modules/{ComponentName}.jsx`

### Required imports

```jsx
import { useState, useEffect } from "react";
import { colors, T } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";
```

Add other imports only if the module genuinely reuses existing sub-components
(e.g. `StatusBadge`, `RiskBadge`, `KpiCard` from shared UI). Never import things
that don't exist yet — build locally instead.

### Token alias

```jsx
const C = colors;
const ACCENT = C.teal; // ← replace with the chosen token
```

### HARD RULE — zero hard-coded colors

Every color value must come from `C.*` (colors object) or `T.*` (flat alias).
The only exception is `"#fff"` inside a button where the text must be white
regardless of theme — and even then, prefer `C.card` or `T.card` so it adapts
to dark mode. If you catch yourself typing `"#"`, stop and find the token.

### Module structure

```
SAMPLE_DATA        — 6–10 rows; realistic domain data
STATUS_CFG         — { [state]: { bg, text, dot } } using C.* tokens
ModuleHeader       — accent strip + title + subtitle + "Configure QB" button
KpiCard            — exactly this spec (see below)
StatusBadge        — pill with dot, uses STATUS_CFG lookup
ConnectBanner      — shown when not QB-connected (uses ACCENT)
btnStyle(variant)  — returns inline style object; variants: "outline", "accent"
{ComponentName}    — main export; orchestrates state + layout
```

### KpiCard — canonical spec (matches design system)

```jsx
function KpiCard({ label, value, sub }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.borderLight}`,
      borderRadius: 6,
      padding: "14px 16px",
      boxShadow: T.cardShadow,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, color: C.text3,
        textTransform: "uppercase", letterSpacing: "0.12em",
        margin: "0 0 8px",
      }}>{label}</p>
      <p style={{
        fontSize: 26, fontWeight: 800, color: C.text1,
        margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
      }}>{value}</p>
      {sub && <p style={{
        fontSize: 11.5, color: C.text3, fontWeight: 500, margin: "4px 0 0",
      }}>{sub}</p>}
    </div>
  );
}
```

### ConnectBanner — canonical spec

```jsx
function ConnectBanner({ onSettings }) {
  return (
    <div style={{
      background: ACCENT + "12",          // hex alpha — only valid pattern
      border: `1px dashed ${ACCENT}`,
      borderRadius: 6,
      padding: "20px 24px",
      marginBottom: 24,
      display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 16,
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>
          Showing sample data
        </p>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>
          Connect a Quickbase report to load live {ModuleName} records.
        </p>
      </div>
      <button onClick={onSettings} style={btnStyle("accent")}>
        Connect QB Report
      </button>
    </div>
  );
}
```

### btnStyle — canonical spec

```jsx
const btnStyle = (variant) => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "7px 14px", borderRadius: 5,
  fontSize: 12, fontWeight: 600, cursor: "pointer",
  ...(variant === "outline"
    ? { background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }
    : { background: ACCENT, border: "none", color: C.card }
  ),
});
```

### ModuleHeader — canonical spec

```jsx
function ModuleHeader({ onSettings }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", marginBottom: 28,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 28, borderRadius: 2, background: ACCENT }} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>
            {ModuleTitle}
          </h1>
          <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <button onClick={onSettings} style={btnStyle("outline")}>
        {/* gear SVG */} Configure QB
      </button>
    </div>
  );
}
```

### Main component skeleton

```jsx
export function {ComponentName}() {
  const [settings, setSettings]         = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [records]                       = useState(SAMPLE_DATA);

  useEffect(() => {
    setSettings(loadModuleSettings("{moduleId}"));
  }, []);

  const isConnected = !!(settings.tableId && settings.reportId);

  // derive KPI values from records via useMemo or inline
  // ...

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="{ModuleTitle}"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            saveModuleSettings("{moduleId}", s);
            setSettings(s);
            setShowSettings(false);
          }}
        />
      )}

      <ModuleHeader onSettings={() => setShowSettings(true)} />
      {!isConnected && <ConnectBanner onSettings={() => setShowSettings(true)} />}

      {/* KPI grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14, marginBottom: 28,
      }}>
        {/* <KpiCard /> entries */}
      </div>

      {/* Optional: chart / breakdown bar */}

      {/* Records table */}
      <div style={{
        background: C.card, border: `1px solid ${C.borderLight}`,
        borderRadius: 6, boxShadow: T.cardShadow, overflow: "hidden",
      }}>
        {/* table header bar */}
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>
            {ModuleTitle} Records
          </span>
          {!isConnected && (
            <span style={{ fontSize: 11, color: C.text3 }}>
              Sample data — connect QB to load live records
            </span>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {COLUMNS.map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontWeight: 700, color: C.text3, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    whiteSpace: "nowrap", borderBottom: `1px solid ${C.borderLight}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((row, i) => (
                <tr key={row.id} style={{
                  borderBottom: i < records.length - 1
                    ? `1px solid ${C.borderLight}` : "none",
                }}>
                  {/* cells */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### Design rules — radius and shadow cheat sheet

| Element | borderRadius | boxShadow |
|---|---|---|
| Card / table container | `6` | `T.cardShadow` |
| Button | `5` | none |
| Status pill / badge | `999` | none |
| Input / select | `5` | none |
| Modal | use `Modal` from `components/ui/Modal.jsx` | `T.modalShadow` |
| Slide-over panel | n/a | `T.panelShadow` |

### Common token quick-reference

| What you need | Token |
|---|---|
| Page background | `C.bg` |
| Card background | `C.card` |
| Secondary surface | `C.surface` |
| Primary border | `C.borderLight` |
| Darker border | `C.borderMid` |
| Body text | `C.text1` |
| Secondary text | `C.text2` |
| Muted text | `C.text3` |
| Brand blue | `C.brand` |
| Brand dark blue | `C.brandDark` |
| Brand deep navy | `C.brandDeep` |
| Success green | `C.success` |
| Success text | `C.successText` |
| Success bg | `C.successSubtle` |
| Danger red | `C.danger` |
| Danger text | `C.dangerText` |
| Danger bg | `C.dangerSubtle` |
| Warning amber | `C.warning` |
| Warning text | `C.warningText` |
| Warning bg | `C.warningSoft` |
| Card shadow | `T.cardShadow` |
| Elevated shadow | `T.cardHover` |
| Overlay (modal) | `T.overlay` |
| Backdrop (panel) | `T.backdrop` |

---

## STEP 3 — Register the module in QMSShell

Edit `components/QMSShell.jsx`:

1. Add import at top: `import { {ComponentName} } from "./modules/{ComponentName}.jsx";`
2. Add entry to `MODULE_COMPONENTS`:
   ```js
   {moduleId}: {ComponentName},
   ```

---

## STEP 4 — Register the module in QMSSidebar

Edit `components/QMSSidebar.jsx`:

1. Add to `NAV_ITEMS`:
   ```js
   { id: "{moduleId}", label: "{Human Label}", iconKey: "{iconKey}", group: "modules" },
   ```
2. If the icon doesn't exist in `ICON_PATHS`, add it. Use a Lucide-compatible SVG
   path string. The `SvgIcon` renderer handles `M` segment splitting automatically.

---

## STEP 5 — Register QB connection storage

Edit `lib/dashboardStorage.js`:

1. Add to `MODULE_QB_KEYS`:
   ```js
   {moduleId}: { table: "awntrak_{moduleId}_table_id", report: "awntrak_{moduleId}_report_id" },
   ```
2. Add both keys to `clearAllData()`:
   ```js
   localStorage.removeItem("awntrak_{moduleId}_table_id");
   localStorage.removeItem("awntrak_{moduleId}_report_id");
   ```

---

## STEP 6 — Create the QB API proxy

Create `pages/api/{moduleId}.js`. Copy `pages/api/inspections.js` exactly, then:

- Replace every occurrence of `inspections` / `INSPECTIONS` with the new module id / UPPER_ID.
- Update the error message strings to name the new module.
- Do not change the logic — the QB proxy pattern is identical for every module.

---

## STEP 7 — Add module card to QMSOverview

Edit `components/modules/QMSOverview.jsx`:

Find the `MODULE_CARDS` array (or wherever module cards are rendered). Add an
entry for the new module with:
- `id`: `"{moduleId}"`
- `label`: human label
- `description`: 1-sentence purpose
- `accent`: the same token as `ACCENT` in the module file (e.g. `C.teal`)
- `icon`: matching key used in the sidebar

---

## STEP 8 — Build verification

After all files are written, run:

```bash
npm run build
```

Fix any type errors reported. Do not skip this step.

---

## STEP 9 — Commit and push

Stage all new and modified files, then commit:

```bash
git add <all changed files>
git commit -m "add {ModuleTitle} module with QB connection and sample data"
git push -u origin claude/implement-warranty-dashboard-O5tQn
```

---

## Checklist before calling done

- [ ] Zero hard-coded hex/rgba values in the module file
- [ ] Module file follows the canonical KpiCard, ConnectBanner, btnStyle specs exactly
- [ ] All card containers use `borderRadius: 6` and `boxShadow: T.cardShadow`
- [ ] All buttons use `borderRadius: 5`
- [ ] `QMSShell.jsx` MODULE_COMPONENTS entry added
- [ ] `QMSSidebar.jsx` NAV_ITEMS entry added
- [ ] `lib/dashboardStorage.js` MODULE_QB_KEYS entry added + clearAllData updated
- [ ] `pages/api/{moduleId}.js` proxy created
- [ ] `QMSOverview.jsx` module card added
- [ ] `npm run build` passes with no errors
- [ ] Changes committed and pushed to `claude/implement-warranty-dashboard-O5tQn`
