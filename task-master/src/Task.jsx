import React, { useState, useRef, useEffect } from "react";
import "./Task.css";

// Props: id, name, status, details,
// onStatusChange(id, statusString)
// onDelete(id)
// onUpdate(id, { name, details, status })
// onDrop(event, targetId) - called when a drop happens on this task
export function Task({ id, name: initialName = "", status: initialStatus = "todo", details = "", onStatusChange, onDelete, onUpdate, onDrop }) {
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState(initialStatus);
    const [name] = useState(initialName);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(initialName);
    const [editDetails, setEditDetails] = useState(details);
    const nameRef = useRef(null);

    const statuses = [
        { value: "todo", label: "Todo" },
        { value: "in progress", label: "In Progress" },
        { value: "done", label: "Done" },
    ];

    function handleStatusChange(e) {
        const next = e.target.value;
        setStatus(next);
        if (typeof onStatusChange === "function") onStatusChange(id, next);
    }

    function toggleExpanded(e) {
        // allow callers (like the select) to stop propagation when needed
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

    function handleSave() {
        if (typeof onUpdate === 'function') {
            onUpdate(id, { name: editName, details: editDetails, status });
        }
        setEditing(false);
    }

    function handleDelete(e) {
        e.stopPropagation();
        if (typeof onDelete === 'function') onDelete(id);
    }

    function handleDragStart(e) {
        const taskEl = e.currentTarget.closest('.task');
        try {
            e.dataTransfer.setData('text/plain', String(id));
        } catch (err) {
            // older browsers may throw
        }
        e.dataTransfer.effectAllowed = 'move';
        // add dragging class to the task element for visual feedback
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

    function handleDragLeave(e) {
        const taskEl = e.currentTarget.closest('.task');
        if (taskEl) taskEl.classList.remove('drag-over');
    }

    return (
        <div
            className={"task" + (expanded ? " expanded" : "")}
            onClick={() => setExpanded(true)}
            role="group"
            aria-label={`task-${id}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropLocal}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
        >
            <div className="task-row">
                <button className="task-drag-handle" aria-label="Drag to reorder" draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd}>≡</button>

                <div className="task-name">{name || "Untitled"}</div>

                <select
                    className="task-status"
                    value={status}
                    onChange={handleStatusChange}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Change task status"
                >
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>

                    <button
                        type="button"
                        className="task-toggle"
                        onClick={toggleExpanded}
                        aria-expanded={expanded}
                        aria-controls={`task-details-${id}`}
                    >
                        {expanded ? "▴" : "▾"}
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

                    {expanded && (
                        <div id={`task-details-${id}`} className="task-details" onClick={(e) => e.stopPropagation()}>
                            {!editing ? (
                                <>
                                    {details ? (
                                        <div className="task-description" onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(name); setEditDetails(details); }}>{details}</div>
                                    ) : (
                                        <div className="task-description muted" onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(name); setEditDetails(details); }}>No details</div>
                                    )}
                                    <div className="task-actions">
                                        <button onClick={() => { setEditing(true); setEditName(name); setEditDetails(details); }}>Edit</button>
                                    </div>
                                </>
                            ) : (
                                <div className="task-edit">
                                    <input ref={nameRef} value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } if (e.key === 'Escape') { setEditing(false); } }} />
                                    <textarea value={editDetails} onChange={(e) => setEditDetails(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') { setEditing(false); } if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSave(); } }} placeholder="Details (Ctrl+Enter to save)" />
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