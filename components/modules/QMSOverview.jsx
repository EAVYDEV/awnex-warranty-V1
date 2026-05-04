import { colors } from "../../lib/tokens.js";

const C = colors;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.borderLight}`,
      borderRadius: 12,
      padding: "20px 22px",
      boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
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
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "box-shadow 150ms, border-color 150ms",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,23,42,0.10)"; e.currentTarget.style.borderColor = accentColor; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.06)"; e.currentTarget.style.borderColor = C.borderLight; }}
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
              background: status === "live" ? C.successSubtle : "#F1F5F9",
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
      accentColor: "#0891B2",
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
      accentColor: "#DC2626",
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
      title: "Field Execution (CAPA)",
      description: "Full CAPA lifecycle — initiation, root-cause, action items, verification, and closure with on-time tracking.",
      accentColor: "#7C3AED",
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
      accentColor: "#D97706",
      status: "configure",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: C.brand }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text1, margin: 0 }}>
            Quality Management System
          </h1>
        </div>
        <p style={{ fontSize: 14, color: C.text2, margin: 0, paddingLeft: 14 }}>
          Awnex Manufacturing QMS — select a module below to get started
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        <KpiCard label="Active Warranties" value="—" sub="Connect Warranty module" accent={C.brand}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
        />
        <KpiCard label="Open NCRs" value="—" sub="Connect NCR module" accent="#DC2626"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <KpiCard label="Open CAPAs" value="—" sub="Connect CAPA module" accent="#7C3AED"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
        />
        <KpiCard label="Inspections (MTD)" value="—" sub="Connect Inspections module" accent="#0891B2"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
        />
        <KpiCard label="Yield Rate" value="—" sub="Connect Production module" accent="#D97706"
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
