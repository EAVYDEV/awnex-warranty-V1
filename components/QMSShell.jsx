import { useState, useCallback } from "react";
import { QMSSidebar } from "./QMSSidebar.jsx";
import { QMSOverview } from "./modules/QMSOverview.jsx";
import { InspectionsModule } from "./modules/InspectionsModule.jsx";
import { NcrModule } from "./modules/NcrModule.jsx";
import { CapaModule } from "./modules/CapaModule.jsx";
import { ProductionModule } from "./modules/ProductionModule.jsx";
import { WarrantyDashboard } from "../src/WarrantyDashboard.jsx";
import { colors } from "../lib/tokens.js";

const C = colors;

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

  const handleModuleChange = useCallback((id) => {
    setActiveModule(id);
  }, []);

  const ActiveComponent = MODULE_COMPONENTS[activeModule] || QMSOverview;

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: C.bg,
      fontFamily: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    }}>
      <QMSSidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      <main style={{
        flex: 1,
        overflow: "auto",
        minWidth: 0,
        background: C.bg,
      }}>
        <ActiveComponent onNavigate={handleModuleChange} />
      </main>
    </div>
  );
}
