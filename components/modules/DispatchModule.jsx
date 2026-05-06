import { useMemo, useState, useEffect } from "react";
import { colors, shadows } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";

const C = colors;
const ACCENT = 'var(--t-teal)';

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function titleCase(str) {
  return String(str || "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function mapDispatchData(payload, kind) {
  const fields = payload?.fields || [];
  const data = payload?.data || [];
  const labelToId = Object.fromEntries(fields.map((f) => [f.label, f.id]));

  const get = (record, names) => {
    for (const name of names) {
      const id = labelToId[name];
      if (id && record[id] !== undefined) return record[id]?.value;
    }
    return null;
  };

  return data.map((record, idx) => {
    const site = get(record, ["Site Name", "Customer", "Location", "Order Name (Formula)"]) || `Site ${idx + 1}`;
    const city = get(record, ["City", "Job City"]);
    const state = get(record, ["State", "Job State"]);
    const region = [city, state].filter(Boolean).join(", ");
    const dueDate = get(record, ["Install Date", "Scheduled Date", "Date", "Target Date"]);
    const tech = get(record, ["Project Manager", "Technician", "Assigned To", "Installer"]);
    const status = get(record, ["Status", "Service Status", "Install Status"]) || "Scheduled";
    const type = get(record, ["Service Type", "Type"]) || kind;

    return {
      id: String(get(record, ["Record ID#", "Record ID", "ID"]) || idx + 1),
      site: String(site),
      region,
      dueDate,
      tech: tech ? String(tech) : "Unassigned",
      status: String(status),
      type: titleCase(String(type)),
    };
  });
}

function readErr(json, fallback) {
  return json?.error || fallback;
}

const TABLE_HEADER_STYLE = { textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid ${C.borderLight}`, fontSize: 11, color: C.text3, textTransform: 'uppercase' };
const TABLE_CELL_STYLE = { padding: '10px 12px', borderBottom: `1px solid ${C.borderLight}`, color: C.text1 };

export function DispatchModule() {
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
    const canLoad = installCfg.tableId && installCfg.reportId && serviceCfg.tableId && serviceCfg.reportId;
    if (!canLoad) {
      setLoadState("unconfigured");
      return;
    }

    async function loadBoth() {
      setLoadState("loading");
      setErrorMsg("");
      try {
        const installRoute = `/api/dispatch?kind=installations&tableId=${encodeURIComponent(installCfg.tableId)}&reportId=${encodeURIComponent(installCfg.reportId)}`;
        const serviceRoute = `/api/dispatch?kind=services&tableId=${encodeURIComponent(serviceCfg.tableId)}&reportId=${encodeURIComponent(serviceCfg.reportId)}`;

        const [installRes, serviceRes] = await Promise.all([fetch(installRoute), fetch(serviceRoute)]);
        const installJson = await installRes.json();
        const serviceJson = await serviceRes.json();

        if (!installRes.ok) throw new Error(readErr(installJson, "Failed to load installation report."));
        if (!serviceRes.ok) throw new Error(readErr(serviceJson, "Failed to load service report."));

        setInstallJobs(mapDispatchData(installJson, "installation"));
        setServiceJobs(mapDispatchData(serviceJson, "service"));
        setLoadState("loaded");
      } catch (err) {
        setErrorMsg(err.message || "Unable to load dispatch reports.");
        setLoadState("error");
      }
    }

    loadBoth();
  }, [installCfg, serviceCfg]);

  const combined = useMemo(() => {
    return [...installJobs, ...serviceJobs].sort((a, b) => {
      const ad = parseDate(a.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      const bd = parseDate(b.dueDate)?.getTime() || Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
  }, [installJobs, serviceJobs]);

  return <div style={{ padding: 32 }}>
    {showInstallSettings && <SettingsModal dashboardLabel="Dispatch Installations" initialTableId={installCfg.tableId} initialReportId={installCfg.reportId} onClose={() => setShowInstallSettings(false)} onSave={(s) => { saveModuleSettings("dispatch-installations", s); setInstallCfg(s); setShowInstallSettings(false); }} />}
    {showServiceSettings && <SettingsModal dashboardLabel="Dispatch Services" initialTableId={serviceCfg.tableId} initialReportId={serviceCfg.reportId} onClose={() => setShowServiceSettings(false)} onSave={(s) => { saveModuleSettings("dispatch-services", s); setServiceCfg(s); setShowServiceSettings(false); }} />}

    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
      <div><h1 style={{ margin: 0, color: C.text1 }}>Dispatch Planning</h1><p style={{ margin: "6px 0 0", color: C.text2, fontSize: 12 }}>Blend installation and service work to optimize field trips.</p></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowInstallSettings(true)}>Configure Install Report</button>
        <button onClick={() => setShowServiceSettings(true)}>Configure Service Report</button>
      </div>
    </div>

    {loadState === "unconfigured" && <p style={{ color: C.text2 }}>Configure both Quickbase reports to start dispatch planning.</p>}
    {loadState === "error" && <p style={{ color: C.danger }}>{errorMsg}</p>}
    {loadState === "loading" && <p style={{ color: C.text2 }}>Loading reports...</p>}

    {loadState === "loaded" && (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[['Installations', installJobs.length], ['Service Sites', serviceJobs.length], ['Combined Stops', combined.length], ['Unassigned', combined.filter(j => j.tech === 'Unassigned').length]].map(([label, value]) => (
            <div key={label} style={{ border: `1px solid ${C.borderLight}`, borderTop: `3px solid ${ACCENT}`, borderRadius: 10, padding: 12, background: C.card }}><div style={{ fontSize: 11, color: C.text3 }}>{label}</div><div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div></div>
          ))}
        </div>
        <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 10, overflow: 'hidden', background: C.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ background: C.surface }}><th style={TABLE_HEADER_STYLE}>Type</th><th style={TABLE_HEADER_STYLE}>Site</th><th style={TABLE_HEADER_STYLE}>Region</th><th style={TABLE_HEADER_STYLE}>Due</th><th style={TABLE_HEADER_STYLE}>Assigned</th><th style={TABLE_HEADER_STYLE}>Status</th></tr></thead>
            <tbody>
              {combined.map((job) => <tr key={`${job.type}-${job.id}`}><td style={TABLE_CELL_STYLE}>{job.type}</td><td style={TABLE_CELL_STYLE}>{job.site}</td><td style={TABLE_CELL_STYLE}>{job.region || '—'}</td><td style={TABLE_CELL_STYLE}>{job.dueDate || '—'}</td><td style={TABLE_CELL_STYLE}>{job.tech}</td><td style={TABLE_CELL_STYLE}>{job.status}</td></tr>)}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>;
}

