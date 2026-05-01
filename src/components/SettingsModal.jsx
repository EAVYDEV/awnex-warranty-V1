import { useState } from "react";
import { T } from "../lib/dashboardDefaults";

export function SettingsModal({ onClose, onSave, initialTableId = "", initialReportId = "", dashboardLabel = "" }) {
  const [tableId,  setTableId]  = useState(initialTableId);
  const [reportId, setReportId] = useState(initialReportId);
  const [qbUrl, setQbUrl] = useState("");
  const [urlMessage, setUrlMessage] = useState("");
  const [urlMessageType, setUrlMessageType] = useState("info");

  function normalizeUrl(raw) {
    if (!raw) return "";
    const value = raw.trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  }

  function handleParseUrl() {
    const normalized = normalizeUrl(qbUrl);
    if (!normalized) {
      setUrlMessageType("error");
      setUrlMessage("Paste a Quickbase URL first.");
      return;
    }

    let parsed;
    try {
      parsed = new URL(normalized);
    } catch {
      setUrlMessageType("error");
      setUrlMessage("That URL format looks invalid. Please check and try again.");
      return;
    }

    const dbMatch = parsed.pathname.match(/\/db\/([a-z0-9]+)/i);
    const parsedTableId = dbMatch?.[1] || "";
    const parsedReportId =
      parsed.searchParams.get("rid") ||
      parsed.searchParams.get("reportId") ||
      parsed.searchParams.get("qid") ||
      "";

    if (!parsedTableId && !parsedReportId) {
      setUrlMessageType("error");
      setUrlMessage("Could not detect table or report ID from this URL.");
      return;
    }

    if (parsedTableId) setTableId(parsedTableId);
    if (parsedReportId) setReportId(parsedReportId);

    const updated = [
      parsedTableId ? `Table ID: ${parsedTableId}` : null,
      parsedReportId ? `Report ID: ${parsedReportId}` : null,
    ].filter(Boolean);
    setUrlMessageType("success");
    setUrlMessage(`Parsed ${updated.join(" • ")}`);
  }

  function handleSave() {
    const tid = tableId.trim();
    const rid = reportId.trim();
    if (!tid || !rid) return;
    onSave({ tableId: tid, reportId: rid });
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, fontSize: 13, color: T.text,
    background: T.bgApp, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, color: T.textSec,
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(7,36,74,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.bgCard, borderRadius: 16, width: "100%", maxWidth: 480,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.brandDarkest, margin: 0 }}>
              {dashboardLabel ? `${dashboardLabel} — Quickbase Connection` : "Quickbase Connection"}
            </h2>
            <p style={{ fontSize: 12, color: T.textSec, margin: "3px 0 0" }}>
              Configure which table and report to load
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 4, borderRadius: 6, lineHeight: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 24px 20px" }}>
          {/* Info box */}
          <div style={{
            background: T.brandSubtle, border: `1px solid ${T.brandSoft}`, borderRadius: 10,
            padding: "12px 14px", marginBottom: 22, fontSize: 12, color: T.brandDark, lineHeight: 1.6,
          }}>
            <strong>QB_REALM</strong> and <strong>QB_TOKEN</strong> are set as Vercel environment
            variables and never exposed to the browser. Enter the table and report IDs below to
            control which data loads.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Quickbase URL (Auto-parse)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={inputStyle}
                  value={qbUrl}
                  onChange={e => setQbUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleParseUrl(); }}
                  placeholder="e.g. https://awnexinc.quickbase.com/db/bkvhg2rwk?a=q&rid=1"
                  spellCheck={false}
                />
                <button
                  onClick={handleParseUrl}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                    background: T.bgCard, color: T.brandDark, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  Parse URL
                </button>
              </div>
              <p style={{
                fontSize: 11, marginTop: 5,
                color: urlMessageType === "error" ? "#B42318" : (urlMessageType === "success" ? "#067647" : T.textMuted),
              }}>
                {urlMessage || "Paste a table/report URL and we’ll auto-fill IDs when possible."}
              </p>
            </div>
            <div>
              <label style={labelStyle}>Table ID</label>
              <input
                style={inputStyle}
                value={tableId}
                onChange={e => setTableId(e.target.value)}
                placeholder="e.g. bkvhg2rwk"
                spellCheck={false}
              />
              <p style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>
                Found in your Quickbase app URL after <code>/db/</code>
              </p>
            </div>
            <div>
              <label style={labelStyle}>Report ID</label>
              <input
                style={inputStyle}
                value={reportId}
                onChange={e => setReportId(e.target.value)}
                placeholder="e.g. 1"
                spellCheck={false}
              />
              <p style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>
                In Quickbase: open the report, then check the URL for <code>rid=</code> or use the report settings page.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
          background: "#FAFAF8",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bgCard, color: T.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!tableId.trim() || !reportId.trim()}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: tableId.trim() && reportId.trim() ? T.brand : T.borderMid,
              color: T.white, fontSize: 13, fontWeight: 600,
              cursor: tableId.trim() && reportId.trim() ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Save and Connect
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY / LOADING / ERROR STATES ──────────────────────────────────────────

