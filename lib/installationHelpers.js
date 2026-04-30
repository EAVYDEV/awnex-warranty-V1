import { INSTALL_STATUSES } from "./installationData";

export function groupJobsByStatus(jobs) {
  const grouped = Object.fromEntries(INSTALL_STATUSES.map((s) => [s, []]));
  jobs.forEach((job) => {
    const key = INSTALL_STATUSES.includes(job.status) ? job.status : "Scheduled";
    grouped[key].push(job);
  });
  return grouped;
}

export function filterJobs(jobs, filters = {}) {
  return jobs.filter((job) => {
    if (filters.status && filters.status !== "all" && job.status !== filters.status) return false;
    if (filters.crew && filters.crew !== "all" && job.crew !== filters.crew) return false;
    if (filters.region && filters.region !== "all" && job.state !== filters.region) return false;
    if (filters.pm && filters.pm !== "all" && job.projectManager !== filters.pm) return false;
    return true;
  });
}

export function getKpiMetrics(jobs) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return {
    activeJobs: jobs.filter((j) => j.status !== "Complete").length,
    inProgress: jobs.filter((j) => j.status === "In Progress").length,
    qcRequired: jobs.filter((j) => j.status === "QC Required" || /required/i.test(j.qcStatus)).length,
    completedThisWeek: jobs.filter((j) => j.status === "Complete" && j.endDate && new Date(j.endDate) >= weekAgo).length,
  };
}
