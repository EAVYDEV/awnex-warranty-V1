import { useState, useEffect, useRef } from "react";
import { T, STATUS_CFG, RISK_CFG } from "../lib/tokens.js";
import { fmtDate } from "../lib/qbUtils.js";

// ─── CITY COORDINATES CACHE ───────────────────────────────────────────────────
// Seed cache for known cities to avoid any Nominatim calls on first load.

const CITY_COORDS = {
  "san antonio texas":          [29.4241,  -98.4936],
  "broadview heights ohio":     [41.3131,  -81.6882],
  "winter garden florida":      [28.5650,  -81.5862],
  "north liberty iowa":         [41.7491,  -91.6046],
  "farmington missouri":        [37.7817,  -90.4218],
  "bowling green kentucky":     [36.9903,  -86.4436],
  "elkhorn wisconsin":          [42.6736,  -88.5443],
  "bridgeport michigan":        [43.3592,  -83.8810],
  "texarkana texas":            [33.4251,  -94.0477],
  "fayetteville west virginia": [38.0534,  -81.1043],
  "forsyth illinois":           [39.9289,  -88.9685],
  "leclaire iowa":              [41.5953,  -90.3487],
  "st. michael minnesota":      [45.2094,  -93.6663],
  "blue springs missouri":      [39.0169,  -94.2816],
  "omaha nebraska":             [41.2565,  -95.9345],
};

const GEOCACHE_KEY = "awntrak_geocache";

// ─── MAP VIEW ─────────────────────────────────────────────────────────────────
// Loads Leaflet from CDN at runtime (not bundled) to avoid SSR issues.

export function MapView({ orders }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  // null until first use — lazy-loaded from localStorage in the markers effect
  const geocacheRef  = useRef(null);
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.L);

  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const css = document.createElement("link");
    css.rel  = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src    = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => setReady(true);
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L   = window.L;
    const map = L.map(containerRef.current, {
      zoomControl:        true,
      zoomSnap:           0,      // continuous zoom — no snapping to integer levels
      zoomDelta:          0.5,    // smaller step per scroll notch for fine control
      wheelPxPerZoomLevel: 80,    // fewer pixels needed per zoom step (default 60, lower = faster)
      preferCanvas:       true,   // canvas renderer is faster with many markers
    }).setView([39.5, -98.35], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L   = window.L;
    const map = mapRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Lazy-init geocache: merge seed coords with any previously geocoded locations
    if (!geocacheRef.current) {
      try {
        const stored = localStorage.getItem(GEOCACHE_KEY);
        geocacheRef.current = { ...CITY_COORDS, ...(stored ? JSON.parse(stored) : {}) };
      } catch {
        geocacheRef.current = { ...CITY_COORDS };
      }
    }
    const cache = geocacheRef.current;

    function saveCache() {
      try { localStorage.setItem(GEOCACHE_KEY, JSON.stringify(cache)); } catch {}
    }

    function placeMarker(group, coords) {
      if (!mapRef.current) return;
      const os = group.orders;
      const worstStatus = os.some(o => o.status === "expired")
        ? "expired" : os.some(o => o.status === "expiring") ? "expiring" : "active";
      const cfg   = STATUS_CFG[worstStatus];
      const count = os.length;

      const icon = L.divIcon({
        html: count > 1
          ? `<div style="width:22px;height:22px;border-radius:50%;background:${cfg.dot};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;box-shadow:0 2px 5px rgba(0,0,0,0.35)">${count}</div>`
          : `<div style="width:14px;height:14px;border-radius:50%;background:${cfg.dot};border:2.5px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize:   count > 1 ? [22, 22] : [14, 14],
        iconAnchor: count > 1 ? [11, 11] : [7,  7],
      });

      const popupHtml = os.map((o, i) => {
        const c = STATUS_CFG[o.status];
        const r = RISK_CFG[o.risk || "low"];
        const sep = i < os.length - 1 ? "border-bottom:1px solid #E5E4E0;margin-bottom:8px;padding-bottom:8px;" : "";
        return `<div style="${sep}">
          <div style="font-weight:700;color:#0D3F72;font-size:13px">${o.orderNum} - ${o.brand}</div>
          <div style="font-size:11px;color:#636260;margin:2px 0 4px">${o.customer}</div>
          <div style="font-size:11px">PM: ${o.pm}</div>
          <div style="font-size:11px">Expires: ${fmtDate(o.warrantyEnd)}&nbsp;&nbsp;Claims: ${o.claims}</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">
            <span style="padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:${c.bg};color:${c.text};border:1px solid ${c.border}">${c.label} - ${Math.abs(o.days)}d ${o.status === "expired" ? "ago" : "left"}</span>
            <span style="padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:${r.bg};color:${r.text};border:1px solid ${r.border}">Risk: ${r.label} (${o.riskScore || 0}/100)</span>
          </div>
        </div>`;
      }).join("");

      const marker = L.marker(coords, { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:210px;max-width:270px">${popupHtml}</div>`,
          { maxWidth: 290 },
        );
      markersRef.current.push(marker);
    }

    // Group orders by location
    const byLoc = {};
    orders.forEach(o => {
      const k = o.location.toLowerCase().trim();
      if (!byLoc[k]) byLoc[k] = { location: o.location, orders: [] };
      byLoc[k].orders.push(o);
    });

    const uncached = [];
    Object.values(byLoc).forEach(group => {
      const key = group.location.toLowerCase().trim();
      if (cache[key]) {
        // Known location — place marker immediately, no network needed
        placeMarker(group, cache[key]);
      } else {
        uncached.push(group);
      }
    });

    // Geocode only the locations not yet in cache, sequentially at ≤1 req/sec
    // (Nominatim usage policy: max 1 request per second)
    const timers = [];
    uncached.forEach((group, i) => {
      const t = setTimeout(async () => {
        if (!mapRef.current) return;
        const key = group.location.toLowerCase().trim();
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(group.location + ", USA")}&format=json&limit=1`,
            { headers: { "User-Agent": "AwntrakWarrantyDashboard/1.0" } },
          );
          const data = await res.json();
          if (data[0]) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            cache[key] = coords;
            saveCache();
            placeMarker(group, coords);
          }
        } catch {}
      }, i * 1100);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [orders, ready]);

  return (
    <div style={{ background: T.card, borderRadius: 24, boxShadow: T.cardShadow, overflow: "hidden" }}>
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${T.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text1, margin: 0 }}>Warranty Locations</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {Object.entries(STATUS_CFG).map(([s, cfg]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: T.text2 }}>{cfg.label}</span>
            </div>
          ))}
          <span style={{ fontSize: 12, color: T.text3 }}>| {orders.length} orders shown</span>
        </div>
      </div>

      {!ready
        ? (
          <div style={{ height: 460, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: T.bg }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 16, height: 16, border: `2px solid ${T.brandSoft}`, borderTopColor: T.brand, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 13, color: T.text2 }}>Loading map…</span>
          </div>
        )
        : <div ref={containerRef} style={{ height: 460 }} />
      }

      <div style={{ padding: "9px 20px", borderTop: `1px solid ${T.borderLight}`, background: T.surface }}>
        <span style={{ fontSize: 11, color: T.text3 }}>
          Click any pin to view order details. Stacked locations show a count badge.
        </span>
      </div>
    </div>
  );
}
