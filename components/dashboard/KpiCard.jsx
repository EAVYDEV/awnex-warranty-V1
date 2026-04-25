import { T } from "../../lib/tokens.js";
import { Icon } from "../ui/Icon.jsx";

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
// Displays a single KPI metric. Accepts an optional editMode prop; when true
// shows inline edit / duplicate / hide controls so the dashboard edit toolbar
// can surface them without a separate layer of state.

export function KpiCard({
  label, value, sub, color, bg, iconName,
  editMode = false,
  hidden   = false,
  onEdit, onDuplicate, onToggleHide,
}) {
  const isBlank = value === null || value === undefined || value === "-";

  return (
    <div style={{
      background: T.bgCard,
      borderRadius: 12,
      padding: "16px 18px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      opacity: hidden && editMode ? 0.45 : 1,
      outline: editMode ? `2px dashed ${T.brandSoft}` : "none",
      outlineOffset: 2,
      transition: "opacity 0.2s",
    }}>

      {/* Edit-mode overlay controls */}
      {editMode && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          display: "flex", gap: 4, zIndex: 2,
        }}>
          <EditBtn title="Edit KPI" onClick={onEdit}>
            <Icon name="pencil" size={12} />
          </EditBtn>
          <EditBtn title="Duplicate" onClick={onDuplicate}>
            <Icon name="copy" size={12} />
          </EditBtn>
          <EditBtn title={hidden ? "Show" : "Hide"} onClick={onToggleHide}>
            <Icon name={hidden ? "eye" : "eye-off"} size={12} />
          </EditBtn>
        </div>
      )}

      {/* Header row: label + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: T.textSec,
          textTransform: "uppercase", letterSpacing: "0.05em",
          paddingRight: editMode ? 68 : 0,
        }}>
          {label}
        </span>
        {iconName && !editMode && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: bg || T.brandSubtle,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon name={iconName} size={16} color={color || T.brand} />
          </div>
        )}
      </div>

      {/* Value */}
      <span style={{
        fontSize: isBlank ? 22 : 30,
        fontWeight: 700,
        color: isBlank ? T.textMuted : (color || T.text),
        lineHeight: 1,
      }}>
        {isBlank ? "—" : value}
      </span>

      {/* Sub-text */}
      {sub && (
        <span style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>{sub}</span>
      )}

      {/* Hidden badge in edit mode */}
      {hidden && editMode && (
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          background: T.bgApp, border: `1px solid ${T.border}`,
          borderRadius: 4, padding: "1px 6px",
          fontSize: 10, fontWeight: 700, color: T.textMuted,
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          Hidden
        </div>
      )}
    </div>
  );
}

// Small icon-only button used inside the card in edit mode
function EditBtn({ onClick, title, children }) {
  return (
    <button
      title={title}
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      style={{
        width: 24, height: 24, borderRadius: 6,
        border: `1px solid ${T.border}`,
        background: T.bgCard,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: T.textSec, padding: 0,
      }}
    >
      {children}
    </button>
  );
}
