import { useState, useMemo } from "react";
import { T } from "../../lib/tokens.js";
import { Modal, formStyles, Btn } from "../ui/Modal.jsx";
import { Icon, ICON_NAMES } from "../ui/Icon.jsx";
import { KPI_THEMES } from "../../lib/dashboardDefaults.js";
import { BUILTIN_FIELDS, NUMERIC_TYPES, TEXT_TYPES, computeKpiValue, formatKpiValue } from "../../lib/dashboardMetrics.js";

// ─── KPI EDITOR MODAL ─────────────────────────────────────────────────────────
// Props:
//   config          – current KPI config object (draft copy passed in)
//   enrichedOrders  – live order data for the live-preview calculation
//   availableFields – merged builtin + QB report fields
//   onSave(config)  – called with updated config
//   onClose()
//   onDelete()
//   onDuplicate()

const AGGREGATIONS = [
  { value: "count", label: "Count records" },
  { value: "sum",   label: "Sum" },
  { value: "avg",   label: "Average" },
  { value: "min",   label: "Minimum" },
  { value: "max",   label: "Maximum" },
];

const FORMATS = [
  { value: "number",   label: "Number"   },
  { value: "currency", label: "Currency ($)" },
  { value: "percent",  label: "Percent (%)"  },
  { value: "text",     label: "Text"     },
];

const FILTER_OPS = [
  { value: "eq",         label: "equals"        },
  { value: "neq",        label: "not equals"    },
  { value: "in",         label: "is one of"     },
  { value: "notin",      label: "is not one of" },
  { value: "gt",         label: "greater than"  },
  { value: "gte",        label: "≥"             },
  { value: "lt",         label: "less than"     },
  { value: "lte",        label: "≤"             },
  { value: "contains",   label: "contains"      },
  { value: "isempty",    label: "is empty"      },
  { value: "isnotempty", label: "is not empty"  },
];

export function KpiEditor({ config, enrichedOrders = [], availableFields = BUILTIN_FIELDS, onSave, onClose, onDelete, onDuplicate }) {
  const [draft, setDraft] = useState({ ...config });
  const [showDelete, setShowDelete] = useState(false);

  function update(patch) {
    setDraft(d => ({ ...d, ...patch }));
  }
  function updateFilter(patch) {
    setDraft(d => ({ ...d, filter: d.filter ? { ...d.filter, ...patch } : { field: "", op: "eq", value: "", ...patch } }));
  }

  const numericFields = availableFields.filter(f => NUMERIC_TYPES.has(f.type));
  const allFields     = availableFields;
  const needsField    = draft.aggregation !== "count";

  // Live preview
  const previewValue = useMemo(() => {
    if (!enrichedOrders.length) return null;
    const v = computeKpiValue(enrichedOrders, draft);
    return formatKpiValue(v, draft.format, draft.decimals);
  }, [enrichedOrders, draft]);

  const themeKeys = Object.keys(KPI_THEMES);

  return (
    <Modal
      title="Edit KPI"
      subtitle={`Configuring: ${draft.title || "Untitled"}`}
      onClose={onClose}
      width={540}
      footer={
        <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 8 }}>
          {/* Destructive actions left-aligned */}
          {showDelete ? (
            <>
              <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginRight: 4 }}>Delete this KPI?</span>
              <Btn variant="danger" onClick={onDelete}>Yes, Delete</Btn>
              <Btn variant="ghost"  onClick={() => setShowDelete(false)}>Cancel</Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" onClick={() => setShowDelete(true)} style={{ color: T.danger, borderColor: T.dangerSubtle }}>
                <Icon name="trash-2" size={13} color={T.danger} /> Delete
              </Btn>
              <Btn variant="ghost" onClick={onDuplicate}>
                <Icon name="copy" size={13} /> Duplicate
              </Btn>
            </>
          )}
          <span style={{ flex: 1 }} />
          <Btn variant="ghost"   onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={() => onSave(draft)}>Save KPI</Btn>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 8 }}>

        {/* Title */}
        <Field label="Title">
          <input style={formStyles.input} value={draft.title} onChange={e => update({ title: e.target.value })} placeholder="KPI title" />
        </Field>

        {/* Aggregation + Field */}
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Aggregation" style={{ flex: 1 }}>
            <select style={formStyles.select} value={draft.aggregation} onChange={e => update({ aggregation: e.target.value, field: null })}>
              {AGGREGATIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>
          {needsField && (
            <Field label="Source Field" style={{ flex: 1 }}>
              <select style={formStyles.select} value={draft.field || ""} onChange={e => update({ field: e.target.value || null })}>
                <option value="">— select field —</option>
                {numericFields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </Field>
          )}
        </div>

        {/* Filter condition */}
        <FilterRow
          filter={draft.filter}
          fields={allFields}
          onToggle={() => update({ filter: draft.filter ? null : { field: "status", op: "eq", value: "active" } })}
          onChange={updateFilter}
        />

        {/* Subtitle */}
        <Field label="Subtitle / Helper Text">
          <input style={formStyles.input} value={draft.subtitle || ""} onChange={e => update({ subtitle: e.target.value })} placeholder="Optional description shown below the value" />
        </Field>

        {/* Format + Decimals */}
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Number Format" style={{ flex: 2 }}>
            <select style={formStyles.select} value={draft.format} onChange={e => update({ format: e.target.value })}>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </Field>
          <Field label="Decimals" style={{ flex: 1 }}>
            <input
              style={{ ...formStyles.input, textAlign: "center" }}
              type="number" min={0} max={4}
              value={draft.decimals ?? 0}
              onChange={e => update({ decimals: Math.max(0, Math.min(4, parseInt(e.target.value) || 0)) })}
            />
          </Field>
        </div>

        {/* Icon picker */}
        <Field label="Icon">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ICON_NAMES.map(name => (
              <button
                key={name}
                title={name}
                onClick={() => update({ icon: name })}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  border: `2px solid ${draft.icon === name ? T.brand : T.borderLight}`,
                  background: draft.icon === name ? T.brandSubtle : T.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: 0,
                }}
              >
                <Icon name={name} size={15} color={draft.icon === name ? T.brand : T.text2} />
              </button>
            ))}
          </div>
        </Field>

        {/* Color theme presets */}
        <Field label="Color Theme">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {themeKeys.map(key => {
              const th = KPI_THEMES[key];
              const active = draft.color === th.color && draft.bg === th.bg;
              return (
                <button
                  key={key}
                  title={key}
                  onClick={() => update({ color: th.color, bg: th.bg })}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: th.bg,
                    border: `2px solid ${active ? th.color : T.borderLight}`,
                    cursor: "pointer", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: th.color, display: "block" }} />
                </button>
              );
            })}
            {/* Custom color inputs */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
              <label style={{ fontSize: 11, color: T.text3 }}>Value</label>
              <input type="color" value={draft.color} onChange={e => update({ color: e.target.value })}
                style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.borderLight}`, cursor: "pointer", padding: 2 }} />
              <label style={{ fontSize: 11, color: T.text3 }}>BG</label>
              <input type="color" value={draft.bg} onChange={e => update({ bg: e.target.value })}
                style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.borderLight}`, cursor: "pointer", padding: 2 }} />
            </div>
          </div>
        </Field>

        {/* Live preview */}
        <div style={{
          background: T.bg, border: `1px solid ${T.borderLight}`,
          borderRadius: 8, padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Live Preview
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: draft.color || T.brand, lineHeight: 1 }}>
              {previewValue ?? (enrichedOrders.length ? "0" : "—")}
            </div>
            {draft.subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{draft.subtitle}</div>}
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: draft.bg || T.brandSubtle,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={draft.icon || "bar-chart-2"} size={18} color={draft.color || T.brand} />
          </div>
        </div>

      </div>
    </Modal>
  );
}

