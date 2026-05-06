import { ThemeSwitcher } from "./ui/ThemeSwitcher.jsx";
import { T } from "../lib/tokens.js";

// Amber accent — always hardcoded because it must show on the dark sidebar bg
const ACCENT = T.accent;

// Awnex bolt mark SVG (shown when sidebar is collapsed)
function BoltMark() {
  return (
    <svg width="26" height="25" viewBox="0 0 48 46" fill="none">
      <path fill={ACCENT} d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
    </svg>
  );
}

// Inline SVG icon renderer using Lucide-compatible path data
function SvgIcon({ path, size = 15, sw = 1.75 }) {
  const segs = path.split(' M');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {segs.map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
}

const ICON_PATHS = {
  home:       'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  shield:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  quality:    'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  alert:      'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  settings:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  production: 'M2 7h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M12 12v4 M10 14h4',
};

// ─── NAV ITEMS ─────────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: "overview",    label: "Overview",             iconKey: "home",       group: "main" },
  { id: "warranty",    label: "Warranty Operations",  iconKey: "shield",     group: "modules" },
  { id: "inspections", label: "Inspections",          iconKey: "quality",    group: "modules" },
  { id: "ncrs",        label: "Quality Intelligence", iconKey: "alert",      group: "modules" },
  { id: "capas",       label: "Field Execution",      iconKey: "settings",   group: "modules" },
  { id: "production",  label: "Production Analytics", iconKey: "production", group: "modules" },
  { id: "dispatch",    label: "Dispatch Planning",   iconKey: "settings",   group: "modules" },
];

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────

export function QMSSidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }) {
  return (
    <aside style={{
      width: collapsed ? 52 : 200,
      minWidth: collapsed ? 52 : 200,
      background: T.sidebar,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '0 6px',
      transition: 'width 0.22s ease, min-width 0.22s ease',
      overflow: 'hidden',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* ── Logo — always centered ─────────────────────────────────────────── */}
      <div style={{
        padding: '16px 0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {collapsed
          ? <BoltMark />
          : <img
              src="/awnex-logo-no-tag.png"
              alt="Awnex"
              style={{ width: 156, filter: 'brightness(0) invert(1)', objectFit: 'contain', display: 'block' }}
            />
        }
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px 8px', flexShrink: 0 }} />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              title={collapsed ? item.label : ''}
              style={{
                fontFamily: 'inherit',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 5,
                padding: collapsed ? '9px 0' : '9px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10,
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left',
                width: '100%',
                background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'background 0.12s, color 0.12s',
                position: 'relative',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              {/* Amber accent strip for active item */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  background: ACCENT,
                  borderRadius: '0 3px 3px 0',
                }} />
              )}
              <SvgIcon
                path={ICON_PATHS[item.iconKey] || ICON_PATHS.home}
                size={15}
                sw={isActive ? 2 : 1.75}
              />
              {!collapsed && item.label}
            </button>
          );
        })}
      </div>

      {/* ── Footer: theme switcher + collapse strip ────────────────────────── */}
      <div style={{ padding: '10px 0 18px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px 8px' }} />

        {/* Theme switcher in sidebar footer */}
        <ThemeSwitcher variant="sidebar" collapsed={collapsed} />

        {/* Collapse toggle — double-arrow strip */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            fontFamily: 'inherit',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 5,
            padding: '6px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            width: '100%',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'background 0.12s, color 0.12s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <><path d="M13 17l5-5-5-5"/><path d="M6 17l5-5-5-5"/></>
              : <><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></>
            }
          </svg>
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
