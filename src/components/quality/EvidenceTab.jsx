const evidenceTypes = ["Photo", "Inspection Report", "Customer Complaint", "Email", "Drawing", "Work Instruction", "Supplier Document", "Test Result", "Other"];
const phases = ["Intake", "Risk Assessment", "Containment", "RCA", "CAPA", "Field Impact", "Closure"];

export default function EvidenceTab({ caseRecord, onUpdate }) {
  const updateItem = (idx, key, value) => {
    const next = caseRecord.evidenceItems.map((item, i) => (i === idx ? { ...item, [key]: value } : item));
    onUpdate({ ...caseRecord, evidenceItems: next });
  };

  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50"><tr>{["Evidence Type", "Description", "Uploaded By", "Upload Date", "Related Phase", "File Link"].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
        <tbody>
          {caseRecord.evidenceItems.map((item, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-2 py-1"><select className="rounded border border-slate-300 px-1" value={item.evidenceType} onChange={(e) => updateItem(idx, "evidenceType", e.target.value)}>{evidenceTypes.map((v) => <option key={v}>{v}</option>)}</select></td>
              <td className="px-2 py-1"><input className="w-40 rounded border border-slate-300 px-1" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} /></td>
              <td className="px-2 py-1"><input className="w-24 rounded border border-slate-300 px-1" value={item.uploadedBy} onChange={(e) => updateItem(idx, "uploadedBy", e.target.value)} /></td>
              <td className="px-2 py-1"><input type="date" className="rounded border border-slate-300 px-1" value={item.uploadDate} onChange={(e) => updateItem(idx, "uploadDate", e.target.value)} /></td>
              <td className="px-2 py-1"><select className="rounded border border-slate-300 px-1" value={item.relatedPhase} onChange={(e) => updateItem(idx, "relatedPhase", e.target.value)}>{phases.map((v) => <option key={v}>{v}</option>)}</select></td>
              <td className="px-2 py-1"><input className="w-48 rounded border border-slate-300 px-1" value={item.fileLink || ""} onChange={(e) => updateItem(idx, "fileLink", e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
