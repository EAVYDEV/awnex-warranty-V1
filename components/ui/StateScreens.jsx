import { T } from "../../lib/tokens.js";
import { Icon } from "./Icon.jsx";

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

export function EmptyState({ onConfigure }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 420, gap: 20,
      padding: "48px 32px", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: T.brandSubtle,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="database" size={26} color={T.brand} strokeWidth={1.8} />
      </div>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: T.brandDeep, margin: "0 0 6px" }}>
          Connect to Quickbase
        </h2>
        <p style={{ fontSize: 13, color: T.text2, margin: 0, maxWidth: 400 }}>
          Enter your Table ID and Report ID to load live warranty data.
          Your credentials stay secure in the server environment.
        </p>
      </div>
      <div style={{
        background: T.bg, border: `1px solid ${T.borderLight}`,
        borderRadius: 8, padding: "14px 20px",
        textAlign: "left", maxWidth: 520, width: "100%",
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: T.text3,
          textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px",
        }}>
          Required environment variables
        </p>
        <pre style={{
          fontSize: 12, color: T.text1, margin: 0,
          whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: 1.8,
        }}>
{`QB_REALM   awnexinc.quickbase.com
QB_TOKEN   your_user_token`}
        </pre>
      </div>
      {onConfigure && (
        <button
          onClick={onConfigure}
          style={{
            padding: "11px 24px", borderRadius: 8,
            background: T.brand, color: T.card,
            border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <Icon name="settings" size={15} color={T.card} />
          Configure Connection
        </button>
      )}
      <p style={{ fontSize: 12, color: T.text3, margin: 0 }}>
        Settings are saved to your browser and passed securely to the API.
      </p>
    </div>
  );
}

// ─── LOADING STATE ────────────────────────────────────────────────────────────

export function LoadingState() {
  const sk = {
    background: `linear-gradient(90deg, ${T.borderLight} 25%, ${T.bg} 50%, ${T.borderLight} 75%)`,
    backgroundSize: "200% 100%",
    borderRadius: 8,
    animation: "shimmer 1.4s infinite",
  };
  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin     { to { transform: rotate(360deg) } }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 160, height: 24, ...sk }} />
        <div style={{ width: 80,  height: 20, ...sk }} />
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 16, marginBottom: 20,
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: T.card, borderRadius: 8,
            border: `1px solid ${T.borderLight}`,
            padding: "18px 20px", boxShadow: T.cardShadow,
          }}>
            <div style={{ width: "60%", height: 12, marginBottom: 14, ...sk }} />
            <div style={{ width: "40%", height: 32, marginBottom: 8, ...sk }} />
            <div style={{ width: "70%", height: 11, ...sk }} />
          </div>
        ))}
      </div>
      <div style={{
        background: T.card, borderRadius: 8, padding: 20,
        border: `1px solid ${T.borderLight}`,
        boxShadow: T.cardShadow,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20,
      }}>
        <div style={{
          width: 18, height: 18,
          border: `2px solid ${T.brandSoft}`, borderTopColor: T.brand,
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ fontSize: 13, color: T.text2 }}>Loading data from Quickbase…</span>
      </div>
    </>
  );
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 320, gap: 16,
      padding: "48px 32px", textAlign: "center",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: T.dangerSubtle,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="alert-circle" size={24} color={T.danger} strokeWidth={2} />
      </div>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.danger, margin: "0 0 6px" }}>
          Failed to load from Quickbase
        </h2>
        <p style={{ fontSize: 13, color: T.text2, margin: 0, maxWidth: 440 }}>{message}</p>
      </div>
      <button
        onClick={onRetry}
        style={{
          padding: "9px 20px", borderRadius: 8,
          background: T.brand, color: T.card,
          border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  );
}
