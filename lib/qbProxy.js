// Factory that creates an identical Next.js API handler for every QB-backed module.
// Usage:
//   import { createQBHandler } from '../../lib/qbProxy.js';
//   export default createQBHandler({ tableEnv: 'QB_TABLE_ID', reportEnv: 'QB_REPORT_ID', label: 'warranty' });

const QB_ID_RE = /^[A-Za-z0-9_-]+$/;

export function createQBHandler({
  tableEnv  = 'QB_TABLE_ID',
  reportEnv = 'QB_REPORT_ID',
  label     = 'module',
} = {}) {
  return async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { QB_REALM, QB_TOKEN } = process.env;
    const tableId  = req.query.tableId  || process.env[tableEnv];
    const reportId = req.query.reportId || process.env[reportEnv];

    if (!QB_REALM || !QB_TOKEN) {
      return res.status(503).json({
        error: 'Quickbase credentials not configured. Set QB_REALM and QB_TOKEN in your environment.',
      });
    }

    if (!tableId || !reportId) {
      return res.status(400).json({
        error: `Table ID and Report ID are required. Configure them in the ${label} module settings.`,
      });
    }

    if (!QB_ID_RE.test(tableId) || !QB_ID_RE.test(reportId)) {
      return res.status(400).json({ error: 'Invalid Table ID or Report ID format.' });
    }

    try {
      const qbRes = await fetch(
        `https://api.quickbase.com/v1/reports/${reportId}/run?tableId=${tableId}`,
        {
          method:  'POST',
          headers: {
            'QB-Realm-Hostname': QB_REALM,
            'Authorization':     `QB-USER-TOKEN ${QB_TOKEN}`,
            'Content-Type':      'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const payload = await qbRes.json();

      if (!qbRes.ok) {
        console.error(`Quickbase error (${label})`, qbRes.status, payload);
        return res.status(502).json({ error: `Failed to fetch ${label} data from Quickbase.` });
      }

      return res.status(200).json(payload);
    } catch (err) {
      console.error(`${label} proxy error:`, err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  };
}
