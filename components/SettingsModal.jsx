import { useState } from "react";
import { T } from "../lib/tokens.js";
import { Modal, formStyles, Btn } from "./ui/Modal.jsx";

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
// QB connection configuration — table ID and report ID.
// Credentials (QB_REALM, QB_TOKEN) live in server env vars and are never exposed.

export function SettingsModal({ onClose, onSave, initialTableId = "", initialReportId = "" }) {
  const [tableId,  setTableId]  = useState(initialTableId);
  const [reportId, setReportId] = useState(initialReportId);
  const [qbUrl, setQbUrl]       = useState("");
  const [urlMsg, setUrlMsg]     = useState("");
  const [urlMsgType, setUrlMsgType] = useState("info");

  function normalise(raw) {
    if (!raw) return "";
    const v = raw.trim();
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }

  function handleParseUrl() {
    const url = normalise(qbUrl);
    if (!url) { setUrlMsgType("error"); setUrlMsg("Paste a Quickbase URL first."); return; }
    let parsed;
    try { parsed = new URL(url); } catch {
      setUrlMsgType("error"); setUrlMsg("That URL format looks invalid."); return;
    }
    const dbMatch      = parsed.pathname.match(/\/db\/([a-z0-9]+)/i);
    const parsedTable  = dbMatch?.[1] || "";
    const parsedReport = parsed.searchParams.get("rid") || parsed.searchParams.get("reportId") || parsed.searchParams.get("qid") || "";
    if (!parsedTable && !parsedReport) {
      setUrlMsgType("error"); setUrlMsg("Could not detect table or report ID from this URL."); return;
    }
    if (parsedTable)  setTableId(parsedTable);
    if (parsedReport) setReportId(parsedReport);
    const parts = [parsedTable && `Table: ${parsedTable}`, parsedReport && `Report: ${parsedReport}`].filter(Boolean);
    setUrlMsgType("success"); setUrlMsg(`Parsed ${parts.join(" • ")}`);
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
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={!canSave}>Save and Connect</Btn>
        </>
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
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={formStyles.input}
              value={qbUrl}
              onChange={e => setQbUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleParseUrl()}
              placeholder="https://awnexinc.quickbase.com/db/bkvhg2rwk?a=q&rid=1"
              spellCheck={false}
            />
            <button
              onClick={handleParseUrl}
              style={{
                padding: "8px 12px", borderRadius: 12, border: `1px solid ${T.borderLight}`,
                background: T.card, color: T.brandDark, fontSize: 12, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
              }}
            >
              Parse
            </button>
          </div>
          <p style={{
            fontSize: 11, marginTop: 5,
            color: urlMsgType === "error" ? "#B42318" : urlMsgType === "success" ? "#067647" : T.text3,
          }}>
            {urlMsg || "Paste a table/report URL and we'll auto-fill IDs."}
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
          <p style={formStyles.hint}>Found in your QB app URL after <code>/db/</code></p>
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
