import { useState, useMemo } from "react";
import { T } from "../../lib/tokens.js";
import { Modal, formStyles, Btn } from "../ui/Modal.jsx";
import { Icon } from "../ui/Icon.jsx";
import { COLOR_PALETTES } from "../../lib/dashboardDefaults.js";
import { BUILTIN_FIELDS, NUMERIC_TYPES, TEXT_TYPES, computeChartData } from "../../lib/dashboardMetrics.js";

// ─── CHART EDITOR MODAL ───────────────────────────────────────────────────────

const CHART_TYPES = [
  { value: "bar",     label: "Bar",            icon: "bar-chart-2" },
  { value: "hbar",    label: "Horiz. Bar",     icon: "layout"      },
  { value: "donut",   label: "Donut",          icon: "pie-chart"   },
  { value: "line",    label: "Line",           icon: "trending-up" },
  { value: "stacked", label: "Stacked Bar",    icon: "bar-chart-2" },
];

const AGGREGATIONS = [
  { value: "count", label: "Count"   },
  { value: "sum",   label: "Sum"     },
  { value: "avg",   label: "Average" },
  { value: "min",   label: "Min"     },
  { value: "max",   label: "Max"     },
];

const SORT_DIRS = [
  { value: "desc", label: "Highest first" },
  { value: "asc",  label: "Lowest first"  },
];

const FILTER_OPS = [
  { value: "eq",       label: "equals"       },
  { value: "neq",      label: "not equals"   },
  { value: "in",       label: "is one of"    },
  { value: "notin",    label: "is not one of"},
  { value: "gt",       label: "greater than" },
  { value: "lt",       label: "less than"    },
  { value: "contains", label: "contains"     },
];

const MAX_METRICS = 3;

