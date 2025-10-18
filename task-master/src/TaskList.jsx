import React, { useEffect, useRef, useState } from 'react';
import { Task } from './Task';
import { Calendar } from './Calendar';
import { Timer } from './Timer';
import { AnalyticsPanel } from './AnalyticsPanel';
import './TaskList.css';

const STORAGE_KEY = 'task-master.tasks.v1';

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
function addDaysISO(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function TaskList() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [nextId, setNextId] = useState(() => {
    const max = tasks.reduce((m, t) => Math.max(m, Number(t.id) || 0), 0);
    return max + 1;
  });

  // --- Add form state ---
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newEst, setNewEst] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [nameError, setNameError] = useState(false);
  const nameRef = useRef(null);

  // --- Other UI state ---
  const [showCalendar, setShowCalendar] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const [showTimer, setShowTimer] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const dragIdRef = useRef(null);

  // Dynamic bottom padding so page content isn't hidden behind the open panel.
  const timePanelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(24);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  useEffect(() => {
    if (!showTimer || !timePanelRef.current) {
      setPanelHeight(24);
      return;
    }
    const el = timePanelRef.current;
    const update = () => setPanelHeight(el.getBoundingClientRect().height + 24);
    update();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(update) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', update);
    const onKey = (e) => { if (e.key === 'Escape') setShowTimer(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('keydown', onKey);
    };
  }, [showTimer]);

  function handleStatusChange(id, nextStatus) {
    setTasks(t => t.map(x => x.id === id ? { ...x, status: nextStatus } : x));
  }
  function handleDelete(id) {
    setTasks(t => t.filter(x => x.id !== id));
  }
  function handleUpdate(id, payload) {
    setTasks(t => t.map(x => x.id === id ? {
      ...x,
      name: payload.name,
      details: payload.details,
      status: payload.status,
      startDate: payload.startDate || x.startDate || '',
      dueDate: payload.dueDate || x.dueDate || '',
      estimatedMinutes: typeof payload.estimatedMinutes !== 'undefined' ? payload.estimatedMinutes : (x.estimatedMinutes || 0),
      completedAt: payload.completedAt !== undefined ? payload.completedAt : x.completedAt
    } : x));
  }

  function quickDue(kind) {
    if (kind === 'today') setNewDue(todayISO());
    if (kind === 'tomorrow') setNewDue(addDaysISO(1));
    if (kind === 'next7') setNewDue(addDaysISO(7));
    setShowAdvanced(true);
  }

  function handleAdd(e) {
    e && e.preventDefault();
    if (!newName.trim()) {
      setNameError(true);
      if (nameRef.current) nameRef.current.focus();
      return;
    }
    const t = {
      id: nextId,
      name: newName.trim(),
      status: 'todo',
      details: newDetails,
      startDate: newStart || '',
      dueDate: newDue || '',
      estimatedMinutes: Number(newEst) || 0,
      completedAt: null
    };
    setTasks(s => [t, ...s]);
    setNextId(n => n + 1);

    // reset fields but keep advanced panel open if it was open
    setNewName(''); setNewDetails(''); setNewStart(''); setNewDue(''); setNewEst(0);
    setNameError(false);
    if (nameRef.current) nameRef.current.focus();
  }

  function handleSelectActive(id) { setActiveTaskId(id); setShowTimer(true); }

  // Search + sorting
  function matchesSearch(task, query) {
    if (!query) return true;
    const s = query.toLowerCase().trim();
    // status:todo or s:todo
    const statusMatch = s.match(/^(?:status|s):\s*(\w+)$/);
    if (statusMatch) {
      return (task.status || '').toLowerCase().startsWith(statusMatch[1]);
    }
    // date tokens: due:YYYY-MM-DD or start:YYYY-MM-DD
    const dateMatch = s.match(/^(?:due|start):\s*(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      const field = s.startsWith('due:') ? 'dueDate' : 'startDate';
      return (task[field] || '') === dateMatch[1];
    }
    // generic search across name, details, status, start/due date
    return (
      (task.name || '').toLowerCase().includes(s) ||
      (task.details || '').toLowerCase().includes(s) ||
      (task.status || '').toLowerCase().includes(s) ||
      (task.dueDate || '').toLowerCase().includes(s) ||
      (task.startDate || '').toLowerCase().includes(s)
    );
  }

  const filtered = tasks.filter(t => matchesSearch(t, search));
  const filteredCount = filtered.length;

  function sortTasks(arr) {
    const copy = [...arr];
    if (sortBy === 'due') {
      copy.sort((a,b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });
    } else if (sortBy === 'estimated') {
      copy.sort((a,b) => (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0));
    }
    return copy;
  }

  const activeTasks = sortTasks(filtered.filter(t => t.status !== 'done'));
  const completedTasks = sortTasks(filtered.filter(t => t.status === 'done'));

  // DnD
  function handleDragStart(id) { dragIdRef.current = id; }
  function handleDragEnd() { dragIdRef.current = null; }
  function handleDrop(e, targetId) {
    e.preventDefault();
    let fromId = dragIdRef.current;
    if (fromId == null) {
      try { const dt = e.dataTransfer.getData('text/plain'); fromId = dt ? Number(dt) : null; } catch {}
    }
    const toId = targetId;
    dragIdRef.current = null;
    if (fromId == null || fromId === toId) return;
    setTasks(arr => {
      const items = [...arr];
      const fromIndex = items.findIndex(x => x.id === fromId);
      const toIndex = items.findIndex(x => x.id === toId);
      if (fromIndex === -1 || toIndex === -1) return items;
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return items;
    });
  }

  return (
    <div
      className="task-list"
      style={{ paddingBottom: showTimer ? panelHeight : 24 }}
    >
      {/* ---------- Add Task Card ---------- */}
      <form className="add-card" onSubmit={handleAdd}>
        <div className="add-row">
          <div className={`add-name ${nameError ? 'error' : ''}`}>
            <input
              ref={nameRef}
              value={newName}
              onChange={(e) => { setNewName(e.target.value); if (nameError) setNameError(false); }}
              placeholder="New task name"
              aria-label="New task name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showAdvanced) handleAdd(e);
              }}
            />
          </div>
          <div className="add-actions">
            <button type="button" className="btn-ghost" onClick={() => setShowAdvanced(s => !s)}>
              {showAdvanced ? 'Hide' : 'Advanced ▾'}
            </button>
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </div>

        {showAdvanced && (
          <div className="add-advanced">
            <div>
              <div className="field-label">Details</div>
              <textarea
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Details (optional). Tip: Ctrl/Cmd + Enter to add"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleAdd(e);
                }}
              />
            </div>

            <div>
              <div className="field-label">Start</div>
              <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
            </div>

            <div>
              <div className="field-label">Due</div>
              <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
            </div>

            <div>
              <div className="field-label">Estimated (min)</div>
              <input
                type="number"
                min="0"
                step="1"
                value={newEst}
                onChange={(e) => setNewEst(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="add-chips">
              <button type="button" className="chip" onClick={() => quickDue('today')}>Due: Today</button>
              <button type="button" className="chip" onClick={() => quickDue('tomorrow')}>Due: Tomorrow</button>
              <button type="button" className="chip" onClick={() => quickDue('next7')}>Due: +1 week</button>
            </div>
          </div>
        )}
      </form>

      {/* Calendar toggle + search/sort */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Search tasks (name, details, status:, due:, start:)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }}
          style={{ flex: '1 1 auto', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
        />
        <button type="button" className="btn-ghost" onClick={() => setSearch('')}>Clear</button>
        {search.trim() !== '' && (
          <div style={{ color: '#6b7280', fontSize: 13 }}>{filteredCount} result{filteredCount === 1 ? '' : 's'}</div>
        )}
        <button type="button" className="btn-ghost" onClick={() => setShowCalendar(s => !s)}>
          {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        </button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="default">Sort: Default</option>
          <option value="due">Sort: Due date</option>
          <option value="estimated">Sort: Estimated</option>
        </select>
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div style={{ marginBottom: 12 }}>
          <Calendar
            tasks={tasks}
            onTaskClick={(id) => {
              const el = document.getElementById(`task-row-${id}`);
              if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.click(); }
            }}
          />
        </div>
      )}

      {/* Task lists */}
      <div className="task-list-items">
        {tasks.length === 0 && (
          <div className="empty">No tasks yet — add one above.</div>
        )}

        {activeTasks.length > 0 && (
          <div>
            <h3>Active</h3>
            {activeTasks.map((t) => (
              <Task
                key={t.id}
                {...t}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onSelect={handleSelectActive}
              />
            ))}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <h3>Completed</h3>
            {completedTasks.map((t) => (
              <Task
                key={t.id}
                {...t}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onSelect={handleSelectActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom-sheet Time Manager (no backdrop; non-blocking) */}
      <div
        ref={timePanelRef}
        className={`time-manager ${showTimer ? 'open' : ''}`}
        aria-hidden={!showTimer}
      >
        <div className="tm-handle" />
        <div className="tm-header">
          <div className="tm-title">Time Manager</div>
          <div><button className="btn-ghost" onClick={() => setShowTimer(false)}>Close</button></div>
        </div>

        <div className="tm-controls-row">
          <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <div>Select active task:</div>
            <select
              value={activeTaskId || ''}
              onChange={(e) => setActiveTaskId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- none --</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.name} ({t.estimatedMinutes || 0}m)</option>)}
            </select>
          </label>
        </div>

        <Timer
          task={tasks.find(t => t.id === activeTaskId)}
          onComplete={(id) => { if (activeTaskId) handleStatusChange(activeTaskId, 'done'); }}
        />
      </div>

      {/* Quick toggles */}
      <button className="timer-fab" title="Open Time Manager" onClick={() => setShowTimer(s => !s)}>
        {showTimer ? '×' : '⏱'}
      </button>

      <button className="analytics-fab" title="Open Analytics" onClick={() => setShowAnalytics(s => !s)}>
        {showAnalytics ? '×' : '📊'}
      </button>
      <AnalyticsPanel tasks={tasks} open={showAnalytics} onClose={() => setShowAnalytics(false)} />
    </div>
  );
}
