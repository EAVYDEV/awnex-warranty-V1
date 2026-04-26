import { T } from "../../lib/tokens.js";
import { Icon } from "../ui/Icon.jsx";

export function KpiCard({
  label, value, sub, color, bg, iconName,
  editMode = false,
  hidden   = false,
  onEdit, onDuplicate, onToggleHide,
}) {
  const isBlank = value === null || value === undefined || value === "-";

  return (
    <div style={{
      background: T.card,
      borderRadius: 24,
      padding: "16px 18px",
      boxShadow: T.cardShadow,
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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: T.text2,
          textTransform: "uppercase", letterSpacing: "0.05em",
          paddingRight: editMode ? 68 : 0,
          minWidth: 0,
          wordBreak: "break-word",
          lineHeight: 1.35,
        }}>
          {label}
        </span>
        {iconName && !editMode && (
          <div style={{
            width: 32, height: 32, borderRadius: 10,
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
        fontSize: isBlank ? 22 : value && String(value).length > 12 ? 20 : value && String(value).length > 8 ? 24 : 30,
        fontWeight: 700,
        color: isBlank ? T.text3 : (color || T.text1),
        lineHeight: 1.15,
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        minWidth: 0,
      }}>
        {isBlank ? "—" : value}
      </span>

      {/* Sub-text */}
      {sub && (
        <span style={{ fontSize: 12, color: T.text3, lineHeight: 1.4 }}>{sub}</span>
      )}

      {/* Hidden badge in edit mode */}
      {hidden && editMode && (
        <div style={{
          position: "absolute", bottom: 8, left: 8,
          background: T.bg, border: `1px solid ${T.borderLight}`,
          borderRadius: 6, padding: "1px 6px",
          fontSize: 10, fontWeight: 700, color: T.text3,
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          Hidden
        </div>
      )}
    </div>
  );
}

function EditBtn({ onClick, title, children }) {
  return (
    <button
      title={title}
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      style={{
        width: 24, height: 24, borderRadius: 8,
        border: `1px solid ${T.borderLight}`,
        background: T.card,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: T.text2, padding: 0,
      }}
    >
      {children}
    </button>
  );
}
