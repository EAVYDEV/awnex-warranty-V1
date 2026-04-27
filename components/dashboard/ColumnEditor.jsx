import { useState } from "react";
import { T } from "../../lib/tokens.js";
import { Modal, Btn, formStyles } from "../ui/Modal.jsx";

export function ColumnEditor({ columns, onSave, onClose }) {
  const [drafts, setDrafts] = useState(
    () => Object.fromEntries(columns.map(c => [c.id, c.title]))
  );

  const editable = columns.filter(c => c.renderAs !== "qbLink");

  function reset(id, defaultTitle) {
    setDrafts(d => ({ ...d, [id]: defaultTitle }));
  }

  function handleSave() {
    const customTitles = {};
    columns.forEach(c => {
      const draft = drafts[c.id] ?? c.defaultTitle;
      if (draft !== c.defaultTitle) customTitles[c.id] = draft;
    });
    onSave(customTitles);
  }

  return (
    <Modal
      title="Edit Column Titles"
      subtitle="Defaults come from Quickbase field labels. Changes are saved to this browser."
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: 8, marginBottom: 8 }}>
        <span style={formStyles.label}>Quickbase Label</span>
        <span style={formStyles.label}>Display Title</span>
        <span />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {editable.map(c => {
          const changed = (drafts[c.id] ?? c.defaultTitle) !== c.defaultTitle;
          return (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: 8, alignItems: "center" }}>
              <span
                style={{ fontSize: 12, color: T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={c.defaultTitle}
              >
                {c.defaultTitle}
              </span>
              <input
                value={drafts[c.id] ?? c.defaultTitle}
                onChange={e => setDrafts(d => ({ ...d, [c.id]: e.target.value }))}
                style={{
                  ...formStyles.input,
                  padding: "6px 10px",
                  borderRadius: 10,
                  borderColor: changed ? T.brand : T.borderLight,
                  outline: "none",
                }}
              />
              <button
                onClick={() => reset(c.id, c.defaultTitle)}
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
        })}
      </div>
    </Modal>
  );
}
