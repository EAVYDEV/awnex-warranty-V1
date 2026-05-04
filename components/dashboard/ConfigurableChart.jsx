import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend, Tooltip,
} from "recharts";
import { T, STATUS_CFG, RISK_CFG } from "../../lib/tokens.js";
import { COLOR_PALETTES } from "../../lib/dashboardDefaults.js";
import { computeChartData, truncateLabel } from "../../lib/dashboardMetrics.js";
import { CustomTooltip } from "./ChartCard.jsx";

// ─── CONFIGURABLE CHART ───────────────────────────────────────────────────────
// Renders any chart type (bar, hbar, donut, line, stacked) from a config object.
// Handles label truncation, responsive sizing, and empty states.

// Semantic color overrides for status / risk group fields — use token dots so they theme correctly
const SEMANTIC_COLORS = {
  status: {
    active:   STATUS_CFG.active.dot,
    expiring: STATUS_CFG.expiring.dot,
    expired:  STATUS_CFG.expired.dot,
  },
  risk: {
    critical: RISK_CFG.critical.dot,
    high:     RISK_CFG.high.dot,
    medium:   RISK_CFG.medium.dot,
    low:      RISK_CFG.low.dot,
  },
};

function resolveColor(groupField, key, metricColor, palette, index) {
  if (metricColor) return metricColor;
  if (SEMANTIC_COLORS[groupField]?.[key]) return SEMANTIC_COLORS[groupField][key];
  return palette[index % palette.length];
}

// Custom tick that truncates long axis labels
function TruncatedTick({ x, y, payload, horizontal }) {
  const label = truncateLabel(String(payload?.value ?? ""), 15);
  if (horizontal) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-4} y={0} dy={4}
          textAnchor="end"
          fill={T.text2}
          fontSize={10}
        >
          {label}
        </text>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill={T.text2} fontSize={10}>
        {label}
      </text>
    </g>
  );
}

export function ConfigurableChart({ config, records }) {
  if (!config || !records) return null;

  const palette = COLOR_PALETTES[config.palette] || COLOR_PALETTES.default;
  const chartData = computeChartData(records, config);

  if (!chartData.length) {
    return (
      <div style={{
        height: 220, display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
        <span style={{ fontSize: 12, color: T.text3 }}>No data for current configuration</span>
      </div>
    );
  }

  const { type, groupField, metrics = [], showLegend, showAxisLabels, stackField } = config;
  const gk = groupField; // axis data key

  // ── DONUT ─────────────────────────────────────────────────────────────────
  if (type === "donut") {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="46%"
            innerRadius={55} outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey={gk}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={resolveColor(gk, entry[gk], metrics[0]?.color, palette, i)}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              iconSize={10}
              formatter={v => truncateLabel(String(v), 18)}
              wrapperStyle={{ fontSize: 11 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ── HORIZONTAL BAR ────────────────────────────────────────────────────────
  if (type === "hbar") {
    // Estimate left margin from longest label
    const longest = Math.max(...chartData.map(d => String(d[gk] ?? "").length));
    const labelW  = Math.min(Math.max(longest * 7, 60), 160);
    const activeMetrics = metrics.filter(m => m.label);

    return (
      <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 28 + 60)}>
        <BarChart
          data={chartData}
          layout="vertical"
          barSize={11}
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} horizontal={false} />
          <XAxis
            type="number"
            tick={showAxisLabels ? { fontSize: 10, fill: T.textSec } : false}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey={gk}
            width={labelW}
            tick={showAxisLabels ? <TruncatedTick horizontal /> : false}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
          {activeMetrics.map((m, i) => (
            <Bar
              key={i}
              dataKey={m.label}
              name={m.label}
              fill={resolveColor(gk, null, m.color, palette, i)}
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ── LINE ──────────────────────────────────────────────────────────────────
  if (type === "line") {
    const activeMetrics = metrics.filter(m => m.label);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
          <XAxis
            dataKey={gk}
            tick={showAxisLabels ? <TruncatedTick /> : false}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={showAxisLabels ? { fontSize: 10, fill: T.textSec } : false}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
          {activeMetrics.map((m, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={m.label}
              name={m.label}
              stroke={resolveColor(gk, null, m.color, palette, i)}
              dot={chartData.length < 20}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ── STACKED BAR ───────────────────────────────────────────────────────────
  if (type === "stacked") {
    const stackKeys = stackField
      ? [...new Set(chartData.flatMap(d => Object.keys(d).filter(k => k !== gk)))]
      : [];
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={18} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
          <XAxis
            dataKey={gk}
            tick={showAxisLabels ? <TruncatedTick /> : false}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={showAxisLabels ? { fontSize: 10, fill: T.textSec } : false}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
          {stackKeys.map((sk, i) => (
            <Bar
              key={sk}
              dataKey={sk}
              name={sk}
              stackId="a"
              fill={resolveColor(stackField, sk, null, palette, i)}
              radius={i === stackKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ── VERTICAL BAR (default) ────────────────────────────────────────────────
  const activeMetrics = metrics.filter(m => m.label);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        barGap={3}
        barSize={Math.max(8, Math.min(18, 80 / Math.max(chartData.length, 1)))}
        margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
        <XAxis
          dataKey={gk}
          tick={showAxisLabels ? <TruncatedTick /> : false}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tick={showAxisLabels ? { fontSize: 10, fill: T.textSec } : false}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
        {activeMetrics.map((m, i) => (
          <Bar
            key={i}
            dataKey={m.label}
            name={m.label}
            fill={resolveColor(gk, null, m.color, palette, i)}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
