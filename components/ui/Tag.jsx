import { T } from "../../lib/tokens.js";

export function ProductTag({ name }) {
  return (
    <span style={{
      padding: "2px 7px",
      borderRadius: 4,
      background: T.brandSubtle,
      color: T.brandDark,
      fontSize: 10,
      fontWeight: 600,
      display: "inline-block",
      marginRight: 3,
      marginBottom: 2,
    }}>
      {name}
    </span>
  );
}