// ─── SHARED FORM HELPERS ──────────────────────────────────────────────────────

function Field({ label, children, style = {} }) {
  return (
    <div style={{ ...style }}>
      <label style={formStyles.label}>{label}</label>
      {children}
    </div>
  );
}

function FilterRow({ filter, fields, onToggle, onChange }) {
  const valueOps = new Set(["eq","neq","gt","gte","lt","lte","contains","in","notin"]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: filter ? 8 : 0 }}>
        <label style={formStyles.label} htmlFor="filter-toggle">Filter condition</label>
        <button
          id="filter-toggle"
          onClick={onToggle}
          style={{
            marginBottom: 6, padding: "2px 10px", borderRadius: 6,
            border: `1px solid ${filter ? T.brand : T.borderLight}`,
            background: filter ? T.brandSubtle : T.bg,
            color: filter ? T.brand : T.text2,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          {filter ? "On" : "Off"}
        </button>
      </div>
      {filter && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Field */}
          <select
            style={{ ...formStyles.select, flex: "1 1 160px" }}
            value={filter.field || ""}
            onChange={e => onChange({ field: e.target.value })}
          >
            <option value="">— field —</option>
            {fields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          {/* Operator */}
          <select
            style={{ ...formStyles.select, flex: "0 0 140px" }}
            value={filter.op || "eq"}
            onChange={e => onChange({ op: e.target.value })}
          >
            {FILTER_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Value (only shown for ops that need one) */}
          {valueOps.has(filter.op || "eq") && (
            <input
              style={{ ...formStyles.input, flex: "1 1 120px" }}
              value={Array.isArray(filter.value) ? filter.value.join(", ") : (filter.value || "")}
              onChange={e => {
                const raw = e.target.value;
                const op  = filter.op || "eq";
                const v   = (op === "in" || op === "notin")
                  ? raw.split(",").map(s => s.trim()).filter(Boolean)
                  : raw;
                onChange({ value: v });
              }}
              placeholder={(filter.op === "in" || filter.op === "notin") ? "val1, val2, …" : "value"}
            />
          )}
        </div>
      )}
      {filter && (
        <p style={formStyles.hint}>
          {(filter.op === "in" || filter.op === "notin")
            ? 'Comma-separate multiple values, e.g. "active, expiring"'
            : 'Case-insensitive match.'}
        </p>
      )}
    </div>
  );
}
