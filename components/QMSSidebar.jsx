import { AwnexLogo } from "./AwnexLogo.jsx";
import { colors } from "../lib/tokens.js";

const C = colors;

// ─── SIDEBAR COMPONENT ────────────────────────────────────────────────────────

export function QMSSidebar() {
  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      maxWidth: 240,
      height: "100vh",
      position: "sticky",
      top: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      zIndex: 100,
    }}>
      <div style={{
        padding: "20px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 72,
      }}>
        <div style={{ flexShrink: 0 }}>
          <AwnexLogo height={32} />
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2, whiteSpace: "nowrap" }}>
            Quality Management
          </div>
          <div style={{ fontSize: 10, color: C.sidebarMuted, fontWeight: 500, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            Awnex QMS Platform
          </div>
        </div>
      </div>
    </aside>
  );
}
