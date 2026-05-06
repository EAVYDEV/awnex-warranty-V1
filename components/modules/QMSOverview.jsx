import { colors, shadows } from "../../lib/tokens.js";

const C = colors;

const HERO_GRADIENT = "linear-gradient(115deg, var(--t-brand-deep) 0%, var(--t-brand) 60%, var(--t-brand-light) 100%)";

function StatChip({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: 6, padding: "12px 18px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.borderLight}`,
      borderRadius: 12,
      padding: "20px 22px",
      boxShadow: shadows.card,
      borderLeft: `4px solid ${accent}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: C.text1, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.text2, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ModuleCard({ title, description, status, onClick, accentColor, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: C.card,
        border: `1px solid ${C.borderLight}`,
        borderRadius: 12,
        padding: "20px",
        boxShadow: shadows.card,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "box-shadow 150ms, border-color 150ms",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = shadows.elevated; e.currentTarget.style.borderColor = accentColor; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = shadows.card; e.currentTarget.style.borderColor = C.borderLight; }}
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
              color: status === "live" ? C.successText : C.text3,
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

// ─── QMS OVERVIEW ─────────────────────────────────────────────────────────────

export function QMSOverview({ onNavigate }) {
  const modules = [
    {
      id: "warranty",
      title: "Warranty Operations",
      description: "Track active warranties, claim risk scores, and expiration timelines across all Awnex orders.",
      accentColor: C.brand,
      status: "live",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      id: "inspections",
      title: "Inspections",
      description: "QC inspection records, pass/fail rates, inspector assignments, and defect tracking per production run.",
      accentColor: 'var(--t-teal)',
      status: "configure",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
    },
    {
      id: "ncrs",
      title: "Quality Intelligence",
      description: "Log, investigate, and resolve non-conforming product events with root-cause analysis and disposition tracking.",
      accentColor: C.danger,
      status: "configure",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
    {
      id: "capas",
      title: "Field Execution",
      description: "Full CAPA lifecycle — initiation, root-cause, action items, verification, and closure with on-time tracking.",
      accentColor: 'var(--t-purple)',
      status: "configure",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
    },
    {
      id: "production",
      title: "Production Analytics",
      description: "Monitor production runs, batch quality metrics, yield rates, and line-level defect counts.",
      accentColor: C.warningText,
      status: "configure",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
    },
    {
      id: "dispatch",
      title: "Dispatch Planning",
      description: "Blend installation and service work orders to plan and optimize technician field trips.",
      accentColor: 'var(--t-teal)',
      status: "configure",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px 24px 48px", maxWidth: 1200 }}>

      {/* Hero Banner */}
      <div style={{ background: HERO_GRADIENT, borderRadius: 13, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ position: "absolute", right: 180, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
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
          <StatChip label="Live" value="1" sub="Warranty connected" />
          <StatChip label="Status" value="Active" sub={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        <KpiCard label="Active Warranties" value="—" sub="Connect Warranty module" accent={C.brand}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
        />
        <KpiCard label="Open NCRs" value="—" sub="Connect NCR module" accent={C.danger}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <KpiCard label="Open CAPAs" value="—" sub="Connect CAPA module" accent={'var(--t-purple)'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
        />
        <KpiCard label="Inspections (MTD)" value="—" sub="Connect Inspections module" accent={'var(--t-teal)'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
        />
        <KpiCard label="Yield Rate" value="—" sub="Connect Production module" accent={C.warningText}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      {/* Module cards */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
          Modules
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          {modules.map((m) => (
            <ModuleCard
              key={m.id}
              title={m.title}
              description={m.description}
              status={m.status}
              accentColor={m.accentColor}
              icon={m.icon}
              onClick={() => onNavigate(m.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
