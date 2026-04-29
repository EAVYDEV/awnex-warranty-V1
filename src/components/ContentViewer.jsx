import { useEffect, useMemo, useRef, useState } from "react";

function toOfficeEmbed(url) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}

export function isMicrosoftAuthUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const full = `${host}${path}${parsed.search}`.toLowerCase();
    return (
      host.includes("login.microsoftonline.com") ||
      host.includes("login.live.com") ||
      full.includes("microsoftonline.com/oauth2") ||
      path.includes("/oauth2/authorize")
    );
  } catch {
    return false;
  }
}

export function isSharePointUrl(url) {
  try {
    return new URL(url).hostname.toLowerCase().includes("sharepoint.com");
  } catch {
    return false;
  }
}

export function isQuickbaseUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("quickbase.com");
  } catch {
    return false;
  }
}

export function isDirectDocumentUrl(url) {
  try {
    return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

export function getEmbeddableUrl(url) {
  if (!url) return null;
  if (isMicrosoftAuthUrl(url)) return null;
  if (isSharePointUrl(url)) {
    const isDoc = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(new URL(url).pathname);
    if (isDoc) return toOfficeEmbed(url);
  }
  return url;
}

export function canAttemptEmbed(url) {
  if (!url || isMicrosoftAuthUrl(url)) return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase().includes("sharepoint.com")) {
      return (
        isDirectDocumentUrl(url) ||
        parsed.searchParams.has("id") ||
        parsed.searchParams.has("sourcedoc")
      );
    }
    if (isQuickbaseUrl(url)) return true;
    return true;
  } catch {
    return false;
  }
}

export const getViewerUrl = getEmbeddableUrl;

export function ContentViewer({ open, url, onClose }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewer = useMemo(() => getViewerUrl(url), [url]);
  const shouldTryEmbed = useMemo(() => canAttemptEmbed(url), [url]);
  const timeoutRef = useRef(null);
  if (!open || !url) return null;

  const showFallback = failed || !viewer || !shouldTryEmbed || isMicrosoftAuthUrl(url);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    setCopied(false);
  }, [url, open]);

  useEffect(() => {
    if (!open || showFallback) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setFailed(true);
    }, isQuickbaseUrl(url) ? 8000 : 7000);
    return () => clearTimeout(timeoutRef.current);
  }, [open, showFallback, url]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.26)", pointerEvents: "auto" }} onClick={onClose} />
      <div style={{
        position: "absolute", top: 0, right: 0, height: "100%",
        width: maximized ? "100%" : "min(56vw, 900px)", minWidth: 320, maxWidth: "100%",
        background: "#fff", boxShadow: "-10px 0 28px rgba(0,0,0,.16)", display: "flex", flexDirection: "column", pointerEvents: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #E6E9EF" }}>
          <button onClick={() => setMaximized(v => !v)} style={{ border: "1px solid #D8DEE9", borderRadius: 8, padding: "6px 10px", background: "#fff", cursor: "pointer" }}>{maximized ? "Restore" : "Expand"}</button>
          <button onClick={onClose} style={{ border: "1px solid #D8DEE9", borderRadius: 8, padding: "6px 10px", background: "#fff", cursor: "pointer" }}>Close</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
        </div>
        <div style={{ position: "relative", flex: 1 }}>
          {loading && !showFallback && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, color: "#6B7280" }}>Loading…</div>}
          {!showFallback ? (
            <iframe
              src={viewer}
              title="Embedded Content Viewer"
              style={{ width: "100%", height: "100%", border: "none" }}
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-same-origin"
              allow="fullscreen"
              onLoad={() => { clearTimeout(timeoutRef.current); setLoading(false); }}
              onError={() => { setLoading(false); setFailed(true); }}
            />
          ) : (
            <div style={{ padding: 20 }}>
              <p style={{ margin: 0, fontSize: 14 }}>This Microsoft or SharePoint content cannot be embedded because sign-in or browser security policy blocks it.</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#6B7280", wordBreak: "break-all" }}>{url}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => { window.location.href = url; }} style={{ border: "1px solid #D8DEE9", borderRadius: 8, padding: "6px 10px", background: "#fff", cursor: "pointer" }}>Open in same tab</button>
                <button onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {} }} style={{ border: "1px solid #D8DEE9", borderRadius: 8, padding: "6px 10px", background: "#fff", cursor: "pointer" }}>{copied ? "Copied" : "Copy link"}</button>
                <button onClick={onClose} style={{ border: "1px solid #D8DEE9", borderRadius: 8, padding: "6px 10px", background: "#fff", cursor: "pointer" }}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
