import { T } from "../lib/dashboardDefaults";

function AwnexLogo({ width = 126, height = 44 }) {
  return <img src="/awnex-logo-no-tag.png" alt="Awnex" width={width} height={height} />;
}

export function EmptyState({ onConfigure }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 340, gap: 14, textAlign: "center" }}>
      <AwnexLogo />
      <p style={{ fontSize: 14, color: T.textSec, margin: 0 }}>No Quickbase table/report is configured.</p>
      <button onClick={onConfigure} style={{ padding: "10px 16px", borderRadius: 8, background: T.brand, color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>Configure Settings</button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 18, height: 18, border: `2px solid ${T.brandSoft}`, borderTopColor: T.brand, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: 13, color: T.textSec }}>Loading warranty data...</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, padding: "48px 32px", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: T.dangerSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>!</div>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.danger, margin: "0 0 6px" }}>Failed to load from Quickbase</h2>
        <p style={{ fontSize: 13, color: T.textSec, margin: 0, maxWidth: 440 }}>{message}</p>
      </div>
      <button onClick={onRetry} style={{ padding: "9px 20px", borderRadius: 8, background: T.brand, color: T.white, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retry</button>
    </div>
  );
}
