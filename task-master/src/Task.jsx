import React, { useState, useRef, useEffect } from "react";
import "./Task.css";

// Props: id, name, status, details,
// onStatusChange(id, statusString)
// onDelete(id)
// onUpdate(id, { name, details, status })
// onDrop(event, targetId) - called when a drop happens on this task
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
  const [status, setStatus] = useState(initialStatus);
  const name = initialName; // read directly from prop to avoid stale state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const [editDetails, setEditDetails] = useState(details);
  const [editStart, setEditStart] = useState(startDate || "");
  const [editDue, setEditDue] = useState(dueDate || "");
  const [editEstimated, setEditEstimated] = useState(estimatedMinutes || 0);
  const [editingStartInline, setEditingStartInline] = useState(false);
  const [editingDueInline, setEditingDueInline] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false); // for rotating chevron on the status dropdown
  const nameRef = useRef(null);

  // keep internal status in sync when parent updates (e.g., timer completion)
  useEffect(() => { setStatus(initialStatus); }, [initialStatus]);

  const statuses = [
    { value: "todo", label: "Todo" },
    { value: "in progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  function handleStatusChange(e) {
    const next = e.target.value;
    setStatus(next);
    if (typeof onStatusChange === "function") onStatusChange(id, next);
    // auto-set or clear completedAt when status toggles
    if (typeof onUpdate === 'function') {
      if (next === 'done') {
        onUpdate(id, {
          name: editName || name,
          details: editDetails || details,
          status: next,
          startDate: editStart || startDate || '',
          dueDate: editDue || dueDate || '',
          estimatedMinutes: Number(editEstimated) || 0,
          completedAt: new Date().toISOString()
        });
      } else {
        onUpdate(id, {
          name: editName || name,
          details: editDetails || details,
          status: next,
          startDate: editStart || startDate || '',
          dueDate: editDue || dueDate || '',
          estimatedMinutes: Number(editEstimated) || 0,
          completedAt: null
        });
      }
    }
  }

  function toggleExpanded(e) {
    if (e) e.stopPropagation();
    setExpanded((s) => !s);
  }

  useEffect(() => {
    if (editing && nameRef.current) {
      nameRef.current.focus();
      const v = nameRef.current.value;
      nameRef.current.value = '';
      nameRef.current.value = v;
    }
  }, [editing]);

  // click-outside to save changes when inline editing name/details
  useEffect(() => {
    function onDocClick(e) {
      if (!editing) return;
      const input = nameRef.current;
      if (!input) return;
      if (e.target === input || input.contains(e.target)) return;
      handleSave();
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [editing, editName, editDetails]);

  function handleSave() {
    if (typeof onUpdate === 'function') {
      onUpdate(id, {
        name: editName || name,
        details: editDetails || details,
        status,
        startDate: editStart || startDate || '',
        dueDate: editDue || dueDate || '',
        estimatedMinutes: Number(editEstimated) || 0
      });
    }
    setEditing(false);
  }

  function saveInlineDates() {
    if (typeof onUpdate === 'function') {
      onUpdate(id, {
        name: editName || name,
        details: editDetails || details,
        status,
        startDate: editStart || startDate || '',
        dueDate: editDue || dueDate || '',
        estimatedMinutes: Number(editEstimated) || 0
      });
    }
    setEditingStartInline(false);
    setEditingDueInline(false);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (typeof onDelete === 'function') onDelete(id);
  }

  function handleDragStart(e) {
    const taskEl = e.currentTarget.closest('.task');
    try {
      e.dataTransfer.setData('text/plain', String(id));
    } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
    if (taskEl) taskEl.classList.add('dragging');
    if (typeof onDragStart === 'function') onDragStart(id);
  }

  function handleDropLocal(e) {
    e.preventDefault();
    if (typeof onDrop === 'function') onDrop(e, id);
    const taskEl = e.currentTarget.closest('.task');
    if (taskEl) taskEl.classList.remove('dragging', 'drag-over');
  }

  function handleDragEnd(e) {
    const taskEl = e.currentTarget.closest('.task');
    if (taskEl) {
      taskEl.classList.remove('dragging', 'drag-over');
    }
    if (typeof onDragEnd === 'function') onDragEnd(id);
  }

  function handleDragEnter(e) {
    const taskEl = e.currentTarget.closest('.task');
    if (taskEl) taskEl.classList.add('drag-over');
  }

  function handleDragOver(e) {
    e.preventDefault();
    const taskEl = e.currentTarget.closest('.task');
    if (taskEl) taskEl.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    const taskEl = e.currentTarget.closest('.task');
    if (!taskEl) return;
    const x = e.clientX;
    const y = e.clientY;
    setTimeout(() => {
      const el = document.elementFromPoint(x, y);
      const parent = el ? el.closest('.task') : null;
      if (parent !== taskEl) {
        taskEl.classList.remove('drag-over');
      }
    }, 10);
  }

  return (
    <div
      id={`task-row-${id}`}
      className={"task status-" + status.replace(/\s+/g, '-') + (expanded ? " expanded" : "")}
      onClick={() => { setExpanded(true); if (typeof onSelect === 'function') onSelect(id); }}
      role="group"
      aria-label={`task-${id}`}
      onDragOver={handleDragOver}
      onDrop={handleDropLocal}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      <div className="task-row">
        <button
          className="task-drag-handle"
          aria-label="Drag to reorder"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >≡</button>

        <div className="task-name">
          {!editing ? (
            <div onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(name); setEditDetails(details); }}>
              {name || "Untitled"}
            </div>
          ) : (
            <input
              ref={nameRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                if (e.key === 'Escape') { setEditing(false); }
              }}
            />
          )}
        </div>

        <div className="task-dates-inline">
          {startDate ? (
            editingStartInline ? (
              <input
                type="date"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                onBlur={() => saveInlineDates()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); saveInlineDates(); }
                  if (e.key === 'Escape') { e.preventDefault(); setEditingStartInline(false); }
                }}
              />
            ) : (
              <div
                className="task-start"
                onClick={(e) => { e.stopPropagation(); setEditingStartInline(true); setEditStart(startDate || ''); }}
              >{startDate}</div>
            )
          ) : (
            <div
              className="task-start muted"
              onClick={(e) => { e.stopPropagation(); setEditingStartInline(true); setEditStart(''); }}
            >Set start</div>
          )}

          {dueDate ? (
            editingDueInline ? (
              <input
                type="date"
                value={editDue}
                onChange={(e) => setEditDue(e.target.value)}
                onBlur={() => saveInlineDates()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); saveInlineDates(); }
                  if (e.key === 'Escape') { e.preventDefault(); setEditingDueInline(false); }
                }}
              />
            ) : (
              <div
                className="task-due"
                onClick={(e) => { e.stopPropagation(); setEditingDueInline(true); setEditDue(dueDate || ''); }}
              >Due: {dueDate}</div>
            )
          ) : (
            <div
              className="task-due muted"
              onClick={(e) => { e.stopPropagation(); setEditingDueInline(true); setEditDue(''); }}
            >Set due</div>
          )}
        </div>

        {/* Controls cluster on the right */}
        <div className="task-controls">
          <div
            className="task-estimated"
            title="Estimated minutes"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {editEstimated}m
          </div>

          {/* Wrapped select so our chevron can rotate */}
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

      {expanded && (
        <div
          id={`task-details-${id}`}
          className="task-details"
          onClick={(e) => e.stopPropagation()}
        >
          {!editing ? (
            <>
              {details ? (
                <div
                  className="task-description"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                    setEditName(name);
                    setEditDetails(details);
                  }}
                >
                  {details}
                </div>
              ) : (
                <div
                  className="task-description muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                    setEditName(name);
                    setEditDetails(details);
                  }}
                >
                  No details
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <div className="muted">Estimated: {estimatedMinutes}m</div>
                {status === 'done' && completedAt ? (
                  <div className="muted">Completed: {new Date(completedAt).toLocaleString()}</div>
                ) : null}
              </div>
              <div className="task-actions">
                <button onClick={() => { setEditing(true); setEditName(name); setEditDetails(details); }}>Edit</button>
              </div>
            </>
          ) : (
            <div className="task-edit">
              <input
                ref={nameRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                  if (e.key === 'Escape') { setEditing(false); }
                }}
              />
              <textarea
                value={editDetails}
                onChange={(e) => setEditDetails(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setEditing(false); }
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); }
                }}
                placeholder="Details (Ctrl+Enter to save)"
              />
              <div className="task-dates">
                <label>Start: <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} /></label>
                <label>Due: <input type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} /></label>
                <label>Est (min): <input type="number" min="0" value={editEstimated} onChange={(e) => setEditEstimated(e.target.value)} /></label>
              </div>
              <div className="task-edit-actions">
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
