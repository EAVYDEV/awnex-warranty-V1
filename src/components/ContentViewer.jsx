import { useMemo, useState } from "react";
import { T } from "../../lib/tokens.js";

function toOfficeEmbed(url) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

function detectViewerUrl(rawUrl) {
  if (!rawUrl) return null;
  const url = String(rawUrl).trim();
  const lower = url.toLowerCase();
  const isDoc = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?|#|$)/i.test(lower);
  const isSharePoint = /sharepoint\.com/i.test(lower);
  if (isSharePoint && isDoc) return { src: toOfficeEmbed(url), mode: "office" };
  return { src: url, mode: "iframe" };
}

export function ContentViewer({ open, url, onClose }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const viewer = useMemo(() => detectViewerUrl(url), [url]);
  if (!open || !url || !viewer) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.26)", pointerEvents: "auto" }} onClick={onClose} />
      <div style={{
        position: "absolute", top: 0, right: 0, height: "100%",
        width: maximized ? "100%" : "min(56vw, 900px)", minWidth: 320, maxWidth: "100%",
        background: T.card, boxShadow: "-10px 0 28px rgba(0,0,0,.16)", display: "flex", flexDirection: "column", pointerEvents: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
          <button onClick={() => setMaximized(v => !v)} style={{ border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: "6px 10px", background: T.card, cursor: "pointer" }}>{maximized ? "Restore" : "Expand"}</button>
          <button onClick={onClose} style={{ border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: "6px 10px", background: T.card, cursor: "pointer" }}>Close</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: T.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
        </div>
        <div style={{ position: "relative", flex: 1 }}>
          {loading && !failed && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, color: T.text2 }}>Loading…</div>}
          {!failed ? (
            <iframe
              src={viewer.src}
              title="Embedded Content Viewer"
              style={{ width: "100%", height: "100%", border: "none" }}
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setFailed(true); }}
            />
          ) : (
            <div style={{ padding: 20 }}>
              <p style={{ margin: 0, fontSize: 14 }}>This content cannot be embedded.</p>
              <a href={url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10 }}>Open in new tab</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
