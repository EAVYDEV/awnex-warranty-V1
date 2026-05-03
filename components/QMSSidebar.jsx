import { useState } from "react";
import { AwnexLogo } from "./AwnexLogo.jsx";
import { colors } from "../lib/tokens.js";
import { ThemeSwitcher } from "./ui/ThemeSwitcher.jsx";

const C = colors;

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

function IconOverview() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function IconWarranty() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconInspections() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}

function IconNCR() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconCAPA() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}

function IconProduction() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

// ─── NAV ITEMS CONFIG ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: "overview",    label: "Overview",             icon: IconOverview,    group: "main" },
  { id: "warranty",    label: "Warranty",             icon: IconWarranty,    group: "modules" },
  { id: "inspections", label: "Inspections",          icon: IconInspections, group: "modules" },
  { id: "ncrs",        label: "Non-Conformances",     icon: IconNCR,         group: "modules" },
  { id: "capas",       label: "Corrective Actions",   icon: IconCAPA,        group: "modules" },
  { id: "production",  label: "Production",           icon: IconProduction,  group: "modules" },
];

const GROUP_LABELS = {
  main:    null,
  modules: "MODULES",
};

// ─── SIDEBAR COMPONENT ────────────────────────────────────────────────────────

export function QMSSidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }) {
  const W = collapsed ? 64 : 240;

  const groups = ["main", "modules"];

  return (
    <aside style={{
      width: W,
      minWidth: W,
      maxWidth: W,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 200ms cubic-bezier(0.2,0,0,1), min-width 200ms cubic-bezier(0.2,0,0,1), max-width 200ms cubic-bezier(0.2,0,0,1)",
      overflow: "hidden",
      flexShrink: 0,
      zIndex: 100,
    }}>

      {/* ── Logo area ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? "16px 0" : "16px 16px",
        borderBottom: `1px solid ${C.sidebarBorder}`,
        display: "flex",
        flexDirection: "column",
        alignItems: collapsed ? "center" : "flex-start",
        gap: 6,
        minHeight: 72,
        justifyContent: "center",
      }}>
        <AwnexLogo height={28} />
        {!collapsed && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
              Quality Management
            </div>
            <div style={{ fontSize: 10, color: C.sidebarMuted, fontWeight: 500, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Awnex QMS Platform
            </div>
          </div>
        )}
      </div>

      {/* ── Nav items ──────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {groups.map((group) => {
          const items = NAV_ITEMS.filter(i => i.group === group);
          const label = GROUP_LABELS[group];
          return (
            <div key={group} style={{ marginBottom: 4 }}>
              {!collapsed && label && (
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.sidebarMuted,
                  letterSpacing: "0.1em",
                  padding: "10px 8px 4px",
                }}>
                  {label}
                </div>
              )}
              {collapsed && label && <div style={{ height: 12 }} />}
              {items.map((item) => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onModuleChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: collapsed ? "9px 0" : "9px 10px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      marginBottom: 2,
                      justifyContent: collapsed ? "center" : "flex-start",
                      background: isActive ? C.sidebarActive : "transparent",
                      color: isActive ? "#FFFFFF" : C.sidebarText,
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      transition: "background 150ms, color 150ms",
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.sidebarHover; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                      <Icon />
                    </span>
                    {!collapsed && (
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Footer: theme switcher + collapse toggle ───────────────────────── */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.sidebarBorder}` }}>
        <ThemeSwitcher variant="sidebar" collapsed={collapsed} />
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: collapsed ? "8px 0" : "8px 10px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: C.sidebarMuted,
            cursor: "pointer",
            fontSize: 12,
            transition: "background 150ms",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.sidebarHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 200ms", display: "flex" }}>
            <IconChevron />
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
