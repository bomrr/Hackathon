import React, { useState } from "react";
import "./Task.css";

export function Task({ id, name: initialName = "", status: initialStatus = "todo", details = "", onStatusChange }) {
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState(initialStatus);
    const [name] = useState(initialName);

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
            </div>

            {expanded && (
                <div id={`task-details-${id}`} className="task-details" onClick={(e) => e.stopPropagation()}>
                    {details ? <div className="task-description">{details}</div> : <div className="task-description muted">No details</div>}
                </div>
            )}
        </div>
    );
}