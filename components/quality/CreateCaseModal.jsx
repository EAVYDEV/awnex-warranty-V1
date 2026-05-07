import { useState } from "react";

const defaultCase = {
  title: "",
  description: "",
  severity: "Medium",
  scope: "Single Item",
  detectionRisk: "Known Extent",
  department: "Quality",
  owner: "",
  reportedBy: "",
  fieldImpact: false,
  customerImpact: false,
  safetyImpact: false,
};

export default function CreateCaseModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(defaultCase);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">Create Quality Case</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ["title", "Title"], ["description", "Description"], ["department", "Department"], ["reportedBy", "Reported By"], ["owner", "Owner"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm text-slate-700">
              {label}
              <input className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1" value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
            </label>
          ))}
          {["severity", "scope", "detectionRisk"].map((key) => (
            <label key={key} className="text-sm text-slate-700">
              {key}
              <select className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1" value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}>
                {(key === "severity" ? ["Low", "Medium", "High", "Critical"] : key === "scope" ? ["Single Item", "Batch", "Multiple Orders", "Unknown"] : ["Known Extent", "Partially Known", "Unknown Extent"]).map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          {["fieldImpact", "customerImpact", "safetyImpact"].map((flag) => (
            <label key={flag} className="flex items-center gap-2">
              <input type="checkbox" checked={form[flag]} onChange={(e) => setForm((p) => ({ ...p, [flag]: e.target.checked }))} />
              {flag}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Cancel</button>
          <button onClick={() => { onCreate(form); setForm(defaultCase); }} className="rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white">Create</button>
        </div>
      </div>
    </div>
  );
}
