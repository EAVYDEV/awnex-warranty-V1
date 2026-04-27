export default function CaseSummaryTab({ caseRecord }) {
  const daysOpen = Math.max(0, Math.floor((Date.now() - new Date(caseRecord.dateReported).getTime()) / (1000 * 60 * 60 * 24)));
  const openActions = (caseRecord.capaActions || []).filter((a) => !["Complete", "Verified"].includes(a.status)).length;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-lg border border-slate-200 p-3"><h4 className="font-semibold">Issue Summary</h4><p className="mt-2 text-sm text-slate-700">{caseRecord.description}</p></div>
      <div className="rounded-lg border border-slate-200 p-3"><h4 className="font-semibold">Current Risk</h4><p className="mt-2 text-sm">Score {caseRecord.riskScore} • Level {caseRecord.riskLevel}</p></div>
      <div className="rounded-lg border border-slate-200 p-3"><h4 className="font-semibold">Open Actions</h4><p className="mt-2 text-sm">{openActions} CAPA actions open</p></div>
      <div className="rounded-lg border border-slate-200 p-3"><h4 className="font-semibold">Linked Orders</h4><p className="mt-2 text-sm">{(caseRecord.affectedOrders || []).length} affected orders</p></div>
      <div className="rounded-lg border border-slate-200 p-3 md:col-span-2"><p className="text-sm text-slate-700">Days Open: {daysOpen} • Affected Orders: {(caseRecord.affectedOrders || []).length} • Field Impact: {caseRecord.fieldImpact ? "Yes" : "No"}</p></div>
    </div>
  );
}
