import { useState, useCallback } from "react";
import { QMSSidebar } from "./QMSSidebar.jsx";
import { QMSOverview } from "./modules/QMSOverview.jsx";
import { InspectionsModule } from "./modules/InspectionsModule.jsx";
import { NcrModule } from "./modules/NcrModule.jsx";
import { CapaModule } from "./modules/CapaModule.jsx";
import { ProductionModule } from "./modules/ProductionModule.jsx";
import { WarrantyDashboard } from "../src/WarrantyDashboard.jsx";
import { ThemeSwitcher } from "./ui/ThemeSwitcher.jsx";
import { colors } from "../lib/tokens.js";

const C = colors;

// Small inline icon helper for the top bar
function TbIcon({ d, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M').map((seg, i) => <path key={i} d={i === 0 ? seg : 'M' + seg} />)}
    </svg>
  );
}

const TB_ICONS = {
  edit:     'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  bell:     'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
};

function TbBtn({ icon, onClick, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'inherit', border: 'none', cursor: 'pointer',
        width: 34, height: 34, borderRadius: 5,
        background: hovered ? C.surface : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.text2, position: 'relative', transition: 'background 0.12s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TbIcon d={TB_ICONS[icon]} />
      {badge && (
        <div style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7, borderRadius: '50%',
          background: C.danger, border: `2px solid ${C.card}`,
        }} />
      )}
    </button>
  );
}

const MODULE_COMPONENTS = {
  overview:    QMSOverview,
  warranty:    (props) => <WarrantyDashboard apiRoute="/api/warranty-orders" standalone={false} {...props} />,
  inspections: InspectionsModule,
  ncrs:        NcrModule,
  capas:       CapaModule,
  production:  ProductionModule,
};

export function QMSShell() {
  const [activeModule, setActiveModule] = useState("overview");
  const [collapsed, setCollapsed]       = useState(false);

  const handleModuleChange = useCallback((id) => setActiveModule(id), []);

  const ActiveComponent = MODULE_COMPONENTS[activeModule] || QMSOverview;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: C.bg,
      fontFamily: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    }}>
      <QMSSidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 60,
          background: C.card,
          borderBottom: `1px solid ${C.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }} />
          <ThemeSwitcher variant="default" />
          <div style={{ width: 1, height: 22, background: C.borderLight, margin: '0 4px' }} />
          <TbBtn icon="edit" />
          <TbBtn icon="settings" />
          <div style={{ width: 1, height: 22, background: C.borderLight, margin: '0 4px' }} />
          <TbBtn icon="bell" badge />
          <div style={{ width: 8 }} />
          {/* User avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.brand}, ${C.brandDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 800,
            flexShrink: 0,
          }}>
            QM
          </div>
        </div>

        <main style={{ flex: 1, overflow: 'auto', minWidth: 0, background: C.bg }}>
          <ActiveComponent onNavigate={handleModuleChange} />
        </main>
      </div>
    </div>
  );
}