export function ChartEditor({ config, enrichedOrders = [], availableFields = BUILTIN_FIELDS, onSave, onClose, onDelete, onDuplicate }) {
  const [draft, setDraft] = useState({ ...config, metrics: config.metrics.map(m => ({ ...m })) });
  const [showDelete, setShowDelete] = useState(false);

  function update(patch) { setDraft(d => ({ ...d, ...patch })); }

  function updateMetric(i, patch) {
    setDraft(d => {
      const metrics = d.metrics.map((m, idx) => idx === i ? { ...m, ...patch } : m);
      return { ...d, metrics };
    });
  }
  function addMetric() {
    setDraft(d => ({
      ...d,
      metrics: [...d.metrics, { field: null, aggregation: "count", label: `Series ${d.metrics.length + 1}`, color: null }],
    }));
  }
  function removeMetric(i) {
    setDraft(d => ({ ...d, metrics: d.metrics.filter((_, idx) => idx !== i) }));
  }
  function updateFilter(patch) {
    setDraft(d => ({ ...d, filter: d.filter ? { ...d.filter, ...patch } : { field: "", op: "eq", value: "", ...patch } }));
  }

  const numericFields = availableFields.filter(f => NUMERIC_TYPES.has(f.type));
  const textFields    = availableFields.filter(f => TEXT_TYPES.has(f.type));
  const allFields     = availableFields;

  // Live preview: show row count from computed data
  const previewInfo = useMemo(() => {
    if (!enrichedOrders.length) return "No data loaded";
    try {
      const data = computeChartData(enrichedOrders, draft);
      return `${data.length} ${data.length === 1 ? "category" : "categories"} found`;
    } catch {
      return "—";
    }
  }, [enrichedOrders, draft]);

  const paletteKeys = Object.keys(COLOR_PALETTES);
  const isDonut     = draft.type === "donut";
  const isStacked   = draft.type === "stacked";

  return (
    <Modal
      title="Edit Chart"
      subtitle={`Configuring: ${draft.title || "Untitled"}`}
      onClose={onClose}
      width={580}
      footer={
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 8 }}>
          {showDelete ? (
            <>
              <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginRight: 4 }}>Delete this chart?</span>
              <Btn variant="danger" onClick={onDelete}>Yes, Delete</Btn>
              <Btn variant="ghost"  onClick={() => setShowDelete(false)}>Cancel</Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" onClick={() => setShowDelete(true)} style={{ color: T.danger, borderColor: T.dangerFill }}>
                <Icon name="trash-2" size={13} color={T.danger} /> Delete
              </Btn>
              <Btn variant="ghost" onClick={onDuplicate}>
                <Icon name="copy" size={13} /> Duplicate
              </Btn>
            </>
          )}
          <span style={{ flex: 1 }} />
          <Btn variant="ghost"   onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => onSave(draft)}>Save Chart</Btn>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 8 }}>

        {/* Title */}
        <Field label="Chart Title">
          <input style={formStyles.input} value={draft.title} onChange={e => update({ title: e.target.value })} placeholder="Chart title" />
        </Field>

        {/* Chart type picker */}
        <Field label="Chart Type">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CHART_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => update({ type: ct.value })}
                style={{
                  padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${draft.type === ct.value ? T.brand : T.border}`,
                  background: draft.type === ct.value ? T.brandSubtle : T.bgApp,
                  color: draft.type === ct.value ? T.brand : T.textSec,
                  fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <Icon name={ct.icon} size={13} color={draft.type === ct.value ? T.brand : T.textSec} />
                {ct.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Group-by field */}
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Group / Category Field" style={{ flex: 1 }}>
            <select style={formStyles.select} value={draft.groupField || ""} onChange={e => update({ groupField: e.target.value })}>
              <option value="">— select field —</option>
              {allFields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </Field>

          {/* Stack field (stacked only) */}
          {isStacked && (
            <Field label="Stack By Field" style={{ flex: 1 }}>
              <select style={formStyles.select} value={draft.stackField || ""} onChange={e => update({ stackField: e.target.value || null })}>
                <option value="">— select field —</option>
                {textFields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </Field>
          )}
        </div>

        {/* Metrics */}
        <div>
          <label style={formStyles.label}>
            {isDonut ? "Value Metric" : `Metrics (up to ${MAX_METRICS})`}
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {draft.metrics.slice(0, isDonut ? 1 : MAX_METRICS).map((m, i) => (
              <MetricRow
                key={i}
                metric={m}
                index={i}
                numericFields={numericFields}
                onChange={patch => updateMetric(i, patch)}
                onRemove={draft.metrics.length > 1 ? () => removeMetric(i) : null}
              />
            ))}
          </div>
          {!isDonut && draft.metrics.length < MAX_METRICS && (
            <button
              onClick={addMetric}
              style={{
                marginTop: 8, padding: "6px 14px", borderRadius: 8,
                border: `1px dashed ${T.border}`, background: "transparent",
                color: T.brand, fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Icon name="plus" size={13} color={T.brand} /> Add Series
            </button>
          )}
        </div>

        {/* Filter condition */}
        <FilterRow
          filter={draft.filter}
          fields={allFields}
          onToggle={() => update({ filter: draft.filter ? null : { field: "", op: "eq", value: "" } })}
          onChange={updateFilter}
        />

        {/* Sort + Max categories */}
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Sort Order" style={{ flex: 1 }}>
            <select style={formStyles.select} value={draft.sortDir || "desc"} onChange={e => update({ sortDir: e.target.value })}>
              {SORT_DIRS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Max Categories" style={{ flex: 1 }}>
            <input
              style={{ ...formStyles.input, textAlign: "center" }}
              type="number" min={2} max={50}
              value={draft.maxCategories ?? ""}
              placeholder="All"
              onChange={e => update({ maxCategories: e.target.value ? parseInt(e.target.value) : null })}
            />
          </Field>
        </div>

        {/* Display options */}
        <div style={{ display: "flex", gap: 24 }}>
          <CheckField label="Show Legend"      checked={draft.showLegend}      onChange={v => update({ showLegend: v })} />
          <CheckField label="Show Axis Labels" checked={draft.showAxisLabels}  onChange={v => update({ showAxisLabels: v })} />
        </div>

        {/* Color palette */}
        <Field label="Color Palette">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {paletteKeys.map(pk => (
              <button
                key={pk}
                title={pk}
                onClick={() => update({ palette: pk })}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                  border: `2px solid ${draft.palette === pk ? T.brand : T.border}`,
                  background: draft.palette === pk ? T.brandSubtle : T.bgApp,
                }}
              >
                {COLOR_PALETTES[pk].slice(0, 5).map((c, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c, flexShrink: 0 }} />
                ))}
                <span style={{ fontSize: 11, color: draft.palette === pk ? T.brand : T.textSec, fontWeight: 600, marginLeft: 4 }}>{pk}</span>
              </button>
            ))}
          </div>
        </Field>

        {/* Live preview info */}
        <div style={{
          background: T.bgApp, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Icon name="info" size={15} color={T.brand} />
          <span style={{ fontSize: 12, color: T.textSec }}>
            <strong style={{ color: T.text }}>Preview: </strong>{previewInfo}
          </span>
        </div>

      </div>
    </Modal>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Field({ label, children, style = {} }) {
  return (
    <div style={style}>
      <label style={formStyles.label}>{label}</label>
      {children}
    </div>
  );
}

function CheckField({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: T.text, fontWeight: 500 }}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.brand }}
      />
      {label}
    </label>
  );
}

function MetricRow({ metric, index, numericFields, onChange, onRemove }) {
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-end",
      padding: "10px 12px",
      background: T.bgApp, borderRadius: 8,
      border: `1px solid ${T.border}`,
    }}>
      {/* Field */}
      <div style={{ flex: 2 }}>
        {index === 0 && <label style={{ ...formStyles.label, marginBottom: 4 }}>Field</label>}
        <select
          style={formStyles.select}
          value={metric.field || ""}
          onChange={e => onChange({ field: e.target.value || null })}
        >
          <option value="">Count records</option>
          {numericFields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
      </div>

      {/* Aggregation */}
      <div style={{ flex: 1 }}>
        {index === 0 && <label style={{ ...formStyles.label, marginBottom: 4 }}>Aggregation</label>}
        <select
          style={formStyles.select}
          value={metric.aggregation || "count"}
          onChange={e => onChange({ aggregation: e.target.value })}
          disabled={!metric.field}
        >
          {AGGREGATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>

      {/* Label */}
      <div style={{ flex: 1 }}>
        {index === 0 && <label style={{ ...formStyles.label, marginBottom: 4 }}>Label</label>}
        <input
          style={formStyles.input}
          value={metric.label || ""}
          onChange={e => onChange({ label: e.target.value })}
          placeholder="Series label"
        />
      </div>

      {/* Color */}
      <div style={{ flexShrink: 0 }}>
        {index === 0 && <label style={{ ...formStyles.label, marginBottom: 4 }}>Color</label>}
        <input
          type="color"
          value={metric.color || "#1B5FA8"}
          onChange={e => onChange({ color: e.target.value })}
          style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer", padding: 2 }}
        />
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            width: 32, height: 32, borderRadius: 6,
            border: `1px solid ${T.border}`,
            background: T.bgCard,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: T.danger, flexShrink: 0, padding: 0,
            alignSelf: "flex-end",
          }}
        >
          <Icon name="x" size={13} color={T.danger} />
        </button>
      )}
    </div>
  );
}

function FilterRow({ filter, fields, onToggle, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: filter ? 8 : 0 }}>
        <label style={formStyles.label}>Filter (optional)</label>
        <button
          onClick={onToggle}
          style={{
            marginBottom: 6, padding: "2px 10px", borderRadius: 20,
            border: `1px solid ${filter ? T.brand : T.border}`,
            background: filter ? T.brandSubtle : T.bgApp,
            color: filter ? T.brand : T.textSec,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          {filter ? "On" : "Off"}
        </button>
      </div>
      {filter && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            style={{ ...formStyles.select, flex: "1 1 150px" }}
            value={filter.field || ""}
            onChange={e => onChange({ field: e.target.value })}
          >
            <option value="">— field —</option>
            {fields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          <select
            style={{ ...formStyles.select, flex: "0 0 130px" }}
            value={filter.op || "eq"}
            onChange={e => onChange({ op: e.target.value })}
          >
            {FILTER_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            style={{ ...formStyles.input, flex: "1 1 120px" }}
            value={Array.isArray(filter.value) ? filter.value.join(", ") : (filter.value || "")}
            onChange={e => {
              const op  = filter.op || "eq";
              const raw = e.target.value;
              const v   = (op === "in" || op === "notin")
                ? raw.split(",").map(s => s.trim()).filter(Boolean)
                : raw;
              onChange({ value: v });
            }}
            placeholder={(filter.op === "in" || filter.op === "notin") ? "val1, val2, …" : "value"}
          />
        </div>
      )}
    </div>
  );
}
