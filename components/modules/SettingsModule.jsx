import { useState, useEffect } from "react";
import { colors, T } from "../../lib/tokens.js";
import { useTheme } from "../../lib/ThemeContext.jsx";
import { THEMES, THEME_SWATCHES } from "../../lib/themes.js";
import {
  loadModuleSettings, saveModuleSettings,
  loadDashboardTitle, loadDashboardSubtitle,
  saveDashboardTitle, saveDashboardSubtitle,
  resetAllConfigs, clearAllData,
  DEFAULT_DASHBOARD_TITLE, DEFAULT_DASHBOARD_SUBTITLE,
} from "../../lib/dashboardStorage.js";

const C = colors;

const QB_MODULES = [
  { id: "warranty",    label: "Warranty Management",         accent: "#1D4ED8" },
  { id: "inspections", label: "Inspections",                 accent: "#0891B2" },
  { id: "ncrs",        label: "Non-Conformances",            accent: "#DC2626" },
  { id: "capas",       label: "Corrective Actions (CAPA)",   accent: "#7C3AED" },
  { id: "production",  label: "Production & Batch Tracking", accent: "#D97706" },
];

const THEME_DESCRIPTIONS = {
  light:      "Clean, bright interface with blue accents",
  dark:       "Dark surfaces with high-contrast text",
  slate:      "Cool gray tones with indigo accents",
  industrial: "Bold orange accents, flat shadows, Inter typeface",
};

// Handles QB URL formats:
//   Classic:  https://realm.quickbase.com/db/{tableId}?rid={reportId}
//   New nav:  https://realm.quickbase.com/nav/app/{appId}/table/{tableId}/report/{reportId}
function parseQbUrl(raw) {
  if (!raw?.trim()) return null;
  const v = raw.trim();
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  const tableId =
    parsed.pathname.match(/\/db\/([a-z0-9]+)/i)?.[1] ||
    parsed.pathname.match(/\/table\/([a-z0-9]+)/i)?.[1] || "";
  const reportId =
    parsed.searchParams.get("rid") ||
    parsed.searchParams.get("reportId") ||
    parsed.searchParams.get("qid") ||
    parsed.pathname.match(/\/report\/(\d+)/i)?.[1] || "";
  if (!tableId && !reportId) return null;
  return { tableId, reportId };
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const labelSt = {
  fontSize: 11, fontWeight: 600, color: C.text2,
  marginBottom: 5, display: "block", letterSpacing: "0.02em",
};

const inputSt = {
  width: "100%", padding: "8px 10px",
  borderRadius: T.radiusInput,
  border: `1px solid ${C.borderLight}`,
  background: C.surface,
  color: C.text1,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 700, color: C.text3,
      textTransform: "uppercase", letterSpacing: "0.1em",
      margin: "0 0 16px", paddingBottom: 10,
      borderBottom: `1px solid ${C.borderLight}`,
    }}>
      {title}
    </h2>
  );
}

// ─── THEME CARD ───────────────────────────────────────────────────────────────

