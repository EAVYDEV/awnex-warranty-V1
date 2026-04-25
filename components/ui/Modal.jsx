import { useEffect } from "react";
import { T } from "../../lib/tokens.js";
import { Icon } from "./Icon.jsx";

// ─── GENERIC MODAL WRAPPER ────────────────────────────────────────────────────
// Reusable across all Awntrak modules. Handles backdrop, close-on-outside-click,
// Escape key dismissal, and scroll-lock on the body.

export function Modal({ title, subtitle, onClose, footer, children, width = 520, zIndex = 1000 }) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape key closes modal
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex,
        background: "rgba(7,36,74,0.50)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.bgCard,
        borderRadius: 16,
        width: "100%",
        maxWidth: width,
        boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.brandDarkest, margin: 0 }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: 12, color: T.textSec, margin: "3px 0 0" }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: T.textMuted, padding: 4, borderRadius: 6,
              lineHeight: 0, flexShrink: 0,
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 4px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: "14px 24px",
            borderTop: `1px solid ${T.border}`,
            background: "#FAFAF8",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED FORM STYLES ───────────────────────────────────────────────────────
// Export so editors can stay consistent without re-defining styles.

export const formStyles = {
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: T.textSec,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "8px 11px",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    fontSize: 13,
    color: T.text,
    background: T.bgApp,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "8px 11px",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    fontSize: 13,
    color: T.text,
    background: T.bgCard,
    cursor: "pointer",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  section: {
    marginBottom: 20,
  },
  row: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  hint: {
    fontSize: 11,
    color: T.textMuted,
    marginTop: 4,
  },
};

// ─── BUTTON VARIANTS ──────────────────────────────────────────────────────────

export function Btn({ onClick, disabled, variant = "ghost", children, style = {} }) {
  const base = {
    padding: "8px 16px", borderRadius: 8, fontSize: 13,
    fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", display: "inline-flex", alignItems: "center", gap: 6,
    transition: "background 0.15s", opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit", ...style,
  };
  const variants = {
    primary: { background: T.brand,     color: T.white  },
    danger:  { background: T.danger,    color: T.white  },
    ghost:   { background: T.bgCard,    color: T.textSec, border: `1px solid ${T.border}` },
    subtle:  { background: T.bgApp,     color: T.textSec, border: `1px solid ${T.border}` },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}
