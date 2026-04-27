// ─── SETTINGS API ─────────────────────────────────────────────────────────────
// Server-side storage for dashboard configuration using Vercel KV (Redis).
// Requires KV_REST_API_URL and KV_REST_API_TOKEN environment variables.
// When those vars are absent (local dev without KV) GET returns {} so the
// dashboard silently falls back to localStorage.

import { kv } from "@vercel/kv";

const KEY = "awntrak_settings";

const KV_CONFIGURED =
  Boolean(process.env.KV_REST_API_URL) &&
  Boolean(process.env.KV_REST_API_TOKEN);

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!KV_CONFIGURED) return res.status(200).json({});
    try {
      const data = await kv.get(KEY);
      return res.status(200).json(data ?? {});
    } catch (err) {
      return res.status(200).json({}); // fall back silently
    }
  }

  if (req.method === "POST") {
    if (!KV_CONFIGURED) {
      return res.status(503).json({ error: "KV storage not configured. Add KV_REST_API_URL and KV_REST_API_TOKEN to your environment." });
    }
    try {
      await kv.set(KEY, req.body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: String(err.message) });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
