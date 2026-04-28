import { useState } from "react";
import { T } from "../lib/tokens.js";
import { Modal, formStyles, Btn } from "./ui/Modal.jsx";

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
// QB connection configuration — table ID and report ID.
// Credentials (QB_REALM, QB_TOKEN) live in server env vars and are never exposed.

// Handles QB URL formats:
//   Classic:  https://realm.quickbase.com/db/{tableId}?rid={reportId}
//   New nav:  https://realm.quickbase.com/nav/app/{appId}/table/{tableId}/report/{reportId}
function parseQbUrl(raw) {
  if (!raw?.trim()) return null;
  const v = raw.trim();
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  let parsed;
  try { parsed = new URL(url); } catch { return null; }

  // /db/{tableId}  →  classic format
  // /table/{tableId}  →  new nav format (excludes /nav/app/{appId} which is the app, not table)
  const tableId =
    parsed.pathname.match(/\/db\/([a-z0-9]+)/i)?.[1] ||
    parsed.pathname.match(/\/table\/([a-z0-9]+)/i)?.[1] ||
    "";

  // ?rid=  /  ?reportId=  /  ?qid=  →  classic query params
  // /report/{id}  →  new nav path segment
  const reportId =
    parsed.searchParams.get("rid") ||
    parsed.searchParams.get("reportId") ||
    parsed.searchParams.get("qid") ||
    parsed.pathname.match(/\/report\/(\d+)/i)?.[1] ||
    "";

  if (!tableId && !reportId) return null;
  return { tableId, reportId };
}

export function SettingsModal({ onClose, onSave, onClear, initialTableId = "", initialReportId = "" }) {
  const [tableId,     setTableId]     = useState(initialTableId);
  const [reportId,    setReportId]    = useState(initialReportId);
  const [qbUrl,       setQbUrl]       = useState("");
  const [urlMsg,      setUrlMsg]      = useState("");
  const [urlMsgType,  setUrlMsgType]  = useState("info");
  const [confirmClear, setConfirmClear] = useState(false);

  function handleUrlChange(e) {
    const val = e.target.value;
    setQbUrl(val);
    if (!val.trim()) {
      setUrlMsg("");
      setUrlMsgType("info");
      return;
    }
    const result = parseQbUrl(val);
    if (!result) {
      setUrlMsgType("info");
      setUrlMsg("Paste a table/report URL and we'll auto-fill IDs.");
      return;
    }
    if (result.tableId)  setTableId(result.tableId);
    if (result.reportId) setReportId(result.reportId);
    const parts = [
      result.tableId  && `Table: ${result.tableId}`,
      result.reportId && `Report: ${result.reportId}`,
    ].filter(Boolean);
    setUrlMsgType("success");
    setUrlMsg(`Parsed ${parts.join(" • ")}`);
  }

  function handleSave() {
    const tid = tableId.trim();
    const rid = reportId.trim();
    if (!tid || !rid) return;
    onSave({ tableId: tid, reportId: rid });
  }

  const canSave = tableId.trim() && reportId.trim();

  return (
    <Modal
      title="Quickbase Connection"
      subtitle="Configure which table and report to load"
      onClose={onClose}
      width={480}
      footer={
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
          {onClear ? (
            confirmClear ? (
              <Btn variant="danger" onClick={() => { setConfirmClear(false); onClear(); }}>
                Confirm Clear
              </Btn>
            ) : (
              <Btn variant="ghost" style={{ color: T.danger }} onClick={() => setConfirmClear(true)}>
                Clear Cache
              </Btn>
            )
          ) : <span />}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => { setConfirmClear(false); onClose(); }}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={!canSave}>Save and Connect</Btn>
          </div>
        </div>
      }
    >
      {/* Info banner */}
      <div style={{
        background: T.brandSubtle, border: `1px solid ${T.brandSoft}`,
        borderRadius: 14, padding: "12px 14px", marginBottom: 22,
        fontSize: 12, color: T.brandDark, lineHeight: 1.6,
      }}>
        <strong>QB_REALM</strong> and <strong>QB_TOKEN</strong> are server-side environment
        variables and never exposed to the browser. Enter the table and report IDs below.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 20 }}>
        {/* Auto-parse QB URL */}
        <div>
          <label style={formStyles.label}>Quickbase URL (Auto-parse)</label>
          <input
            style={formStyles.input}
            value={qbUrl}
            onChange={handleUrlChange}
            placeholder="https://awnexinc.quickbase.com/db/bkvhg2rwk?a=q&rid=1"
            spellCheck={false}
          />
          <p style={{
            fontSize: 11, marginTop: 5,
            color: urlMsgType === "error"   ? "#B42318"
                 : urlMsgType === "success" ? "#067647"
                 : T.text3,
          }}>
            {urlMsg || "Paste a table/report URL and both IDs will fill in automatically."}
          </p>
        </div>

        {/* Table ID */}
        <div>
          <label style={formStyles.label}>Table ID</label>
          <input
            style={formStyles.input}
            value={tableId}
            onChange={e => setTableId(e.target.value)}
            placeholder="e.g. bkvhg2rwk"
            spellCheck={false}
          />
          <p style={formStyles.hint}>Found in your QB app URL after <code>/db/</code> or <code>/table/</code></p>
        </div>

        {/* Report ID */}
        <div>
          <label style={formStyles.label}>Report ID</label>
          <input
            style={formStyles.input}
            value={reportId}
            onChange={e => setReportId(e.target.value)}
            placeholder="e.g. 1"
            spellCheck={false}
          />
          <p style={formStyles.hint}>Open the report in QB and look for <code>rid=</code> in the URL.</p>
        </div>
      </div>
    </Modal>
  );
}
