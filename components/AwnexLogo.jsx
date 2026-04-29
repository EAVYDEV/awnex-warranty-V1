import { useState } from "react";

export function AwnexLogo({ height = 44 }) {
  const [src, setSrc] = useState("/awnex-logo-no-tag.png");
  return (
    <img
      src={src}
      alt="Awnex logo"
      style={{ height, width: "auto", objectFit: "contain", display: "block" }}
      onError={() => {
        if (src !== "/favicon.ico") setSrc("/favicon.ico");
        else { /* hide if both fail */ }
      }}
    />
  );
}
