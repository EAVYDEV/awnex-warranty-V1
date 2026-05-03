import { useState } from 'react';
import { useTheme } from '../../lib/ThemeContext.jsx';
import { THEMES, THEME_SWATCHES } from '../../lib/themes.js';
import { colors, T } from '../../lib/tokens.js';

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

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ─── SIDEBAR VARIANT ──────────────────────────────────────────────────────────
// Dark background, sidebar token colors, dropdown opens upward.

function SidebarThemeSwitcher({ collapsed }) {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const btnStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: 8,
    padding: collapsed ? '8px 0' : '8px 10px',
    borderRadius: T.radiusInput,
    border: 'none',
    background: open ? colors.sidebarHover : 'transparent',
    color: colors.sidebarMuted,
    cursor: 'pointer',
    fontSize: 12,
    transition: 'background 150ms',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  };

  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <button
        style={btnStyle}
        onClick={() => setOpen(v => !v)}
        title={collapsed ? `Theme: ${THEMES[themeId].name}` : 'Switch theme'}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = colors.sidebarHover; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: THEME_SWATCHES[themeId],
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: '0 0 0 2px rgba(255,255,255,0.15)',
        }} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>Theme</span>
            <span style={{ opacity: 0.5, fontSize: 10, marginLeft: 'auto' }}>▲</span>
          </>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: collapsed ? '100%' : 0,
            marginBottom: collapsed ? 0 : 6,
            marginLeft: collapsed ? 8 : 0,
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: T.radiusItem,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
            minWidth: 140,
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Theme
            </div>
            {Object.values(THEMES).map(theme => {
              const isActive = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => { setTheme(theme.id); setOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: 'none',
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: isActive ? '#F1F5F9' : '#CBD5E1',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: THEME_SWATCHES[theme.id],
                    flexShrink: 0,
                    boxShadow: isActive ? `0 0 0 2px rgba(255,255,255,0.3)` : 'none',
                  }} />
                  {theme.name}
                  {isActive && (
                    <span style={{ marginLeft: 'auto', color: THEME_SWATCHES[theme.id] }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── DEFAULT VARIANT ──────────────────────────────────────────────────────────
// Light-surface button for use in AppHeader; dropdown opens downward.

function DefaultThemeSwitcher() {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Switch theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: T.radiusInput,
          border: `1px solid ${colors.borderLight}`,
          background: colors.surface,
          color: colors.text2,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          transition: 'background 120ms, border-color 120ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = colors.surfaceWarm; }}
        onMouseLeave={e => { e.currentTarget.style.background = colors.surface; }}
      >
        <span style={{ color: colors.text3, display: 'flex' }}>
          <PaletteIcon />
        </span>
        <span>{THEMES[themeId].name}</span>
        <span style={{ opacity: 0.45, fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            background: colors.card,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: T.radiusItem,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            minWidth: 148,
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 12px 6px', fontSize: 10, fontWeight: 700, color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Theme
            </div>
            {Object.values(THEMES).map(theme => {
              const isActive = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => { setTheme(theme.id); setOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: 'none',
                    background: isActive ? colors.brandSubtle : 'transparent',
                    color: isActive ? colors.brand : colors.text1,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = colors.surface; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: THEME_SWATCHES[theme.id],
                    flexShrink: 0,
                    boxShadow: isActive ? `0 0 0 2px ${colors.brandSoft}` : 'none',
                  }} />
                  {theme.name}
                  {isActive && (
                    <span style={{ marginLeft: 'auto', color: colors.brand }}>
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── PUBLIC EXPORT ────────────────────────────────────────────────────────────

export function ThemeSwitcher({ variant = 'default', collapsed = false }) {
  if (variant === 'sidebar') return <SidebarThemeSwitcher collapsed={collapsed} />;
  return <DefaultThemeSwitcher />;
}
