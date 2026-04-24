import { T } from "../lib/dashboardDefaults";

function AwnexLogo({ width = 126, height = 44 }) {
  return (
    <img src="/awnex-logo-no-tag.png" alt="Awnex" width={width} height={height} />
  );
}

export function EmptyState({ onConfigure }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 420, gap: 20, padding: "48px 32px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: T.brandSubtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: T.brandDarkest, margin: "0 0 6px" }}>Connect to Quickbase</h2>
        <p style={{ fontSize: 13, color: T.textSec, margin: 0, maxWidth: 400 }}>
          Enter your Table ID and Report ID to load live warranty data. Your credentials stay secure in Vercel.
        </p>
      </div>
      <div style={{ background: T.bgApp, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 20px", textAlign: "left", maxWidth: 520, width: "100%" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Required Vercel environment variables</p>
        <pre style={{ fontSize: 12, color: T.text, margin: 0, whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: 1.8 }}>{`QB_REALM   awnexinc.quickbase.com\nQB_TOKEN   your_user_token`}</pre>
      </div>
      {onConfigure && (
        <button
          onClick={onConfigure}
          style={{
            padding: "11px 24px", borderRadius: 9, background: T.brand, color: T.white,
            border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
          Configure Connection
        </button>
      )}
      <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
        Settings are saved to your browser and passed securely to the API.
      </p>
    </div>
  );
}

export function LoadingState() {
  const skeletonStyle = { background: `linear-gradient(90deg, ${T.border} 25%, ${T.bgApp} 50%, ${T.border} 75%)`, backgroundSize: "200% 100%", borderRadius: 6, animation: "shimmer 1.4s infinite" };
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 160, height: 24, ...skeletonStyle }} />
        <div style={{ width: 80, height: 20, ...skeletonStyle }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: T.bgCard, borderRadius: 12, padding: "18px 20px", boxShadow: T.cardShadow }}>
            <div style={{ width: "60%", height: 12, marginBottom: 14, ...skeletonStyle }} />
            <div style={{ width: "40%", height: 32, marginBottom: 8, ...skeletonStyle }} />
            <div style={{ width: "70%", height: 11, ...skeletonStyle }} />
          </div>
        ))}
      </div>
      <div style={{ background: T.bgCard, borderRadius: 12, padding: 20, boxShadow: T.cardShadow, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 18, height: 18, border: `2px solid ${T.brandSoft}`, borderTopColor: T.brand, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ fontSize: 13, color: T.textSec }}>Loading data from Quickbase...</span>
      </div>
    </>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, padding: "48px 32px", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: T.dangerSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.danger, margin: "0 0 6px" }}>Failed to load from Quickbase</h2>
        <p style={{ fontSize: 13, color: T.textSec, margin: 0, maxWidth: 440 }}>{message}</p>
      </div>
      <button
        onClick={onRetry}
        style={{ padding: "9px 20px", borderRadius: 8, background: T.brand, color: T.white, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
      >
        Retry
      </button>
    </div>
  );
}

