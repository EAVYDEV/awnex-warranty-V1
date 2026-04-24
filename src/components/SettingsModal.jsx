import { useState } from "react";
import { T } from "../lib/dashboardDefaults";

export function SettingsModal({ onClose, onSave, initialTableId = "", initialReportId = "" }) {
  const [tableId, setTableId] = useState(initialTableId);
  const [reportId, setReportId] = useState(initialReportId);

  function submit(e) {
    e.preventDefault();
    onSave({ tableId: tableId.trim(), reportId: reportId.trim() });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(7,36,74,0.45)", backdropFilter: "blur(2px)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 520, background: T.bgCard, borderRadius: 14, boxShadow: "0 14px 40px rgba(0,0,0,0.24)", border: `1px solid ${T.border}` }}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontSize: 16, color: T.text }}>Quickbase Report Settings</h3>
        </div>
        <div style={{ padding: 18, display: "grid", gap: 12 }}>
          <label style={{ fontSize: 12, color: T.textSec, fontWeight: 700 }}>
            Table ID
            <input value={tableId} onChange={(e) => setTableId(e.target.value)} placeholder="e.g. bkvhg2rwk" style={{ width: "100%", marginTop: 6, padding: "10px 11px", borderRadius: 8, border: `1px solid ${T.borderMid}`, fontSize: 13 }} />
          </label>
          <label style={{ fontSize: 12, color: T.textSec, fontWeight: 700 }}>
            Report ID
            <input value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="e.g. 12" style={{ width: "100%", marginTop: 6, padding: "10px 11px", borderRadius: 8, border: `1px solid ${T.borderMid}`, fontSize: 13 }} />
          </label>
        </div>
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 14px", borderRadius: 8, border: `1px solid ${T.borderMid}`, background: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button type="submit" style={{ padding: "9px 14px", borderRadius: 8, border: "none", background: T.brand, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Save & Reload</button>
        </div>
      </form>
    </div>
  );
}
