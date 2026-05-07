import { ThemeSwitcher } from "./ui/ThemeSwitcher.jsx";
import { T } from "../lib/tokens.js";
import { getModules } from "../lib/moduleRegistry.js";
import { MODULE_ICON_PATHS, SvgIcon } from "./ui/ModuleShared.jsx";

const ACCENT = T.accent;

function BoltMark() {
  return (
    <svg width="26" height="25" viewBox="0 0 48 46" fill="none">
      <path fill={ACCENT} d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
    </svg>
  );
}

export function QMSSidebar({ activeModule, onModuleChange, collapsed, onToggleCollapse }) {
  const navItems = getModules();

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

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {collapsed
          ? <BoltMark />
          : <img src="/awnex-logo-no-tag.png" alt="Awnex" style={{ width: 156, filter: 'brightness(0) invert(1)', objectFit: 'contain', display: 'block' }} />
        }
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px 8px', flexShrink: 0 }} />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => {
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
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, background: ACCENT, borderRadius: '0 3px 3px 0',
                }} />
              )}
              <SvgIcon
                path={MODULE_ICON_PATHS[item.iconKey] || MODULE_ICON_PATHS.home}
                size={15}
                sw={isActive ? 2 : 1.75}
              />
              {!collapsed && item.label}
            </button>
          );
        })}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 0 18px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px 8px' }} />

        <ThemeSwitcher variant="sidebar" collapsed={collapsed} />

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            fontFamily: 'inherit', border: 'none', cursor: 'pointer', borderRadius: 5,
            padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 5, width: '100%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', transition: 'background 0.12s, color 0.12s',
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
