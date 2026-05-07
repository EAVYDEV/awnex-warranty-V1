// Shared primitives used by every QMS module page.
// Import what you need — nothing is rendered unless explicitly used.
import { colors, shadows } from "../../lib/tokens.js";

const C = colors;

export const HERO_GRADIENT =
  "linear-gradient(115deg, var(--t-brand-deep) 0%, var(--t-brand) 60%, var(--t-brand-light) 100%)";

// SVG path data for sidebar + overview module icons.
// Add new keys here as needed when creating new modules.
export const MODULE_ICON_PATHS = {
  home:       "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  shield:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  checklist:  "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  alert:      "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  gear:       "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  factory:    "M2 7h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M12 12v4 M10 14h4",
  clock:      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
};

// Renders a Lucide-compatible SVG icon from path data.
// Multiple paths in one string are separated by " M".
export function SvgIcon({ path, size = 15, sw = 1.75 }) {
  const segs = path.split(" M");
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    >
      {segs.map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

// Frosted-glass stat chip used in the hero banner.
export function StatChip({ label, value, sub }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(10px)",
      borderRadius: 6,
      padding: "12px 18px",
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.15)",
    }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

// Simple KPI card used by module pages (not the configurable dashboard KPI).
export function ModuleKpiCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.borderLight}`,
      borderRadius: 6,
      padding: "14px 16px",
      boxShadow: shadows.card,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0, lineHeight: 1.35 }}>{label}</p>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: accent, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
        {sub && <p style={{ fontSize: 11.5, color: C.text3, margin: "4px 0 0", fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
  );
}

// Full-width gradient hero banner. Pass StatChip children or nav-pill buttons as children.
//   chips    — array of { label, value, sub } rendered on the right as StatChips
//   children — optional nav-pill buttons rendered below the subtitle
export function HeroBanner({ title, subtitle, chips = [], children }) {
  return (
    <div style={{
      background: HERO_GRADIENT,
      borderRadius: 13,
      padding: "24px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      marginBottom: 20,
    }}>
      <div style={{ position: "absolute", right: 180, top: -30,  width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", right: 220, bottom: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500, maxWidth: 420, margin: "6px 0 0" }}>{subtitle}</p>
        )}
        {children && (
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>{children}</div>
        )}
      </div>

      {chips.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {chips.map(c => <StatChip key={c.label} label={c.label} value={c.value} sub={c.sub} />)}
        </div>
      )}
    </div>
  );
}

// "Showing sample data" banner shown when a module has no QB connection configured.
export function ConnectBanner({ accent = "var(--t-brand)", message, onSettings }) {
  return (
    <div style={{
      background: accent + "12",
      border: `1px dashed ${accent}`,
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>Showing sample data</p>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>
          {message || "Connect a Quickbase report to load live data."}
        </p>
      </div>
      <button
        onClick={onSettings}
        style={{
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          background: accent,
          border: "none",
          color: "#fff",
        }}
      >
        Connect QB Report
      </button>
    </div>
  );
}
