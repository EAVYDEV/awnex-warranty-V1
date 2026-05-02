import { AwnexLogo } from "./AwnexLogo.jsx";

// ─── SIDEBAR DESIGN TOKENS ────────────────────────────────────────────────────

const S = {
  bg:           "#FFFFFF",
  border:       "#F1F5F9",
  labelColor:   "#94A3B8",
  inactiveText: "#64748B",
  inactiveIcon: "#94A3B8",
  activeText:   "#0F172A",
  activeBrand:  "#1D4ED8",
  activeBg:     "#EFF6FF",
  hoverBg:      "#F8FAFC",
  cardBg:       "#0F172A",
  cardAccent:   "#1D4ED8",
};

const TRANSITION = "180ms cubic-bezier(0.2,0,0,1)";

// ─── ICONS ────────────────────────────────────────────────────────────────────

function IconOverview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}

function IconWarranty() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconInspections() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}

function IconNCR() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconCAPA() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/>
      <path d="M5 12H2a10 10 0 1020 0h-3"/>
      <polyline points="12 7 12 2 17 7"/>
    </svg>
  );
}

function IconProduction() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}

function IconPanelLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: "overview",    label: "Overview",           icon: IconOverview,    group: "menu"    },
  { id: "warranty",    label: "Warranty",           icon: IconWarranty,    group: "modules" },
  { id: "inspections", label: "Inspections",        icon: IconInspections, group: "modules" },
  { id: "ncrs",        label: "Non-Conformances",   icon: IconNCR,         group: "modules" },
  { id: "capas",       label: "Corrective Actions", icon: IconCAPA,        group: "modules" },
  { id: "production",  label: "Production",         icon: IconProduction,  group: "modules" },
];

const GROUPS = [
  { key: "menu",    label: "MENU"    },
  { key: "modules", label: "MODULES" },
];

// ─── NAV ITEM ─────────────────────────────────────────────────────────────────

function NavItem({ item, isActive, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: collapsed ? "11px 0" : "11px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        marginBottom: 2,
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? S.activeBg : "transparent",
        color: isActive ? S.activeText : S.inactiveText,
        fontSize: 14,
        fontWeight: isActive ? 600 : 400,
        textAlign: "left",
        transition: `background ${TRANSITION}, color ${TRANSITION}`,
        outline: "none",
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = S.hoverBg; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Left accent bar */}
      <span style={{
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 3,
        height: isActive ? "60%" : 0,
        borderRadius: "0 3px 3px 0",
        background: S.activeBrand,
        transition: `height ${TRANSITION}`,
        flexShrink: 0,
      }} />

      {/* Icon */}
      <span style={{
        flexShrink: 0,
        display: "flex",
        color: isActive ? S.activeBrand : S.inactiveIcon,
        transition: `color ${TRANSITION}`,
      }}>
        <Icon />
      </span>

      {/* Label */}
      <span style={{
        overflow: "hidden",
        opacity: collapsed ? 0 : 1,
        maxWidth: collapsed ? 0 : 180,
        whiteSpace: "nowrap",
        transition: `opacity ${TRANSITION}, max-width ${TRANSITION}`,
      }}>
        {item.label}
      </span>
    </button>
  );
}

// ─── BOTTOM CARD ──────────────────────────────────────────────────────────────

function QuickConnectCard({ collapsed }) {
  return (
    <div style={{
      margin: collapsed ? "12px 8px" : "12px",
      borderRadius: 16,
      background: S.cardBg,
      padding: collapsed ? "14px 0" : "20px 16px",
      overflow: "hidden",
      transition: `padding ${TRANSITION}`,
      display: "flex",
      flexDirection: "column",
      alignItems: collapsed ? "center" : "flex-start",
    }}>
      {/* Icon always shown */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "rgba(29,78,216,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#93C5FD",
        marginBottom: collapsed ? 0 : 12,
        flexShrink: 0,
      }}>
        <IconSettings />
      </div>

      {/* Text + button — fade out when collapsed */}
      <div style={{
        overflow: "hidden",
        opacity: collapsed ? 0 : 1,
        maxHeight: collapsed ? 0 : 120,
        transition: `opacity ${TRANSITION}, max-height ${TRANSITION}`,
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}>
          Connect <span style={{ color: "#93C5FD" }}>Quickbase</span>
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>
          Link your reports to each QMS module
        </p>
        <button style={{
          width: "100%",
          padding: "9px 0",
          borderRadius: 10,
          border: "none",
          background: S.cardAccent,
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}>
          Configure QB
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

export function QMSSidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }) {
  const W = collapsed ? 72 : 256;

  return (
    <aside style={{
      width: W,
      minWidth: W,
      maxWidth: W,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: S.bg,
      borderRight: `1px solid ${S.border}`,
      display: "flex",
      flexDirection: "column",
      transition: `width ${TRANSITION}, min-width ${TRANSITION}, max-width ${TRANSITION}`,
      overflow: "hidden",
      flexShrink: 0,
      zIndex: 100,
      boxShadow: "1px 0 0 #F1F5F9",
    }}>

      {/* ── Logo header ────────────────────────────────────────────────────── */}
      <div style={{
        height: 70,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <AwnexLogo height={30} />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            position: "absolute",
            right: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: S.inactiveIcon,
            cursor: "pointer",
            transition: `background ${TRANSITION}, opacity ${TRANSITION}`,
            opacity: collapsed ? 0.5 : 0.4,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = S.hoverBg;
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.opacity = collapsed ? "0.5" : "0.4";
          }}
        >
          <IconPanelLeft />
        </button>
      </div>

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav style={{
        flex: 1,
        padding: "4px 10px 10px",
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        {GROUPS.map(({ key, label }) => {
          const items = NAV_ITEMS.filter(i => i.group === key);
          return (
            <div key={key} style={{ marginBottom: 8 }}>
              {/* Section label */}
              <div style={{
                overflow: "hidden",
                opacity: collapsed ? 0 : 1,
                maxHeight: collapsed ? 0 : 32,
                transition: `opacity ${TRANSITION}, max-height ${TRANSITION}`,
              }}>
                <p style={{
                  margin: "14px 0 6px 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: S.labelColor,
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                }}>
                  {label}
                </p>
              </div>

              {items.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeModule === item.id}
                  collapsed={collapsed}
                  onClick={() => onModuleChange(item.id)}
                />
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom card ────────────────────────────────────────────────────── */}
      <QuickConnectCard collapsed={collapsed} />
    </aside>
  );
}
