import { colors, shadows } from "../../lib/tokens.js";
import { registerModule } from "../../lib/moduleRegistry.js";
import { getModules } from "../../lib/moduleRegistry.js";
import { StatChip, SvgIcon, MODULE_ICON_PATHS } from "../ui/ModuleShared.jsx";

const C = colors;
const HERO_GRADIENT = "linear-gradient(115deg, var(--t-brand-deep) 0%, var(--t-brand) 60%, var(--t-brand-light) 100%)";

function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 6,
      padding: "14px 16px", boxShadow: shadows.card, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.35 }}>{label}</span>
        <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.text3, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ModuleCard({ title, description, status, onClick, accentColor, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12,
        padding: "20px", boxShadow: shadows.card, cursor: "pointer", textAlign: "left",
        width: "100%", transition: "box-shadow 150ms, border-color 150ms", fontFamily: "inherit",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = shadows.elevated; e.currentTarget.style.borderColor = accentColor; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = shadows.card;    e.currentTarget.style.borderColor = C.borderLight; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: accentColor + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accentColor, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>{title}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
              background: status === "live" ? C.successSubtle : C.surfaceWarm,
              color:      status === "live" ? C.successText  : C.text3,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {status === "live" ? "Live" : "Connect QB"}
            </span>
          </div>
          <p style={{ fontSize: 12, color: C.text2, margin: 0, lineHeight: 1.4 }}>{description}</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  );
}

export function QMSOverview({ onNavigate }) {
  // Exclude the overview module itself from the cards list
  const modules     = getModules().filter(m => m.id !== "overview");
  const liveCount   = modules.filter(m => m.overviewStatus === "live").length;

  return (
    <div style={{ padding: "20px 24px 48px" }}>

      {/* Hero Banner */}
      <div style={{ background: HERO_GRADIENT, borderRadius: 13, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ position: "absolute", right: 180, top: -30,   width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", right: 220, bottom: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: 0 }}>Quality Management System</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500, maxWidth: 420, margin: "6px 0 0" }}>Awnex Manufacturing QMS — unified visibility across all operations.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "#fff", color: "var(--t-brand)" }}>Overview</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <StatChip label="Modules" value={String(modules.length)} sub="Total available" />
          <StatChip label="Live"    value={String(liveCount)}       sub={liveCount === 1 ? "Warranty connected" : `${liveCount} connected`} />
          <StatChip label="Status"  value="Active" sub={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
        </div>
      </div>

      {/* KPI strip — placeholders until modules provide live data */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        <KpiCard label="Active Warranties" value="—" sub="Connect Warranty module" accent={C.brand}
          icon={<SvgIcon path={MODULE_ICON_PATHS.shield} size={16} />}
        />
        <KpiCard label="Open NCRs" value="—" sub="Connect NCR module" accent={C.danger}
          icon={<SvgIcon path={MODULE_ICON_PATHS.alert} size={16} />}
        />
        <KpiCard label="Open CAPAs" value="—" sub="Connect CAPA module" accent="var(--t-purple)"
          icon={<SvgIcon path={MODULE_ICON_PATHS.gear} size={16} />}
        />
        <KpiCard label="Inspections (MTD)" value="—" sub="Connect Inspections module" accent="var(--t-teal)"
          icon={<SvgIcon path={MODULE_ICON_PATHS.checklist} size={16} />}
        />
        <KpiCard label="Yield Rate" value="—" sub="Connect Production module" accent={C.warningText}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      {/* Module cards — auto-populated from the registry */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
          Modules
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          {modules.map(m => (
            <ModuleCard
              key={m.id}
              title={m.label}
              description={m.description}
              status={m.overviewStatus}
              accentColor={m.accentColor}
              icon={<SvgIcon path={MODULE_ICON_PATHS[m.iconKey] || MODULE_ICON_PATHS.home} size={18} />}
              onClick={() => onNavigate(m.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

registerModule({
  id:             "overview",
  label:          "Overview",
  iconKey:        "home",
  group:          "main",
  component:      QMSOverview,
  accentColor:    colors.brand,
  description:    "System-wide overview of all QMS modules and live status.",
  overviewStatus: "live",
});
