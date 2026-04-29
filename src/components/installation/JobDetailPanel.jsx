export function JobDetailPanel({ job, onClose }) {
  if (!job) return null;
  const section = (title, text) => <div><h4 className="text-sm font-semibold">{title}</h4><p className="text-xs text-slate-600">{text}</p></div>;
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l bg-white p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{job.jobName}</h3><button onClick={onClose}>✕</button></div>
      <div className="space-y-4 overflow-y-auto">
        {section("Overview", `${job.location}, ${job.city}, ${job.state}`)}
        {section("Timeline", `${job.startDate || "-"} → ${job.endDate || "-"}`)}
        {section("Crew", job.crew)}
        {section("Equipment", `Rentals/status: ${job.equipmentStatus}`)}
        {section("QC", `Punchlist: ${job.qcStatus}. Face check flag: placeholder.`)}
        {section("Reports", "Photos/docs placeholder." )}
        {section("Future Hooks", "Mobile reporting, photo uploads, QC task linking placeholders are ready.")}
      </div>
    </div>
  );
}
