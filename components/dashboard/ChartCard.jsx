import { T } from "../../lib/tokens.js";
import { Icon } from "../ui/Icon.jsx";

// ─── CHART CARD ───────────────────────────────────────────────────────────────
// Wrapper for any chart component. Adds an optional edit-mode toolbar.

export function ChartCard({
  title, children,
  editMode = false,
  hidden   = false,
  onEdit, onDuplicate, onToggleHide,
}) {
  return (
    <div style={{
      background: T.bgCard,
      borderRadius: 12,
      padding: "16px 20px 12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      position: "relative",
      opacity: hidden && editMode ? 0.45 : 1,
      outline: editMode ? `2px dashed ${T.brandSoft}` : "none",
      outlineOffset: 2,
    }}>

      {/* Title row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14, gap: 8,
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: T.text, margin: 0,
          flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {title}
        </h3>

        {editMode && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <EditBtn title="Edit Chart" onClick={onEdit}>
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
      </div>

      {/* Chart content */}
      {children}

      {/* Hidden badge in edit mode */}
      {hidden && editMode && (
        <div style={{
          position: "absolute", bottom: 8, left: 12,
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

function EditBtn({ onClick, title, children }) {
  return (
    <button
      title={title}
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      style={{
        width: 26, height: 26, borderRadius: 6,
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

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
// Shared recharts tooltip; export here so ConfigurableChart can import it.

export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    }}>
      {label != null && (
        <p style={{ fontSize: 12, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color || T.textSec, margin: "2px 0" }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}</b>
        </p>
      ))}
    </div>
  );
}
