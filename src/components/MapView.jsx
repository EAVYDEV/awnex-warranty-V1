import { useEffect, useRef, useState } from "react";
import { CITY_COORDS, RISK_CFG, STATUS_CFG, T } from "../lib/dashboardDefaults";
import { fmtDate } from "../lib/dashboardMetrics";

export function MapView({ orders }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const markersRef     = useRef([]);
  const geocacheRef    = useRef({ ...CITY_COORDS });
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.L);

  // Load Leaflet from CDN once
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => setReady(true);
    document.head.appendChild(js);
  }, []);

  // Initialize map once Leaflet is ready
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([39.5, -98.35], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [ready]);

  // Re-plot markers whenever filtered orders change
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    async function geocode(location) {
      const key = location.toLowerCase().trim();
      if (geocacheRef.current[key]) return geocacheRef.current[key];
      try {
        await new Promise(r => setTimeout(r, 300));
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ", USA")}&format=json&limit=1`,
          { headers: { "User-Agent": "AwntrakWarrantyDashboard/1.0" } }
        );
        const data = await res.json();
        if (data[0]) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          geocacheRef.current[key] = coords;
          return coords;
        }
      } catch {}
      return null;
    }

    // Group by location so stacked orders share one pin with a count badge
    const byLoc = {};
    orders.forEach(o => {
      const k = o.location.toLowerCase().trim();
      if (!byLoc[k]) byLoc[k] = { location: o.location, orders: [] };
      byLoc[k].orders.push(o);
    });

    let delay = 0;
    Object.values(byLoc).forEach(group => {
      setTimeout(async () => {
        if (!mapRef.current) return;
        const coords = await geocode(group.location);
        if (!coords || !mapRef.current) return;
        const os = group.orders;
        const worstStatus = os.some(o => o.status === "expired")
          ? "expired" : os.some(o => o.status === "expiring") ? "expiring" : "active";
        const cfg = STATUS_CFG[worstStatus];
        const count = os.length;

        const icon = L.divIcon({
          html: count > 1
            ? `<div style="width:22px;height:22px;border-radius:50%;background:${cfg.dot};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;box-shadow:0 2px 5px rgba(0,0,0,0.35)">${count}</div>`
            : `<div style="width:14px;height:14px;border-radius:50%;background:${cfg.dot};border:2.5px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize:   count > 1 ? [22, 22] : [14, 14],
          iconAnchor: count > 1 ? [11, 11] : [7, 7],
        });

        const popupHtml = os.map((o, i) => {
          const c = STATUS_CFG[o.status];
          const r = RISK_CFG[o.risk || "low"];
          const sep = i < os.length - 1 ? `border-bottom:1px solid #E5E4E0;margin-bottom:8px;padding-bottom:8px;` : "";
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
          .bindPopup(`<div style="font-family:'DM Sans',system-ui,sans-serif;min-width:210px;max-width:270px">${popupHtml}</div>`, { maxWidth: 290 });
        markersRef.current.push(marker);
      }, delay);
      delay += 320;
    });
  }, [orders, ready]);

  return (
    <div style={{ background: T.bgCard, borderRadius: 12, boxShadow: T.cardShadow, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>Warranty Locations</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {Object.entries(STATUS_CFG).map(([s, cfg]) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.textSec }}>{cfg.label}</span>
            </div>
          ))}
          <span style={{ fontSize: 12, color: T.textMuted }}>|&nbsp; {orders.length} orders shown</span>
        </div>
      </div>
      {!ready
        ? <div style={{ height: 460, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: T.bgApp }}>
            <div style={{ width: 16, height: 16, border: `2px solid ${T.brandSoft}`, borderTopColor: T.brand, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 13, color: T.textSec }}>Loading map...</span>
          </div>
        : <div ref={containerRef} style={{ height: 460 }} />
      }
      <div style={{ padding: "9px 20px", borderTop: `1px solid ${T.border}`, background: "#FAFAF8" }}>
        <span style={{ fontSize: 11, color: T.textMuted }}>Click any pin to view order details. Stacked locations show a count badge.</span>
      </div>
    </div>
  );
}

