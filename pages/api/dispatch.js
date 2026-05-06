export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { QB_REALM, QB_TOKEN } = process.env;
  const { tableId, reportId } = req.query;

  if (!QB_REALM || !QB_TOKEN) {
    return res.status(503).json({ error: "Quickbase credentials not configured. Set QB_REALM and QB_TOKEN." });
  }

  if (!tableId || !reportId) {
    return res.status(400).json({ error: "Table ID and Report ID are required." });
  }

  const QB_ID_RE = /^[A-Za-z0-9_-]+$/;
  if (!QB_ID_RE.test(tableId) || !QB_ID_RE.test(reportId)) {
    return res.status(400).json({ error: "Invalid Table ID or Report ID format." });
  }

  try {
    const qbRes = await fetch(`https://api.quickbase.com/v1/reports/${reportId}/run?tableId=${tableId}`, {
      method: "POST",
      headers: {
        "QB-Realm-Hostname": QB_REALM,
        "Authorization": `QB-USER-TOKEN ${QB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const payload = await qbRes.json();
    if (!qbRes.ok) return res.status(502).json({ error: "Failed to fetch dispatch data from Quickbase.", details: payload });
    return res.status(200).json(payload);
  } catch (err) {
    console.error("dispatch proxy error", err);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
}
