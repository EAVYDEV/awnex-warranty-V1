// pages/api/warranty-orders.js
// Proxies the Quickbase report run call so credentials never leave the server.
//
// Vercel environment variables (set these in your Vercel project settings):
//   QB_REALM      awnexinc.quickbase.com
//   QB_TOKEN      your Quickbase user token
//
// Optional env var fallbacks (can be overridden per-request via query params):
//   QB_TABLE_ID   default table ID if not passed as ?tableId=
//   QB_REPORT_ID  default report ID if not passed as ?reportId=
//
// Query parameters accepted (set via the dashboard settings modal):
//   ?tableId=bkvhg2rwk
//   ?reportId=12345
//
// App Router equivalent (app/api/warranty-orders/route.js):
//
//   import { NextResponse } from "next/server";
//   export async function GET(req) {
//     const { QB_REALM, QB_TOKEN, QB_TABLE_ID, QB_REPORT_ID } = process.env;
//     const { searchParams } = new URL(req.url);
//     const tableId  = searchParams.get("tableId")  || QB_TABLE_ID;
//     const reportId = searchParams.get("reportId") || QB_REPORT_ID;
//     if (!QB_REALM || !QB_TOKEN || !tableId || !reportId) {
//       return NextResponse.json({ error: "QB credentials not fully configured." }, { status: 503 });
//     }
//     const res = await fetch(
//       `https://api.quickbase.com/v1/reports/${reportId}/run?tableId=${tableId}`,
//       { method: "POST", headers: { "QB-Realm-Hostname": QB_REALM, "Authorization": `QB-USER-TOKEN ${QB_TOKEN}`, "Content-Type": "application/json" }, body: "{}" }
//     );
//     const data = await res.json();
//     return NextResponse.json(data, { status: res.ok ? 200 : res.status });
//   }

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { QB_REALM, QB_TOKEN, QB_TABLE_ID, QB_REPORT_ID } = process.env;

  // tableId and reportId can come from query params (set by the settings modal)
  // or fall back to environment variables.
  const tableId  = req.query.tableId  || QB_TABLE_ID;
  const reportId = req.query.reportId || QB_REPORT_ID;

  if (!QB_REALM || !QB_TOKEN) {
    return res.status(503).json({
      error:
        "Quickbase credentials not configured. " +
        "Set QB_REALM and QB_TOKEN in your Vercel environment variables.",
    });
  }

  if (!tableId || !reportId) {
    return res.status(400).json({
      error:
        "Table ID and Report ID are required. " +
        "Enter them in the dashboard settings modal, or set QB_TABLE_ID and QB_REPORT_ID in Vercel.",
    });
  }

  try {
    const qbRes = await fetch(
      `https://api.quickbase.com/v1/reports/${reportId}/run?tableId=${tableId}`,
      {
        method: "POST",
        headers: {
          "QB-Realm-Hostname": QB_REALM,
          "Authorization": `QB-USER-TOKEN ${QB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    const payload = await qbRes.json();

    if (!qbRes.ok) {
      return res.status(qbRes.status).json({
        error: `Quickbase returned ${qbRes.status}: ${qbRes.statusText}`,
        detail: payload,
      });
    }

    // Forward QB response as-is; the client maps it via mapQBResponse()
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
