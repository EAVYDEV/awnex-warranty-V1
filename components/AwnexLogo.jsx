import { useState } from "react";

export function AwnexLogo({ height = 44 }) {
  const [src, setSrc] = useState("/logo.png");
  return (
    <img
      src={src}
      alt="Awnex logo"
      style={{ height, width: "auto", objectFit: "contain", display: "block" }}
      onError={() => {
        if (src === "/logo.png") setSrc("/awnex-logo-no-tag.png");
        else { /* hide if both fail */ }
      }}
    />
  );
}
