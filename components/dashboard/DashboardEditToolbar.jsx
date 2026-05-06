import { useState } from "react";
import { T } from "../../lib/tokens.js";
import { Icon } from "../ui/Icon.jsx";
import { Btn } from "../ui/Modal.jsx";

export function DashboardEditToolbar({ onAddKpi, onAddChart, onResetAll, onExit }) {
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    if (!confirmReset) { setConfirmReset(true); return; }
    setConfirmReset(false);
    onResetAll();
  }

  return (
    <div style={{
      background: T.brandDeep,
      borderRadius: 14,
      padding: "10px 16px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    }}>
      {/* Mode badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 8,
        background: T.toolbarBadgeBg,
        fontSize: 11, fontWeight: 700, color: T.accentSoft,
        letterSpacing: "0.05em", textTransform: "uppercase",
      }}>
        <Icon name="pencil" size={12} color={T.accentSoft} />
        Edit Mode
      </div>

      <div style={{ width: 1, height: 20, background: T.toolbarDivider }} />

      <ToolbarBtn icon="plus" label="Add KPI" onClick={onAddKpi} />
      <ToolbarBtn icon="bar-chart-2" label="Add Chart" onClick={onAddChart} />

      <span style={{ flex: 1 }} />

      {confirmReset ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.accentSoft, fontWeight: 600 }}>
            Reset to defaults?
          </span>
          <ToolbarBtn icon="check"  label="Yes, Reset" onClick={handleReset}    danger />
          <ToolbarBtn icon="x"      label="Cancel"     onClick={() => setConfirmReset(false)} />
        </div>
      ) : (
        <ToolbarBtn icon="refresh-cw" label="Reset to Defaults" onClick={handleReset} />
      )}

      <div style={{ width: 1, height: 20, background: T.toolbarDivider }} />

      <button
        onClick={onExit}
        style={{
          padding: "7px 14px", borderRadius: 12,
          background: T.brand, border: "none",
          color: T.card, fontSize: 12, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          fontFamily: "inherit",
        }}
      >
        <Icon name="check" size={13} color={T.card} />
        Done Editing
      </button>
    </div>
  );
}

function ToolbarBtn({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px", borderRadius: 10,
        background: T.toolbarBtnBg,
        border: `1px solid ${danger ? T.toolbarBtnBorderDanger : T.toolbarBtnBorder}`,
        color: danger ? T.toolbarDanger : T.toolbarText,
        fontSize: 12, fontWeight: 600,
        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        fontFamily: "inherit",
        transition: "background 0.15s",
      }}
    >
      <Icon name={icon} size={13} color={danger ? T.toolbarDanger : T.toolbarTextMuted} />
      {label}
    </button>
  );
}
