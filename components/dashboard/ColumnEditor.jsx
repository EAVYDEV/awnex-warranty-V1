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

// ─── ICONS ────────────────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" />
    </svg>
  );
}

function PinIcon({ filled }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z" />
    </svg>
  );
}

// ─── SORTABLE ROW ─────────────────────────────────────────────────────────────

function SortableRow({ col, draft, onChange, onReset, isSticky, onToggleSticky }) {
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
        gridTemplateColumns: "28px 1fr 1fr 32px 32px",
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

      {/* Pin (sticky) toggle */}
      <button
        onClick={onToggleSticky}
        title={isSticky ? "Unpin column" : "Pin column — stays visible when scrolling"}
        style={{
          width: 28, height: 28, borderRadius: 8,
          border: `1px solid ${isSticky ? T.brand : T.borderLight}`,
          background: isSticky ? T.brandSubtle : T.surface,
          color: isSticky ? T.brand : T.text3,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PinIcon filled={isSticky} />
      </button>
    </div>
  );
}

// ─── COLUMN EDITOR ────────────────────────────────────────────────────────────

export function ColumnEditor({ columns, onSave, onClose, stickyColumns = new Set() }) {
  const editable = columns.filter(c => c.renderAs !== "qbLink");

  const [order, setOrder] = useState(() => editable.map(c => c.id));
  const [drafts, setDrafts] = useState(
    () => Object.fromEntries(editable.map(c => [c.id, c.title]))
  );
  const [localSticky, setLocalSticky] = useState(() => new Set(stickyColumns));

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
    onSave(customTitles, order, localSticky);
  }

  function toggleSticky(id) {
    setLocalSticky(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const colById = Object.fromEntries(editable.map(c => [c.id, c]));
  const sorted  = order.map(id => colById[id]).filter(Boolean);

  return (
    <Modal
      title="Edit Columns"
      subtitle="Rename columns, drag to reorder, or pin columns to keep them visible while scrolling."
      onClose={onClose}
      width={560}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>Save</Btn>
        </>
      }
    >
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 32px 32px", gap: 8, marginBottom: 8 }}>
        <span />
        <span style={formStyles.label}>Quickbase Label</span>
        <span style={formStyles.label}>Display Title</span>
        <span />
        <span style={{ ...formStyles.label, textAlign: "center" }}>Pin</span>
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
                isSticky={localSticky.has(col.id)}
                onToggleSticky={() => toggleSticky(col.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Modal>
  );
}
