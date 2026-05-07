import { useMemo, useState, useEffect } from "react";
import { colors, shadows } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";

const C = colors;
const ACCENT = 'var(--t-teal)';
const HERO_GRADIENT = "linear-gradient(115deg, var(--t-brand-deep) 0%, var(--t-brand) 60%, var(--t-brand-light) 100%)";

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

function StatChip({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: 6, padding: "12px 18px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 6, padding: "14px 16px", background: C.card, boxShadow: shadows.card, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 10, color: C.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.35 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

const TABLE_HEADER_STYLE = {
  textAlign: 'left', padding: '10px 12px',
  borderBottom: `1px solid ${C.borderLight}`,
  fontSize: 11, color: C.text3,
  textTransform: 'uppercase', fontWeight: 700,
  letterSpacing: '0.06em',
};
const TABLE_CELL_STYLE = {
  padding: '10px 12px',
  borderBottom: `1px solid ${C.borderLight}`,
  color: C.text1, fontSize: 12,
};

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

  const unassigned = combined.filter(j => j.tech === "Unassigned").length;

  return (
    <div style={{ padding: "20px 24px 48px" }}>
      {showInstallSettings && (
        <SettingsModal
          dashboardLabel="Dispatch Installations"
          initialTableId={installCfg.tableId}
          initialReportId={installCfg.reportId}
          onClose={() => setShowInstallSettings(false)}
          onSave={(s) => { saveModuleSettings("dispatch-installations", s); setInstallCfg(s); setShowInstallSettings(false); }}
        />
      )}
      {showServiceSettings && (
        <SettingsModal
          dashboardLabel="Dispatch Services"
          initialTableId={serviceCfg.tableId}
          initialReportId={serviceCfg.reportId}
          onClose={() => setShowServiceSettings(false)}
          onSave={(s) => { saveModuleSettings("dispatch-services", s); setServiceCfg(s); setShowServiceSettings(false); }}
        />
      )}

      {/* Hero Banner */}
      <div style={{ background: HERO_GRADIENT, borderRadius: 13, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ position: "absolute", right: 180, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", right: 220, bottom: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: 0 }}>Dispatch Planning</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500, maxWidth: 380, margin: "6px 0 0" }}>Blend installation and service work orders to plan and optimize technician field trips.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "#fff", color: "var(--t-brand)" }}>Installations</button>
            <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.15)", color: "#fff" }}>Services</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <StatChip label="Installations" value={loadState === "loaded" ? String(installJobs.length) : "—"} sub="Scheduled jobs" />
          <StatChip label="Service Sites" value={loadState === "loaded" ? String(serviceJobs.length) : "—"} sub="Work orders" />
          <StatChip label="Unassigned" value={loadState === "loaded" ? String(unassigned) : "—"} sub="Need technician" />
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowInstallSettings(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Install Report
        </button>
        <button onClick={() => setShowServiceSettings(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Service Report
        </button>
      </div>

      {loadState === "unconfigured" && (
        <div style={{ background: ACCENT + "12", border: `1px dashed ${ACCENT}`, borderRadius: 8, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>Reports not configured</p>
            <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Configure both Quickbase reports above to start dispatch planning.</p>
          </div>
        </div>
      )}
      {loadState === "error" && (
        <div style={{ background: C.dangerSubtle, border: `1px solid ${C.danger}`, borderRadius: 8, padding: "16px 20px", marginBottom: 24, color: C.dangerText, fontSize: 13, fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}
      {loadState === "loading" && (
        <div style={{ padding: "32px 0", textAlign: "center", color: C.text2, fontSize: 13 }}>Loading reports…</div>
      )}

      {loadState === "loaded" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px, 1fr))", gap: 14, marginBottom: 24 }}>
            <KpiCard label="Installations"   value={installJobs.length}  accent={ACCENT} />
            <KpiCard label="Service Sites"   value={serviceJobs.length}  accent={C.brand} />
            <KpiCard label="Combined Stops"  value={combined.length}     accent={C.success} />
            <KpiCard label="Unassigned"      value={unassigned}          accent={C.danger} />
          </div>

          <div style={{ border: `1px solid ${C.borderLight}`, borderRadius: 8, overflow: "hidden", background: C.card, boxShadow: shadows.card }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Combined Schedule</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: C.surface }}>
                    <th style={TABLE_HEADER_STYLE}>Type</th>
                    <th style={TABLE_HEADER_STYLE}>Site</th>
                    <th style={TABLE_HEADER_STYLE}>Region</th>
                    <th style={TABLE_HEADER_STYLE}>Due</th>
                    <th style={TABLE_HEADER_STYLE}>Assigned</th>
                    <th style={TABLE_HEADER_STYLE}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {combined.map((job, i) => (
                    <tr key={`${job.type}-${job.id}`} style={{ borderBottom: i < combined.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                      <td style={TABLE_CELL_STYLE}>{job.type}</td>
                      <td style={TABLE_CELL_STYLE}>{job.site}</td>
                      <td style={{ ...TABLE_CELL_STYLE, color: C.text2 }}>{job.region || "—"}</td>
                      <td style={{ ...TABLE_CELL_STYLE, color: C.text2, whiteSpace: "nowrap" }}>{job.dueDate || "—"}</td>
                      <td style={{ ...TABLE_CELL_STYLE, color: job.tech === "Unassigned" ? C.danger : C.text1, fontWeight: job.tech === "Unassigned" ? 700 : 400 }}>{job.tech}</td>
                      <td style={TABLE_CELL_STYLE}>{job.status}</td>
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
