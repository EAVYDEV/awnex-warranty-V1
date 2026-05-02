import Link from "next/link";
import { useRouter } from "next/router";
import { T } from "../../lib/tokens";
import { AwnexLogo } from "../../components/AwnexLogo";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher.jsx";

export default function AppHeader() {
  const router = useRouter();
  const isInstallation = router.pathname === "/" && router.query.module === "installation";

  const tabStyle = (active) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: `1px solid ${T.borderLight}`,
    background: active ? T.brandSubtle : T.card,
    color: active ? T.brand : T.text2,
    fontSize: 12,
    fontWeight: 600,
    textDecoration: "none",
  });

  return (
    <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AwnexLogo />
          <h1 style={{ fontSize: 48, fontWeight: 700, color: T.brandDeep, margin: 0, lineHeight: 1.05 }}>
            Warranty Management
          </h1>
        </div>
        <p style={{ fontSize: 13, color: T.text2, margin: "3px 0 0" }}>Awntrak Platform — QC Module</p>
        <div className="mt-3 flex gap-2">
          <Link href="/" style={tabStyle(router.pathname === "/" && !isInstallation)}>Warranty</Link>
          <Link href="/?module=installation" style={tabStyle(isInstallation)}>Installation</Link>
          <Link href="/quality-risk" style={tabStyle(router.pathname === "/quality-risk")}>Quality Risk & RCA</Link>
        </div>
      </div>
      <div style={{ paddingTop: 4 }}>
        <ThemeSwitcher variant="default" />
      </div>
    </div>
  );
}
