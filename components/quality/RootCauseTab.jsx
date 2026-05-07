const factors = ["People", "Process", "Equipment", "Material", "Environment", "Design", "Supplier", "Training", "Documentation", "Inspection"];

export default function RootCauseTab({ caseRecord, onUpdate }) {
  const rca = caseRecord.rca || {};
  const setRca = (key, value) => onUpdate({ ...caseRecord, rca: { ...rca, [key]: value }, rootCauseSummary: key === "verifiedRootCause" ? value : caseRecord.rootCauseSummary, verifiedRootCause: key === "verifiedRootCause" ? value : caseRecord.verifiedRootCause });

  return (
    <div className="space-y-3 text-sm">
      <label className="block">Problem Statement<textarea rows={2} className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={rca.problemStatement || ""} onChange={(e) => setRca("problemStatement", e.target.value)} /></label>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {[1, 2, 3, 4, 5].map((n) => <label key={n}>Why {n}<input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={rca[`why${n}`] || ""} onChange={(e) => setRca(`why${n}`, e.target.value)} /></label>)}
      </div>
      <div><p className="mb-1 font-medium">Contributing Factors</p><div className="flex flex-wrap gap-2">{factors.map((f) => <label key={f} className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1"><input type="checkbox" checked={(rca.contributingFactors || []).includes(f)} onChange={(e) => setRca("contributingFactors", e.target.checked ? [...(rca.contributingFactors || []), f] : (rca.contributingFactors || []).filter((x) => x !== f))} />{f}</label>)}</div></div>
      <label className="block">Suspected Root Cause<input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={(rca.suspectedRootCauses || []).join("; ")} onChange={(e) => setRca("suspectedRootCauses", e.target.value.split(";").map((x) => x.trim()).filter(Boolean))} /></label>
      <label className="block">Verified Root Cause<textarea rows={2} className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={rca.verifiedRootCause || ""} onChange={(e) => setRca("verifiedRootCause", e.target.value)} /></label>
      <label className="block">Root Cause Verification<select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={rca.rootCauseVerificationStatus || "Not Yet Verified"} onChange={(e) => setRca("rootCauseVerificationStatus", e.target.value)}><option>Verified</option><option>Not Yet Verified</option></select></label>
    </div>
  );
}
