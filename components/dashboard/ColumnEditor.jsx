import { useState } from "react";
import {
  DndContext, closestCenter,
  PointerSensor, KeyboardSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { T } from "../../lib/tokens.js";
import { Modal, Btn, formStyles } from "../ui/Modal.jsx";

// ─── SORTABLE ROW ─────────────────────────────────────────────────────────────

function SortableRow({ col, draft, onChange, onReset }) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging,
  } = useSortable({ id: col.id });

  const changed = draft !== col.defaultTitle;

  return (
    <div
      ref={setNodeRef}
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr 1fr 32px",
        gap: 8,
        alignItems: "center",
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? T.brandSubtle : "transparent",
        borderRadius: 8,
        padding: "1px 0",
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        style={{
          width: 28, height: 28, border: "none", background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: isDragging ? "grabbing" : "grab",
          color: T.text3, padding: 0, borderRadius: 6, flexShrink: 0,
          touchAction: "none",
        }}
      >
        <GripIcon />
      </button>

      {/* QB label */}
      <span
        style={{ fontSize: 12, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        title={col.defaultTitle}
      >
        {col.defaultTitle}
      </span>

      {/* Editable title */}
      <input
        value={draft}
        onChange={e => onChange(e.target.value)}
        style={{
          ...formStyles.input,
          padding: "6px 10px",
          borderRadius: 10,
          borderColor: changed ? T.brand : T.borderLight,
          outline: "none",
        }}
      />

      {/* Reset button */}
      <button
        onClick={onReset}
        title="Reset to Quickbase label"
        disabled={!changed}
        style={{
          width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.borderLight}`,
          background: changed ? T.brandSubtle : T.surface,
          color: changed ? T.brand : T.text3,
          fontSize: 14, cursor: changed ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        ↺
      </button>
    </div>
  );
}

// 6-dot grip icon (2 × 3 dots via zero-length stroked paths)
function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" />
    </svg>
  );
}

// ─── COLUMN EDITOR ────────────────────────────────────────────────────────────

export function ColumnEditor({ columns, onSave, onClose }) {
  const editable = columns.filter(c => c.renderAs !== "qbLink");

  const [order, setOrder] = useState(() => editable.map(c => c.id));
  const [drafts, setDrafts] = useState(
    () => Object.fromEntries(editable.map(c => [c.id, c.title]))
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    setOrder(prev => {
      const oldIdx = prev.indexOf(active.id);
      const newIdx = prev.indexOf(over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function handleSave() {
    const customTitles = {};
    editable.forEach(c => {
      const draft = drafts[c.id] ?? c.defaultTitle;
      if (draft !== c.defaultTitle) customTitles[c.id] = draft;
    });
    onSave(customTitles, order);
  }

  // Build sorted column list from current order
  const colById  = Object.fromEntries(editable.map(c => [c.id, c]));
  const sorted   = order.map(id => colById[id]).filter(Boolean);

  return (
    <Modal
      title="Edit Column Titles"
      subtitle="Defaults come from Quickbase field labels. Drag rows to reorder. Changes are saved to this browser."
      onClose={onClose}
      width={520}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>Save</Btn>
        </>
      }
    >
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 32px", gap: 8, marginBottom: 8, paddingLeft: 0 }}>
        <span />
        <span style={formStyles.label}>Quickbase Label</span>
        <span style={formStyles.label}>Display Title</span>
        <span />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sorted.map(col => (
              <SortableRow
                key={col.id}
                col={col}
                draft={drafts[col.id] ?? col.defaultTitle}
                onChange={val => setDrafts(d => ({ ...d, [col.id]: val }))}
                onReset={() => setDrafts(d => ({ ...d, [col.id]: col.defaultTitle }))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Modal>
  );
}
