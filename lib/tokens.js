// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Single source of truth for all colors, shadows, and visual constants.
// Import T from here in every component — never hard-code hex values.

export const T = {
  brand:        "#1B5FA8",
  brandDark:    "#0D3F72",
  brandDarkest: "#07244A",
  brandSoft:    "#BCD4F4",
  brandSubtle:  "#E8F1FB",
  accent:       "#F5A623",
  accentDark:   "#C97E0A",
  accentSoft:   "#FAD07A",
  accentSubtle: "#FEF6E4",
  white:        "#FFFFFF",
  bgApp:        "#F4F3F0",
  bgCard:       "#FFFFFF",
  text:         "#1C1C1B",
  textSec:      "#636260",
  textMuted:    "#959490",
  border:       "#E5E4E0",
  borderMid:    "#C4C3BD",
  success:      "#27500A",
  successSoft:  "#EAF3DE",
  successFill:  "#97C459",
  danger:       "#E24B4A",
  dangerSoft:   "#FCEBEB",
  dangerFill:   "#F09595",
  warning:      "#C97E0A",
  warningSoft:  "#FEF6E4",
  warningFill:  "#FAD07A",
  cardShadow:   "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
  cardHover:    "0 4px 12px rgba(0,0,0,0.10)",
};

export const STATUS_CFG = {
  active:   { bg: "#EAF3DE", text: "#27500A", border: "#97C459", dot: "#97C459", label: "Active"   },
  expiring: { bg: "#FEF6E4", text: "#8C5505", border: "#FAD07A", dot: "#FAD07A", label: "Expiring" },
  expired:  { bg: "#FCEBEB", text: "#791F1F", border: "#F09595", dot: "#F09595", label: "Expired"  },
};

export const RISK_CFG = {
  critical: { label: "Critical", bg: "#FCEBEB", text: "#791F1F", border: "#F09595", dot: "#E24B4A" },
  high:     { label: "High",     bg: "#FEF6E4", text: "#8C5505", border: "#FAD07A", dot: "#F5A623" },
  medium:   { label: "Medium",   bg: "#EFF4FB", text: "#1B5FA8", border: "#BCD4F4", dot: "#7DAEE8" },
  low:      { label: "Low",      bg: "#EAF3DE", text: "#27500A", border: "#97C459", dot: "#97C459" },
};

export const CHART_PALETTE = [
  "#1B5FA8","#F5A623","#E24B4A","#97C459",
  "#7DAEE8","#FAD07A","#F09595","#5DCAA5","#AFA9EC","#C4C3BD",
];