function ThemeCard({ theme, isActive, onSelect }) {
  const swatch = THEME_SWATCHES[theme.id];
  return (
    <button
      onClick={() => onSelect(theme.id)}
      style={{
        background: C.card,
        border: `2px solid ${isActive ? C.brand : C.borderLight}`,
        borderRadius: T.radiusContainer,
        padding: "16px",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "border-color 150ms",
        boxShadow: isActive ? T.cardShadow : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: swatch, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text1, flex: 1 }}>{theme.name}</span>
        {isActive && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={swatch} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <p style={{ fontSize: 11, color: C.text2, margin: 0, lineHeight: 1.4 }}>
        {THEME_DESCRIPTIONS[theme.id]}
      </p>
    </button>
  );
}

// ─── QB MODULE CARD ───────────────────────────────────────────────────────────

function ModuleQbCard({ moduleId, label, accent, settings, onUpdate, onSave, saved }) {
  const [url, setUrl] = useState("");
  const [urlMsg, setUrlMsg] = useState("");
  const [urlOk, setUrlOk] = useState(false);
  const isConnected = !!(settings.tableId && settings.reportId);
  const canSave = !!(settings.tableId.trim() && settings.reportId.trim());

  function handleUrl(e) {
    const val = e.target.value;
    setUrl(val);
    if (!val.trim()) { setUrlMsg(""); setUrlOk(false); return; }
    const r = parseQbUrl(val);
    if (!r) { setUrlMsg("Paste a QB table/report URL to auto-fill IDs"); setUrlOk(false); return; }
    if (r.tableId)  onUpdate("tableId", r.tableId);
    if (r.reportId) onUpdate("reportId", r.reportId);
    setUrlMsg(`Parsed — Table: ${r.tableId || "—"} · Report: ${r.reportId || "—"}`);
    setUrlOk(true);
  }

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.borderLight}`,
      borderRadius: T.radiusContainer,
      boxShadow: T.cardShadow,
      borderTop: `3px solid ${accent}`,
      padding: "16px 20px",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>{label}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          background: isConnected ? C.successSubtle : C.surface,
          color: isConnected ? C.successText : C.text3,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {isConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelSt}>Quickbase URL (auto-parse)</label>
        <input
          style={inputSt}
          value={url}
          onChange={handleUrl}
          placeholder="https://awnexinc.quickbase.com/db/…?rid=…"
          spellCheck={false}
        />
        {urlMsg && (
          <p style={{ fontSize: 11, marginTop: 4, margin: "4px 0 0", color: urlOk ? C.successText : C.text3 }}>
            {urlMsg}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelSt}>Table ID</label>
          <input
            style={inputSt}
            value={settings.tableId}
            onChange={e => onUpdate("tableId", e.target.value)}
            placeholder="e.g. bkvhg2rwk"
            spellCheck={false}
          />
        </div>
        <div>
          <label style={labelSt}>Report ID</label>
          <input
            style={inputSt}
            value={settings.reportId}
            onChange={e => onUpdate("reportId", e.target.value)}
            placeholder="e.g. 1"
            spellCheck={false}
          />
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={!canSave}
        style={{
          padding: "7px 16px",
          borderRadius: T.radiusInput,
          fontSize: 12,
          fontWeight: 600,
          cursor: canSave ? "pointer" : "not-allowed",
          background: saved ? C.success : (canSave ? C.brand : C.surface),
          border: "none",
          color: canSave ? "#fff" : C.text3,
          transition: "background 300ms",
          opacity: canSave ? 1 : 0.6,
        }}
      >
        {saved ? "Saved ✓" : "Save Connection"}
      </button>
    </div>
  );
}

// ─── SETTINGS MODULE ──────────────────────────────────────────────────────────

export function SettingsModule() {
  const { themeId, setTheme, themes } = useTheme();

  const [qbSettings, setQbSettings] = useState(() =>
    Object.fromEntries(QB_MODULES.map(m => [m.id, { tableId: "", reportId: "" }]))
  );
  const [savedModules, setSavedModules] = useState({});
  const [dashTitle,    setDashTitle]    = useState(DEFAULT_DASHBOARD_TITLE);
  const [dashSubtitle, setDashSubtitle] = useState(DEFAULT_DASHBOARD_SUBTITLE);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "reset" | "clear" | null

  useEffect(() => {
    setQbSettings(
      Object.fromEntries(QB_MODULES.map(m => [m.id, loadModuleSettings(m.id)]))
    );
    setDashTitle(loadDashboardTitle());
    setDashSubtitle(loadDashboardSubtitle());
  }, []);

  function updateQbField(moduleId, field, value) {
    setQbSettings(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [field]: value },
    }));
  }

  function saveModule(moduleId) {
    const s = qbSettings[moduleId];
    saveModuleSettings(moduleId, s);
    setSavedModules(prev => ({ ...prev, [moduleId]: true }));
    setTimeout(() => {
      setSavedModules(prev => ({ ...prev, [moduleId]: false }));
    }, 2000);
  }

  function saveBranding() {
    saveDashboardTitle(dashTitle || DEFAULT_DASHBOARD_TITLE);
    saveDashboardSubtitle(dashSubtitle || DEFAULT_DASHBOARD_SUBTITLE);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2000);
  }

  function handleConfirm(action) {
    if (action === "reset") resetAllConfigs();
    if (action === "clear") clearAllData();
    setConfirmAction(null);
    if (action === "clear") {
      setQbSettings(Object.fromEntries(QB_MODULES.map(m => [m.id, { tableId: "", reportId: "" }])));
      setDashTitle(DEFAULT_DASHBOARD_TITLE);
      setDashSubtitle(DEFAULT_DASHBOARD_SUBTITLE);
    }
  }

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 880 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{ width: 4, height: 28, borderRadius: 2, background: C.brand }} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>
            Theme, Quickbase connections, dashboard branding, and data management
          </p>
        </div>
      </div>

      {/* ═══ APPEARANCE ════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader title="Appearance" />
        <p style={{ fontSize: 12, color: C.text2, marginBottom: 16, marginTop: 0 }}>
          Select a theme to apply across the entire app. The choice is saved to your browser.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
          {Object.values(themes).map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={themeId === theme.id}
              onSelect={setTheme}
            />
          ))}
        </div>
      </section>

      {/* ═══ QUICKBASE CONNECTIONS ═════════════════════════════════════════════ */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader title="Quickbase Connections" />
        <p style={{ fontSize: 12, color: C.text2, marginBottom: 16, marginTop: 0 }}>
          Configure which Quickbase table and report each module loads.{" "}
          <strong>QB_REALM</strong> and <strong>QB_TOKEN</strong> are server-side environment variables
          and are never exposed to the browser.
        </p>
        {QB_MODULES.map(m => (
          <ModuleQbCard
            key={m.id}
            moduleId={m.id}
            label={m.label}
            accent={m.accent}
            settings={qbSettings[m.id] || { tableId: "", reportId: "" }}
            onUpdate={(field, val) => updateQbField(m.id, field, val)}
            onSave={() => saveModule(m.id)}
            saved={!!savedModules[m.id]}
          />
        ))}
      </section>

      {/* ═══ DASHBOARD BRANDING ════════════════════════════════════════════════ */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader title="Dashboard Branding" />
        <div style={{
          background: C.card,
          border: `1px solid ${C.borderLight}`,
          borderRadius: T.radiusContainer,
          boxShadow: T.cardShadow,
          padding: "20px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelSt}>Dashboard Title</label>
              <input
                style={inputSt}
                value={dashTitle}
                onChange={e => setDashTitle(e.target.value)}
                placeholder={DEFAULT_DASHBOARD_TITLE}
              />
            </div>
            <div>
              <label style={labelSt}>Dashboard Subtitle</label>
              <input
                style={inputSt}
                value={dashSubtitle}
                onChange={e => setDashSubtitle(e.target.value)}
                placeholder={DEFAULT_DASHBOARD_SUBTITLE}
              />
            </div>
          </div>
          <button
            onClick={saveBranding}
            style={{
              padding: "7px 16px",
              borderRadius: T.radiusInput,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: brandingSaved ? C.success : C.brand,
              border: "none",
              color: "#fff",
              transition: "background 300ms",
            }}
          >
            {brandingSaved ? "Saved ✓" : "Save Branding"}
          </button>
        </div>
      </section>

      {/* ═══ DATA MANAGEMENT ═══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader title="Data Management" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Reset dashboard configs */}
          <div style={{
            background: C.card,
            border: `1px solid ${C.borderLight}`,
            borderRadius: T.radiusContainer,
            boxShadow: T.cardShadow,
            padding: "20px",
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 6px" }}>
              Reset Dashboard Configs
            </p>
            <p style={{ fontSize: 12, color: C.text2, margin: "0 0 16px", lineHeight: 1.5 }}>
              Resets KPI cards, charts, column order, and filters to defaults.
              Quickbase connections are kept.
            </p>
            {confirmAction === "reset" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleConfirm("reset")}
                  style={{ padding: "6px 12px", borderRadius: T.radiusInput, fontSize: 12, fontWeight: 700, cursor: "pointer", background: C.danger, border: "none", color: "#fff" }}
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  style={{ padding: "6px 12px", borderRadius: T.radiusInput, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.surface, border: `1px solid ${C.borderLight}`, color: C.text2 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAction("reset")}
                style={{ padding: "6px 14px", borderRadius: T.radiusInput, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.surface, border: `1px solid ${C.danger}`, color: C.danger }}
              >
                Reset Configs
              </button>
            )}
          </div>

          {/* Clear all data */}
          <div style={{
            background: C.card,
            border: `1px solid ${C.borderLight}`,
            borderRadius: T.radiusContainer,
            boxShadow: T.cardShadow,
            padding: "20px",
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 6px" }}>
              Clear All Data
            </p>
            <p style={{ fontSize: 12, color: C.text2, margin: "0 0 16px", lineHeight: 1.5 }}>
              Removes all stored data including QB connections, geocache, and dashboard
              configs. Cannot be undone.
            </p>
            {confirmAction === "clear" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleConfirm("clear")}
                  style={{ padding: "6px 12px", borderRadius: T.radiusInput, fontSize: 12, fontWeight: 700, cursor: "pointer", background: C.danger, border: "none", color: "#fff" }}
                >
                  Confirm Clear All
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  style={{ padding: "6px 12px", borderRadius: T.radiusInput, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.surface, border: `1px solid ${C.borderLight}`, color: C.text2 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAction("clear")}
                style={{ padding: "6px 14px", borderRadius: T.radiusInput, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.dangerSubtle, border: `1px solid ${C.danger}`, color: C.danger }}
              >
                Clear All Data
              </button>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
