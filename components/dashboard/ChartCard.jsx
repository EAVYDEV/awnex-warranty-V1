import { T } from "../../lib/tokens.js";
import { Icon } from "../ui/Icon.jsx";

export function ChartCard({
  title, children,
  editMode = false,
  hidden   = false,
  onEdit, onDuplicate, onToggleHide,
}) {
  return (
    <div style={{
      background: T.card,
      borderRadius: 24,
      padding: "16px 20px 12px",
      boxShadow: T.cardShadow,
      position: "relative",
      opacity: hidden && editMode ? 0.45 : 1,
      outline: editMode ? `2px dashed ${T.brandSoft}` : "none",
      outlineOffset: 2,
    }}>
      {editMode && (
        <div
          title="Drag this chart card to reorder"
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            borderRadius: 999,
            border: `1px solid ${T.borderLight}`,
            background: T.card,
            color: T.text3,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          <Icon name="grip" size={11} color={T.text3} />
          Drag
        </div>
      )}

      {/* Title row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14, gap: 8,
      }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: T.text1, margin: 0,
          flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          paddingLeft: editMode ? 58 : 0,
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
        width: 26, height: 26, borderRadius: 8,
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

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 14,
      padding: "8px 12px",
      boxShadow: T.cardShadow,
    }}>
      {label != null && (
        <p style={{ fontSize: 12, fontWeight: 600, color: T.text1, margin: "0 0 4px" }}>{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color || T.text2, margin: "2px 0" }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}</b>
        </p>
      ))}
    </div>
  );
}
