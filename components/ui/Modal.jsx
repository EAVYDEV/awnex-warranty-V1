import { useEffect } from "react";
import { T } from "../../lib/tokens.js";
import { Icon } from "./Icon.jsx";

export function Modal({ title, subtitle, onClose, footer, children, width = 520, zIndex = 1000 }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

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
        background: T.card,
        borderRadius: T.radiusCard,
        width: "100%",
        maxWidth: width,
        boxShadow: T.overlayShadow,
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: `1px solid ${T.borderLight}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.brandDeep, margin: 0 }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: 12, color: T.text2, margin: "3px 0 0" }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: T.text3, padding: 4, borderRadius: T.radiusInput,
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
            borderTop: `1px solid ${T.borderLight}`,
            background: T.surface,
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

export const formStyles = {
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: T.text2,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "8px 11px",
    borderRadius: T.radiusWidget,
    border: `1px solid ${T.borderLight}`,
    fontSize: 13,
    color: T.text1,
    background: T.bg,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "8px 11px",
    borderRadius: T.radiusWidget,
    border: `1px solid ${T.borderLight}`,
    fontSize: 13,
    color: T.text1,
    background: T.card,
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
    color: T.text3,
    marginTop: 4,
  },
};

export function Btn({ onClick, disabled, variant = "ghost", children, style = {} }) {
  const base = {
    padding: "8px 16px", borderRadius: T.radiusContainer, fontSize: 13,
    fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", display: "inline-flex", alignItems: "center", gap: 6,
    transition: "background 0.15s", opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit", ...style,
  };
  const variants = {
    primary: { background: T.brand,   color: T.card   },
    danger:  { background: T.danger,  color: T.card   },
    ghost:   { background: T.card,    color: T.text2,  border: `1px solid ${T.borderLight}` },
    subtle:  { background: T.bg,      color: T.text2,  border: `1px solid ${T.borderLight}` },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}
