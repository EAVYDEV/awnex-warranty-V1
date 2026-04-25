import { T } from "../../lib/tokens.js";

export function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
  return <span style={{ marginLeft: 4, color: T.brand }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
}
