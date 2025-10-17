import React, { useState } from "react";
import "./Task.css";

export function Task({ id, name: initialName = "", status: initialStatus = "todo", details = "", onStatusChange }) {
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState(initialStatus);
    const [name] = useState(initialName);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(initialName);
    const [editDetails, setEditDetails] = useState(details);

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

    return (
        <div className={"task" + (expanded ? " expanded" : "")} onClick={() => setExpanded(true)} role="group" aria-label={`task-${id}`}>
            <div className="task-row">
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
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof onStatusChange === "function") {
                                // signal deletion with a special status
                                onStatusChange(id, "__delete__");
                            }
                        }}
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
                                    {details ? <div className="task-description">{details}</div> : <div className="task-description muted">No details</div>}
                                    <div className="task-actions">
                                        <button onClick={() => { setEditing(true); setEditName(name); setEditDetails(details); }}>Edit</button>
                                    </div>
                                </>
                            ) : (
                                <div className="task-edit">
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                                    <textarea value={editDetails} onChange={(e) => setEditDetails(e.target.value)} />
                                    <div className="task-edit-actions">
                                        <button onClick={() => {
                                            // save — signal via onStatusChange with special payload
                                            if (typeof onStatusChange === 'function') onStatusChange(id, { type: '__update__', name: editName, details: editDetails, status });
                                            setEditing(false);
                                        }}>Save</button>
                                        <button onClick={() => setEditing(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
        </div>
    );
}