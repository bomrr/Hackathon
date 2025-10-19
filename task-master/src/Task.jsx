import React, { useState, useRef, useEffect } from "react";
import "./Task.css";

// Props: id, name, status, details, startDate, dueDate, estimatedMinutes, completedAt
// onStatusChange(id, statusString)
// onDelete(id)
// onUpdate(id, { name, details, status, startDate, dueDate, estimatedMinutes, completedAt })
// onDrop(event, targetId)
// onDragStart(id)
// onDragEnd(id)
// onSelect(id)
export function Task({
  id,
  name: initialName = "",
  status: initialStatus = "todo",
  details = "",
  startDate = "",
  dueDate = "",
  estimatedMinutes = 0,
  completedAt = null,
  onStatusChange,
  onDelete,
  onUpdate,
  onDrop,
  onDragStart,
  onDragEnd,
  onSelect
}) {
  const [expanded, setExpanded] = useState(false);

  // header/summary state
  const [status, setStatus] = useState(initialStatus);

  // single edit state (header name + details panel)
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const [editDetails, setEditDetails] = useState(details);
  const [editStart, setEditStart] = useState(startDate || "");
  const [editDue, setEditDue] = useState(dueDate || "");
  const [editEstimated, setEditEstimated] = useState(estimatedMinutes || 0);

  // inline quick-edit for dates in header (disabled while full editing)
  const [editingStartInline, setEditingStartInline] = useState(false);
  const [editingDueInline, setEditingDueInline] = useState(false);

  const [selectOpen, setSelectOpen] = useState(false);
  const nameHeaderRef = useRef(null);

  // keep internal status in sync with parent
  useEffect(() => { setStatus(initialStatus); }, [initialStatus]);

  // keep edit buffers synced when props change and not currently editing
  useEffect(() => {
    if (!editing) {
      setEditName(initialName);
      setEditDetails(details);
      setEditStart(startDate || "");
      setEditDue(dueDate || "");
      setEditEstimated(estimatedMinutes || 0);
    }
  }, [initialName, details, startDate, dueDate, estimatedMinutes, editing]);

  const statuses = [
    { value: "todo", label: "Todo" },
    { value: "in progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  function handleStatusChange(e) {
    const next = e.target.value;
    setStatus(next);
    if (typeof onStatusChange === "function") onStatusChange(id, next);

    // keep completedAt in sync with Done
    if (typeof onUpdate === "function") {
      if (next === "done") {
        onUpdate(id, {
          name: editName || initialName,
          details: editDetails || details,
          status: next,
          startDate: editStart || startDate || "",
          dueDate: editDue || dueDate || "",
          estimatedMinutes: Number(editEstimated) || 0,
          completedAt: new Date().toISOString(),
        });
      } else {
        onUpdate(id, {
          name: editName || initialName,
          details: editDetails || details,
          status: next,
          startDate: editStart || startDate || "",
          dueDate: editDue || dueDate || "",
          estimatedMinutes: Number(editEstimated) || 0,
          completedAt: null,
        });
      }
    }
  }

  function toggleExpanded(e) {
    e?.stopPropagation();
    setExpanded((s) => !s);
  }

  function handleSave() {
    if (typeof onUpdate === "function") {
      onUpdate(id, {
        name: editName || initialName,
        details: editDetails || details,
        status,
        startDate: editStart || "",
        dueDate: editDue || "",
        estimatedMinutes: Number(editEstimated) || 0,
      });
    }
    setEditing(false);
  }

  function handleCancel() {
    // revert to last known props
    setEditName(initialName);
    setEditDetails(details);
    setEditStart(startDate || "");
    setEditDue(dueDate || "");
    setEditEstimated(estimatedMinutes || 0);
    setEditing(false);
  }

  function saveInlineDates() {
    if (editing) return; // guard: disabled while full editing
    if (typeof onUpdate === "function") {
      onUpdate(id, {
        name: initialName,
        details,
        status,
        startDate: editStart || "",
        dueDate: editDue || "",
        estimatedMinutes: Number(estimatedMinutes) || 0,
      });
    }
    setEditingStartInline(false);
    setEditingDueInline(false);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (typeof onDelete === "function") onDelete(id);
  }

  // --- Drag & drop feedback ---
  function handleDragStart(e) {
    const taskEl = e.currentTarget.closest(".task");
    try { e.dataTransfer.setData("text/plain", String(id)); } catch {}
    e.dataTransfer.effectAllowed = "move";
    taskEl?.classList.add("dragging");
    if (typeof onDragStart === "function") onDragStart(id);
  }
  function handleDropLocal(e) {
    e.preventDefault();
    if (typeof onDrop === "function") onDrop(e, id);
    const taskEl = e.currentTarget.closest(".task");
    taskEl?.classList.remove("dragging", "drag-over");
  }
  function handleDragEnd() {
    const taskEl = document.getElementById(`task-row-${id}`)?.closest(".task");
    taskEl?.classList.remove("dragging", "drag-over");
    if (typeof onDragEnd === "function") onDragEnd(id);
  }
  function handleDragEnter(e) {
    const taskEl = e.currentTarget.closest(".task");
    taskEl?.classList.add("drag-over");
  }
  function handleDragOver(e) {
    e.preventDefault();
    const taskEl = e.currentTarget.closest(".task");
    taskEl?.classList.add("drag-over");
  }
  function handleDragLeave(e) {
    const taskEl = e.currentTarget.closest(".task");
    if (!taskEl) return;
    const { clientX: x, clientY: y } = e;
    setTimeout(() => {
      const el = document.elementFromPoint(x, y);
      const parent = el ? el.closest(".task") : null;
      if (parent !== taskEl) taskEl.classList.remove("drag-over");
    }, 10);
  }

  return (
    <div
      id={`task-row-${id}`}
      className={
        "task status-" +
        status.replace(/\s+/g, "-") +
        (expanded ? " expanded" : "")
      }
      onClick={() => {
        setExpanded(true);
        if (typeof onSelect === "function") onSelect(id);
      }}
      role="group"
      aria-label={`task-${id}`}
      onDragOver={handleDragOver}
      onDrop={handleDropLocal}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      {/* Top row / summary */}
      <div className="task-row">
        <button
          className="task-drag-handle"
          aria-label="Drag to reorder"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          ≡
        </button>

        {/* INLINE NAME EDITOR (only editor for name) */}
        <div className="task-name">
          {!editing ? (
            <div
              title={initialName || "Untitled"}
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
                setExpanded(true);
                setTimeout(() => nameHeaderRef.current?.focus(), 0);
              }}
            >
              {initialName || "Untitled"}
            </div>
          ) : (
            <input
              ref={nameHeaderRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSave(); }
                if (e.key === "Escape") { e.preventDefault(); handleCancel(); }
              }}
              placeholder="Task name"
            />
          )}
        </div>

        <div className="task-dates-inline">
          {/* Inline quick-edit disabled in full editing */}
          {!editing && (
            <>
              {startDate ? (
                editingStartInline ? (
                  <input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    onBlur={saveInlineDates}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); saveInlineDates(); }
                      if (e.key === "Escape") { e.preventDefault(); setEditingStartInline(false); }
                    }}
                  />
                ) : (
                  <div
                    className="task-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStartInline(true);
                      setEditStart(startDate || "");
                    }}
                  >
                    {startDate}
                  </div>
                )
              ) : (
                <div
                  className="task-start muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStartInline(true);
                    setEditStart("");
                  }}
                >
                  Set start
                </div>
              )}

              {dueDate ? (
                editingDueInline ? (
                  <input
                    type="date"
                    value={editDue}
                    onChange={(e) => setEditDue(e.target.value)}
                    onBlur={saveInlineDates}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); saveInlineDates(); }
                      if (e.key === "Escape") { e.preventDefault(); setEditingDueInline(false); }
                    }}
                  />
                ) : (
                  <div
                    className="task-due"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDueInline(true);
                      setEditDue(dueDate || "");
                    }}
                  >
                    Due: {dueDate}
                  </div>
                )
              ) : (
                <div
                  className="task-due muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingDueInline(true);
                    setEditDue("");
                  }}
                >
                  Set due
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls on the right */}
        <div className="task-controls">
          <div
            className="task-estimated"
            title="Estimated minutes"
            onClick={(e) => { e.stopPropagation(); setEditing(true); setExpanded(true); }}
          >
            {(estimatedMinutes || 0) + "m"}
          </div>

          <div className={"task-select" + (selectOpen ? " open" : "")}>
            <select
              value={status}
              onChange={handleStatusChange}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setSelectOpen(true)}
              onBlur={() => setSelectOpen(false)}
              aria-label="Change task status"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="task-toggle"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls={`task-details-${id}`}
            title={expanded ? "Collapse" : "Expand"}
          >
            ▾
          </button>

          <button
            type="button"
            className="task-delete"
            onClick={handleDelete}
            aria-label="Delete task"
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded details panel */}
      {expanded && (
        <div
          id={`task-details-${id}`}
          className="task-details"
          onClick={(e) => e.stopPropagation()}
        >
          {!editing ? (
            <>
              <div className="details-section">
                <div className="section-title">Description</div>
                {details ? (
                  <div
                    className="task-description"
                    onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                  >
                    {details}
                  </div>
                ) : (
                  <div
                    className="task-description muted"
                    onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                  >
                    No details
                  </div>
                )}
              </div>

              <div className="details-section">
                <div className="section-title">Meta</div>
                <div className="meta-grid">
                  <div className="meta-item"><span>Start</span><strong>{startDate || "—"}</strong></div>
                  <div className="meta-item"><span>Due</span><strong>{dueDate || "—"}</strong></div>
                  <div className="meta-item"><span>Estimate</span><strong>{(estimatedMinutes || 0) + "m"}</strong></div>
                  {status === "done" && completedAt ? (
                    <div className="meta-item"><span>Completed</span><strong>{new Date(completedAt).toLocaleString()}</strong></div>
                  ) : null}
                </div>
              </div>

              <div className="actions-row">
                <button className="task-btn" onClick={() => setEditing(true)}>Edit</button>
              </div>
            </>
          ) : (
            <div className="task-edit">
              {/* Name field removed from details editor on purpose */}

              <label className="field">
                <div className="field-label">Details</div>
                <textarea
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSave(); }
                    if (e.key === "Escape") { e.preventDefault(); handleCancel(); }
                  }}
                  placeholder="Details (Ctrl/Cmd+Enter to save)"
                />
              </label>

              <div className="task-dates">
                <label>Start: <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} /></label>
                <label>Due: <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} /></label>
                <label>Est (min): <input type="number" min="0" value={editEstimated} onChange={(e) => setEditEstimated(e.target.value)} /></label>
              </div>

              <div className="task-edit-actions">
                <button className="task-btn primary" onClick={handleSave}>Save</button>
                <button className="task-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
