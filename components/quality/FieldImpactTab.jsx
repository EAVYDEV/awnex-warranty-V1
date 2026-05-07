const verificationValues = ["Not Reviewed", "Potentially Affected", "Confirmed Affected", "Confirmed Not Affected", "Unknown"];

export default function FieldImpactTab({ caseRecord, onUpdate }) {
  const setValue = (key, value) => onUpdate({ ...caseRecord, [key]: value });
  const review = caseRecord.fieldImpactReview || {};

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {["fieldImpactReviewRequired", "potentiallyShippedProduct", "potentiallyInstalledProduct", "customerNotificationNeeded"].map((f) => (
          <label key={f} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(review[f])} onChange={(e) => setValue("fieldImpactReview", { ...review, [f]: e.target.checked })} />{f}</label>
        ))}
        {["geographicSpread", "warrantyExposure", "reviewOwner", "reviewStatus"].map((f) => (
          <label key={f}>{f}<input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={review[f] || ""} onChange={(e) => setValue("fieldImpactReview", { ...review, [f]: e.target.value })} /></label>
        ))}
      </div>
      <label className="block">Summary of Exposure<textarea rows={2} className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={review.summaryOfExposure || ""} onChange={(e) => setValue("fieldImpactReview", { ...review, summaryOfExposure: e.target.value })} /></label>
      <h4 className="font-semibold">Affected Orders</h4>
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full text-xs"><thead className="bg-slate-50"><tr>{["Order Number", "Customer", "Location", "Ship Date", "Install Status", "Suspected Impact", "Verification Status", "Notes"].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
          <tbody>{caseRecord.affectedOrders.map((o, i) => <tr key={i} className="border-t"><td className="px-2 py-1">{o.orderNumber}</td><td className="px-2 py-1">{o.customer}</td><td className="px-2 py-1">{o.location}</td><td className="px-2 py-1">{o.shipDate}</td><td className="px-2 py-1">{o.installStatus}</td><td className="px-2 py-1">{o.suspectedImpact}</td><td className="px-2 py-1"><select className="rounded border border-slate-300 px-1" value={o.verificationStatus} onChange={(e) => setValue("affectedOrders", caseRecord.affectedOrders.map((x, idx) => idx === i ? { ...x, verificationStatus: e.target.value } : x))}>{verificationValues.map((v) => <option key={v}>{v}</option>)}</select></td><td className="px-2 py-1">{o.notes}</td></tr>)}</tbody></table>
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(caseRecord.fieldImpactLeadershipAcceptedUncertainty)} onChange={(e) => setValue("fieldImpactLeadershipAcceptedUncertainty", e.target.checked)} />Leadership accepted documented residual uncertainty</label>
      <label>Field Impact Review Status<select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={caseRecord.fieldImpactReviewStatus || "In Progress"} onChange={(e) => setValue("fieldImpactReviewStatus", e.target.value)}><option>Not Started</option><option>In Progress</option><option>Complete</option></select></label>
    </div>
  );
}
