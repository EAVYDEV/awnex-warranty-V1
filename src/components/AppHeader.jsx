import Link from "next/link";
import { useRouter } from "next/router";
import { colors } from "../../lib/tokens";

const C = colors;

export default function AppHeader({ title = "Warranty Management", subtitle = "Real-time warranty coverage, claim tracking, and risk visibility across all orders." }) {
  const router = useRouter();
  const isInstallation = router.pathname === "/" && router.query.module === "installation";

  const tabs = [
    { href: "/",                  label: "Warranty",         active: router.pathname === "/" && !isInstallation },
    { href: "/?module=installation", label: "Installation",  active: isInstallation },
    { href: "/quality-risk",      label: "Quality Risk & RCA", active: router.pathname === "/quality-risk" },
  ];

  return (
    <div style={{
      background: `linear-gradient(115deg, ${C.brandDeep} 0%, ${C.brand} 60%, ${C.brandLight} 100%)`,
      borderRadius: 13,
      padding: '24px 32px',
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: 180, top: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 220, bottom: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.15 }}>
        {title}
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: 420, margin: 0 }}>
        {subtitle}
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              borderRadius: 9999,
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              background: tab.active ? '#fff' : 'rgba(255,255,255,0.15)',
              color: tab.active ? C.brand : '#fff',
              transition: 'background 0.12s',
              display: 'inline-block',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
