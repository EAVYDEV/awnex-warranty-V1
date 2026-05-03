import { useState } from 'react';
import { useTheme } from '../../lib/ThemeContext.jsx';
import { THEMES } from '../../lib/themes.js';
import { colors } from '../../lib/tokens.js';

function PaletteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

function themeCardStyle(theme, isActive, hovered) {
  const v = theme.vars;
  return {
    width: '100%',
    borderRadius: 12,
    border: `1px solid ${isActive ? v['--t-brand'] : hovered ? v['--t-border-mid'] : v['--t-border']}`,
    background: hovered && !isActive ? v['--t-surface'] : v['--t-card'],
    padding: 10,
    cursor: 'pointer',
    boxShadow: isActive ? `0 0 0 2px ${v['--t-brand-soft']}` : 'none',
    textAlign: 'left',
    transition: 'background 120ms, border-color 120ms',
  };
}

function ThemePreview({ theme, isActive, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const v = theme.vars;
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={themeCardStyle(theme, isActive, hovered)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: v['--t-text1'] }}>{theme.name}</span>
        {isActive && <span style={{ fontSize: 10, fontWeight: 700, color: v['--t-brand'] }}>ACTIVE</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        <span style={{ height: 12, borderRadius: 99, background: v['--t-brand'] }} />
        <span style={{ height: 12, borderRadius: 99, background: v['--t-accent'] }} />
        <span style={{ height: 12, borderRadius: 99, background: v['--t-success'] }} />
        <span style={{ height: 12, borderRadius: 99, background: v['--t-warning'] }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 6, marginTop: 8 }}>
        <span style={{ height: 20, borderRadius: 6, background: v['--t-sidebar'] }} />
        <span style={{ height: 20, borderRadius: 6, background: v['--t-bg'], border: `1px solid ${v['--t-border']}` }} />
      </div>
    </button>
  );
}

// sidebarCollapsed: when true the menu opens to the right of the narrow sidebar rail instead of above/below.
function ThemeMenu({ themeId, setTheme, onClose, position = 'bottom', sidebarCollapsed = false }) {
  const positionStyle = position === 'top'
    ? {
        bottom: '100%',
        left: sidebarCollapsed ? '100%' : 0,
        marginBottom: sidebarCollapsed ? 0 : 6,
        marginLeft: sidebarCollapsed ? 8 : 0,
      }
    : {
        top: '100%',
        right: 0,
        marginTop: 8,
      };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={onClose} />
      <div style={{
        position: 'absolute',
        ...positionStyle,
        width: 248,
        background: 'var(--t-card)',
        border: '1px solid var(--t-border)',
        borderRadius: 14,
        boxShadow: 'var(--t-shadow-card)',
        zIndex: 1000,
        padding: 10,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t-text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Visual Themes
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {Object.values(THEMES).map(theme => (
            <ThemePreview
              key={theme.id}
              theme={theme}
              isActive={theme.id === themeId}
              onSelect={() => { setTheme(theme.id); onClose(); }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function SidebarThemeSwitcher({ collapsed }) {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <button
        title={collapsed ? `Theme: ${THEMES[themeId].name}` : 'Switch theme'}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 8, padding: collapsed ? '8px 0' : '8px 10px', borderRadius: 10, border: '1px solid transparent',
          background: open ? colors.sidebarHover : 'transparent', color: colors.sidebarMuted, cursor: 'pointer', fontSize: 12,
        }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = colors.sidebarHover; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? colors.sidebarHover : 'transparent'; }}
      >
        <span style={{ color: colors.sidebarText, display: 'flex' }}><PaletteIcon /></span>
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{THEMES[themeId].name} Theme</span>
            <span style={{ opacity: 0.5, fontSize: 10 }}>{open ? '▲' : '▼'}</span>
          </>
        )}
      </button>
      {open && <ThemeMenu themeId={themeId} setTheme={setTheme} onClose={() => setOpen(false)} position="top" sidebarCollapsed={collapsed} />}
    </div>
  );
}

function DefaultThemeSwitcher() {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Switch theme"
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 10,
          border: `1px solid ${colors.borderLight}`, background: colors.card, color: colors.text2, cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = colors.surfaceWarm; }}
        onMouseLeave={e => { e.currentTarget.style.background = colors.card; }}
      >
        <span style={{ color: colors.text3, display: 'flex' }}><PaletteIcon /></span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{THEMES[themeId].name} Theme</span>
        <span style={{ opacity: 0.45, fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <ThemeMenu themeId={themeId} setTheme={setTheme} onClose={() => setOpen(false)} position="bottom" />}
    </div>
  );
}

export function ThemeSwitcher({ variant = 'default', collapsed = false }) {
  if (variant === 'sidebar') return <SidebarThemeSwitcher collapsed={collapsed} />;
  return <DefaultThemeSwitcher />;
}
