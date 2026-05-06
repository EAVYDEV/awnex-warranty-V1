import { useMemo, useState, useEffect } from "react";
import { colors } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";

function mapDispatchData(payload, fallbackType) {
  const fields = payload?.fields || [];
  const data = payload?.data || [];
  const labelToId = Object.fromEntries(fields.map((f) => [f.label, f.id]));

  const get = (record, labels) => {
    for (const label of labels) {
      const id = labelToId[label];
      if (id && record[id] !== undefined) return record[id]?.value;
    }
    return null;
  };

  return data.map((record, index) => {
    const city = get(record, ["City", "Job City"]);
    const state = get(record, ["State", "Job State"]);
    return {
      id: String(get(record, ["Record ID#", "Record ID", "ID"]) || index + 1),
      type: String(get(record, ["Service Type", "Type"]) || fallbackType),
      site: String(get(record, ["Site Name", "Customer", "Location", "Order Name (Formula)"]) || `Site ${index + 1}`),
      region: [city, state].filter(Boolean).join(", "),
      dueDate: get(record, ["Install Date", "Scheduled Date", "Date", "Target Date"]),
      tech: String(get(record, ["Project Manager", "Technician", "Assigned To", "Installer"]) || "Unassigned"),
      status: String(get(record, ["Status", "Service Status", "Install Status"]) || "Scheduled"),
    };
  });
}

export function DispatchModule() {
  const C = colors;
  const ACCENT = "#0EA5E9";
  const [installCfg, setInstallCfg] = useState({ tableId: "", reportId: "" });
  const [serviceCfg, setServiceCfg] = useState({ tableId: "", reportId: "" });
  const [showInstallSettings, setShowInstallSettings] = useState(false);
  const [showServiceSettings, setShowServiceSettings] = useState(false);
  const [installJobs, setInstallJobs] = useState([]);
  const [serviceJobs, setServiceJobs] = useState([]);
  const [loadState, setLoadState] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setInstallCfg(loadModuleSettings("dispatch-installations"));
    setServiceCfg(loadModuleSettings("dispatch-services"));
  }, []);

  useEffect(() => {
    if (!(installCfg.tableId && installCfg.reportId && serviceCfg.tableId && serviceCfg.reportId)) {
      setLoadState("unconfigured");
      return;
    }

    const fetchBoth = async () => {
      setLoadState("loading");
      setErrorMsg("");
      try {
        const [a, b] = await Promise.all([
          fetch(`/api/dispatch?tableId=${encodeURIComponent(installCfg.tableId)}&reportId=${encodeURIComponent(installCfg.reportId)}`),
          fetch(`/api/dispatch?tableId=${encodeURIComponent(serviceCfg.tableId)}&reportId=${encodeURIComponent(serviceCfg.reportId)}`),
        ]);
        const aj = await a.json();
        const bj = await b.json();
        if (!a.ok) throw new Error(aj?.error || "Failed to load installation report.");
        if (!b.ok) throw new Error(bj?.error || "Failed to load service report.");

        setInstallJobs(mapDispatchData(aj, "Installation"));
        setServiceJobs(mapDispatchData(bj, "Service"));
        setLoadState("loaded");
      } catch (err) {
        setErrorMsg(err.message || "Unable to load dispatch reports.");
        setLoadState("error");
      }
    };

    fetchBoth();
  }, [installCfg, serviceCfg]);

  const combined = useMemo(() => {
    const asDate = (v) => {
      const t = new Date(v || "").getTime();
      return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
    };
    return [...installJobs, ...serviceJobs].sort((x, y) => asDate(x.dueDate) - asDate(y.dueDate));
  }, [installJobs, serviceJobs]);

  const th = { textAlign: "left", padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, fontSize: 11, color: C.text3, textTransform: "uppercase" };
  const td = { padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.text1 };

  return <div style={{ padding: 32 }}>
    {showInstallSettings && <SettingsModal dashboardLabel="Dispatch Installations" initialTableId={installCfg.tableId} initialReportId={installCfg.reportId} onClose={() => setShowInstallSettings(false)} onSave={(s) => { saveModuleSettings("dispatch-installations", s); setInstallCfg(s); setShowInstallSettings(false); }} />}
    {showServiceSettings && <SettingsModal dashboardLabel="Dispatch Services" initialTableId={serviceCfg.tableId} initialReportId={serviceCfg.reportId} onClose={() => setShowServiceSettings(false)} onSave={(s) => { saveModuleSettings("dispatch-services", s); setServiceCfg(s); setShowServiceSettings(false); }} />}

    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
      <div><h1 style={{ margin: 0, color: C.text1 }}>Dispatch Planning</h1><p style={{ margin: "6px 0 0", color: C.text2, fontSize: 12 }}>Blend installation and service work to optimize field trips.</p></div>
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => setShowInstallSettings(true)}>Configure Install Report</button><button onClick={() => setShowServiceSettings(true)}>Configure Service Report</button></div>
    </div>

    {loadState === "unconfigured" && <p style={{ color: C.text2 }}>Configure both Quickbase reports to start dispatch planning.</p>}
    {loadState === "error" && <p style={{ color: C.danger }}>{errorMsg}</p>}
    {loadState === "loading" && <p style={{ color: C.text2 }}>Loading reports...</p>}
    {loadState === "loaded" && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[['Installations', installJobs.length], ['Service Sites', serviceJobs.length], ['Combined Stops', combined.length], ['Unassigned', combined.filter((j) => j.tech === 'Unassigned').length]].map(([label, value]) => <div key={label} style={{ border: `1px solid ${C.borderLight}`, borderTop: `3px solid ${ACCENT}`, borderRadius: 10, padding: 12, background: C.card }}><div style={{ fontSize: 11, color: C.text3 }}>{label}</div><div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div></div>)}
      </div>
      <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 10, overflow: "hidden", background: C.card }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: C.surface }}><th style={th}>Type</th><th style={th}>Site</th><th style={th}>Region</th><th style={th}>Due</th><th style={th}>Assigned</th><th style={th}>Status</th></tr></thead>
          <tbody>{combined.map((job) => <tr key={`${job.type}-${job.id}`}><td style={td}>{job.type}</td><td style={td}>{job.site}</td><td style={td}>{job.region || "—"}</td><td style={td}>{job.dueDate || "—"}</td><td style={td}>{job.tech}</td><td style={td}>{job.status}</td></tr>)}</tbody>
        </table>
      </div>
    </>}
  </div>;
}
