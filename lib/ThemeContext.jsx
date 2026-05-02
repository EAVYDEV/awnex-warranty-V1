import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEMES, DEFAULT_THEME } from './themes.js';

const ThemeContext = createContext(null);

function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme || typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
  });
  root.setAttribute('data-theme', themeId);
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);

  // Apply saved theme on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('awntrak_theme');
    const id = saved && THEMES[saved] ? saved : DEFAULT_THEME;
    setThemeId(id);
    applyTheme(id);
  }, []);

  const setTheme = useCallback((id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    applyTheme(id);
    localStorage.setItem('awntrak_theme', id);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
