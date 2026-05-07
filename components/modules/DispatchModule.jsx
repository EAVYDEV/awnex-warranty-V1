import { useMemo, useState, useEffect } from "react";
import { colors } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";
import { registerModule } from "../../lib/moduleRegistry.js";
import { HeroBanner, ModuleKpiCard } from "../ui/ModuleShared.jsx";

const C      = colors;
const ACCENT = "var(--t-teal)";

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function titleCase(str) {
  return String(str || "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function mapDispatchData(payload, kind) {
  const fields    = payload?.fields || [];
  const data      = payload?.data   || [];
  const labelToId = Object.fromEntries(fields.map(f => [f.label, f.id]));

  const get = (record, names) => {
    for (const name of names) {
      const id = labelToId[name];
      if (id && record[id] !== undefined) return record[id]?.value;
    }
    return null;
  };

  return data.map((record, idx) => {
    const site   = get(record, ["Site Name", "Customer", "Location", "Order Name (Formula)"]) || `Site ${idx + 1}`;
    const city   = get(record, ["City", "Job City"]);
    const state  = get(record, ["State", "Job State"]);
    const region = [city, state].filter(Boolean).join(", ");
    return {
      id:      String(get(record, ["Record ID#", "Record ID", "ID"]) || idx + 1),
      site:    String(site),
      region,
      dueDate: get(record, ["Install Date", "Scheduled Date", "Date", "Target Date"]),
      tech:    String(get(record, ["Project Manager", "Technician", "Assigned To", "Installer"]) || "Unassigned"),
      status:  String(get(record, ["Status", "Service Status", "Install Status"]) || "Scheduled"),
      type:    titleCase(String(get(record, ["Service Type", "Type"]) || kind)),
    };
  });
}

const TH = { textAlign: "left", padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 11, color: C.text3, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" };
const TD = { padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.text1, fontSize: 12 };

export function DispatchModule() {
  const [installCfg, setInstallCfg]               = useState({ tableId: "", reportId: "" });
  const [serviceCfg, setServiceCfg]               = useState({ tableId: "", reportId: "" });
  const [showInstallSettings, setShowInstallSettings] = useState(false);
  const [showServiceSettings, setShowServiceSettings] = useState(false);
  const [installJobs, setInstallJobs]             = useState([]);
  const [serviceJobs, setServiceJobs]             = useState([]);
  const [loadState, setLoadState]                 = useState("idle");
  const [errorMsg, setErrorMsg]                   = useState("");

  useEffect(() => {
    setInstallCfg(loadModuleSettings("dispatch-installations"));
    setServiceCfg(loadModuleSettings("dispatch-services"));
  }, []);

  useEffect(() => {
    if (!installCfg.tableId || !installCfg.reportId || !serviceCfg.tableId || !serviceCfg.reportId) {
      setLoadState("unconfigured"); return;
    }
    async function loadBoth() {
      setLoadState("loading"); setErrorMsg("");
      try {
        const [ir, sr] = await Promise.all([
          fetch(`/api/dispatch?kind=installations&tableId=${encodeURIComponent(installCfg.tableId)}&reportId=${encodeURIComponent(installCfg.reportId)}`),
          fetch(`/api/dispatch?kind=services&tableId=${encodeURIComponent(serviceCfg.tableId)}&reportId=${encodeURIComponent(serviceCfg.reportId)}`),
        ]);
        const [ij, sj] = await Promise.all([ir.json(), sr.json()]);
        if (!ir.ok) throw new Error(ij?.error || "Failed to load installation report.");
        if (!sr.ok) throw new Error(sj?.error || "Failed to load service report.");
        setInstallJobs(mapDispatchData(ij, "installation"));
        setServiceJobs(mapDispatchData(sj, "service"));
        setLoadState("loaded");
      } catch (err) {
        setErrorMsg(err.message || "Unable to load dispatch reports.");
        setLoadState("error");
      }
    }
    loadBoth();
  }, [installCfg, serviceCfg]);

  const combined = useMemo(() =>
    [...installJobs, ...serviceJobs].sort((a, b) => {
      const ad = parseDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bd = parseDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ad - bd;
    }),
    [installJobs, serviceJobs]
  );

  const unassigned = combined.filter(j => j.tech === "Unassigned").length;

  return (
    <div style={{ padding: "20px 24px 48px" }}>
      {showInstallSettings && (
        <SettingsModal
          dashboardLabel="Dispatch Installations"
          initialTableId={installCfg.tableId}
          initialReportId={installCfg.reportId}
          onClose={() => setShowInstallSettings(false)}
          onSave={s => { saveModuleSettings("dispatch-installations", s); setInstallCfg(s); setShowInstallSettings(false); }}
        />
      )}
      {showServiceSettings && (
        <SettingsModal
          dashboardLabel="Dispatch Services"
          initialTableId={serviceCfg.tableId}
          initialReportId={serviceCfg.reportId}
          onClose={() => setShowServiceSettings(false)}
          onSave={s => { saveModuleSettings("dispatch-services", s); setServiceCfg(s); setShowServiceSettings(false); }}
        />
      )}

      <HeroBanner
        title="Dispatch Planning"
        subtitle="Blend installation and service work orders to plan and optimize technician field trips."
        chips={[
          { label: "Installations", value: loadState === "loaded" ? String(installJobs.length) : "—", sub: "Scheduled jobs" },
          { label: "Service Sites", value: loadState === "loaded" ? String(serviceJobs.length) : "—", sub: "Work orders" },
          { label: "Unassigned",    value: loadState === "loaded" ? String(unassigned)          : "—", sub: "Need technician" },
        ]}
      >
        <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "#fff", color: "var(--t-brand)" }}>Installations</button>
        <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.15)", color: "#fff" }}>Services</button>
      </HeroBanner>

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }} />
        {[["Install Report", setShowInstallSettings], ["Service Report", setShowServiceSettings]].map(([label, setter]) => (
          <button key={label} onClick={() => setter(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2, fontFamily: "inherit" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            {label}
          </button>
        ))}
      </div>

      {loadState === "unconfigured" && (
        <div style={{ background: ACCENT + "12", border: `1px dashed ${ACCENT}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>Reports not configured</p>
            <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Configure both Quickbase reports above to start dispatch planning.</p>
          </div>
        </div>
      )}
      {loadState === "error" && (
        <div style={{ background: C.dangerSubtle, border: `1px solid ${C.danger}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, color: C.dangerText, fontSize: 13, fontWeight: 600 }}>{errorMsg}</div>
      )}
      {loadState === "loading" && (
        <div style={{ padding: "32px 0", textAlign: "center", color: C.text2, fontSize: 13 }}>Loading reports…</div>
      )}

      {loadState === "loaded" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 14, marginBottom: 24 }}>
            <ModuleKpiCard label="Installations"  value={installJobs.length} accent={ACCENT} />
            <ModuleKpiCard label="Service Sites"  value={serviceJobs.length} accent={C.brand} />
            <ModuleKpiCard label="Combined Stops" value={combined.length}    accent={C.success} />
            <ModuleKpiCard label="Unassigned"     value={unassigned}         accent={C.danger} />
          </div>

          <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 12, overflow: "hidden", background: C.card, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Combined Schedule</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: C.surface }}>
                    {["Type", "Site", "Region", "Due", "Assigned", "Status"].map(h => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {combined.map((job, i) => (
                    <tr key={`${job.type}-${job.id}`} style={{ borderBottom: i < combined.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                      <td style={TD}>{job.type}</td>
                      <td style={TD}>{job.site}</td>
                      <td style={{ ...TD, color: C.text2 }}>{job.region || "—"}</td>
                      <td style={{ ...TD, color: C.text2, whiteSpace: "nowrap" }}>{job.dueDate || "—"}</td>
                      <td style={{ ...TD, color: job.tech === "Unassigned" ? C.danger : C.text1, fontWeight: job.tech === "Unassigned" ? 700 : 400 }}>{job.tech}</td>
                      <td style={TD}>{job.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

registerModule({
  id:             "dispatch",
  label:          "Dispatch Planning",
  iconKey:        "clock",
  group:          "modules",
  component:      DispatchModule,
  accentColor:    "var(--t-teal)",
  description:    "Blend installation and service work orders to plan and optimize technician field trips.",
  overviewStatus: "configure",
});
