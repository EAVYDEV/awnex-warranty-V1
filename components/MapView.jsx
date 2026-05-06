import { useState, useEffect, useRef } from "react";
import { T, STATUS_CFG, RISK_CFG } from "../lib/tokens.js";
import { fmtDate } from "../lib/qbUtils.js";

// ─── CITY COORDINATES CACHE ───────────────────────────────────────────────────
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

const GEOCACHE_KEY  = "awntrak_geocache";
// Max Nominatim requests per map load. Nominatim ToS: ≤1 req/s.
// Each request takes ~1.1 s, so 30 = ~33 s worst-case for a cold cache.
const GEOCODE_LIMIT = 30;

// ─── CDN LOADER ───────────────────────────────────────────────────────────────
function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const el = document.createElement("link");
  el.rel  = "stylesheet";
  el.href = href;
  document.head.appendChild(el);
}

function loadScript(src) {
  return new Promise(resolve => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const el    = document.createElement("script");
    el.src      = src;
    el.onload   = resolve;
    document.head.appendChild(el);
  });
}

// ─── MAP VIEW ─────────────────────────────────────────────────────────────────
// Loads Leaflet + Leaflet.markercluster from CDN at runtime (avoids SSR issues).
// Clustering keeps the DOM node count low regardless of total marker count,
// which is the primary performance fix for 500+ records.

export function MapView({ orders }) {
  const containerRef    = useRef(null);
  const mapRef          = useRef(null);
  const clusterRef      = useRef(null);   // L.markerClusterGroup
  const geocacheRef     = useRef(null);
  const [ready, setReady]               = useState(
    typeof window !== "undefined" && !!window.L && !!window.L.MarkerClusterGroup
  );
  const [geocodeSkipped, setGeocodeSkipped] = useState(0);

  // ── Load Leaflet + markercluster from CDN ────────────────────────────────
  useEffect(() => {
    if (window.L?.MarkerClusterGroup) { setReady(true); return; }
    loadCss("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css");
    loadCss("https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css");
    loadCss("https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css");
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js")
      .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.min.js"))
      .then(() => setReady(true));
  }, []);

  // ── Initialise map once Leaflet is ready ─────────────────────────────────
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L   = window.L;
    const map = L.map(containerRef.current, {
      zoomControl:         true,
      zoomSnap:            0,    // continuous zoom — no snapping to integer levels
      zoomDelta:           0.5,  // smaller step per scroll notch for fine control
      wheelPxPerZoomLevel: 80,   // fewer pixels needed per zoom step (default 60, lower = faster)
      preferCanvas:        true, // canvas renderer is faster with many markers
    }).setView([39.5, -98.35], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Cluster group: collapses nearby pins into a single node in the DOM at
    // each zoom level. Only ~10–20 elements are rendered at any given time,
    // regardless of how many total markers exist.
    const cluster = L.markerClusterGroup({
      maxClusterRadius:      60,
      spiderfyOnMaxZoom:     true,
      showCoverageOnHover:   false,
      zoomToBoundsOnClick:   true,
      disableClusteringAtZoom: 11,
    });
    map.addLayer(cluster);
    mapRef.current     = map;
    clusterRef.current = cluster;
    return () => { map.remove(); mapRef.current = null; clusterRef.current = null; };
  }, [ready]);

  // ── Place / refresh markers whenever orders change ────────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current || !clusterRef.current) return;
    const L       = window.L;
    const cluster = clusterRef.current;

    // Clear previous markers — clearLayers() is O(n) but avoids individual remove() calls
    cluster.clearLayers();

    // Lazy-init geocache from localStorage, merged with seed coords
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
      if (!mapRef.current || !clusterRef.current) return;
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
        const c   = STATUS_CFG[o.status];
        const r   = RISK_CFG[o.risk || "low"];
        const sep = i < os.length - 1
          ? "border-bottom:1px solid #E5E4E0;margin-bottom:8px;padding-bottom:8px;" : "";
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

      // Add to the cluster group — Leaflet.markercluster handles DOM management
      cluster.addLayer(
        L.marker(coords, { icon }).bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:210px;max-width:270px">${popupHtml}</div>`,
          { maxWidth: 290 },
        )
      );
    }

    // Group orders by location string so co-located orders share one pin.
    // Capture QB-stored coordinates (Latitude / Longitude fields) from the
    // first order in each group that has them — these skip geocoding entirely.
    const byLoc = {};
    orders.forEach(o => {
      const k = o.location.toLowerCase().trim();
      if (!byLoc[k]) byLoc[k] = { location: o.location, orders: [], qbCoords: null };
      byLoc[k].orders.push(o);
      if (!byLoc[k].qbCoords) {
        const lat = parseFloat(o._qbFields?.["Latitude"]);
        const lng = parseFloat(o._qbFields?.["Longitude"]);
        if (!isNaN(lat) && !isNaN(lng)) byLoc[k].qbCoords = [lat, lng];
      }
    });

    const uncached = [];
    Object.values(byLoc).forEach(group => {
      if (group.qbCoords) {
        // QB provided coordinates — instant, no network call needed
        placeMarker(group, group.qbCoords);
      } else {
        const key = group.location.toLowerCase().trim();
        if (cache[key]) {
          placeMarker(group, cache[key]);
        } else {
          uncached.push(group);
        }
      }
    });

    // Cap Nominatim requests to GEOCODE_LIMIT per load (ToS: ≤1 req/s).
    // Locations beyond the cap are skipped; they will be resolved on future loads
    // once earlier results have been persisted to localStorage.
    const toGeocode = uncached.slice(0, GEOCODE_LIMIT);
    setGeocodeSkipped(Math.max(0, uncached.length - GEOCODE_LIMIT));

    const timers = [];
    toGeocode.forEach((group, i) => {
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
    <div style={{ background: T.bgCard, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 8,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>Warranty Locations</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {Object.entries(STATUS_CFG).map(([s, cfg]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: T.textSec }}>{cfg.label}</span>
            </div>
          ))}
          <span style={{ fontSize: 12, color: T.textMuted }}>| {orders.length} orders shown</span>
        </div>
      </div>

      {!ready
        ? (
          <div style={{ height: 460, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: T.bgApp }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ width: 16, height: 16, border: `2px solid ${T.brandSoft}`, borderTopColor: T.brand, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 13, color: T.textSec }}>Loading map…</span>
          </div>
        )
        : <div ref={containerRef} style={{ height: 460 }} />
      }

      <div style={{ padding: "9px 20px", borderTop: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11, color: T.textMuted }}>
          Click any pin to view order details. Zoom in or click a cluster to expand.
        </span>
        {geocodeSkipped > 0 && (
          <span style={{ fontSize: 11, color: T.warningText, background: T.warningFill, padding: "2px 8px", borderRadius: 6 }}>
            {geocodeSkipped} location{geocodeSkipped > 1 ? "s" : ""} not yet geocoded — will appear on next load
          </span>
        )}
      </div>
    </div>
  );
}
