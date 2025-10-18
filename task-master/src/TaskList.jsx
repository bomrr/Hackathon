import React, { useEffect, useState, useRef } from 'react';
import { Task } from './Task';
import { Calendar } from './Calendar';
import './TaskList.css';

const STORAGE_KEY = 'task-master.tasks.v1';

export function TaskList() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return [
      { id: 1, name: 'Buy milk', status: 'todo', details: '2 liters, low-fat' }
    ];
  });

  const [nextId, setNextId] = useState(() => (tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1));
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newDue, setNewDue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const dragIdRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // ignore
    }
  }, [tasks]);

  function handleStatusChange(id, nextStatus) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)));
  }

  function handleDelete(id) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  function handleUpdate(id, payload) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, name: payload.name, details: payload.details, status: payload.status } : x)));
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const t = { id: nextId, name: newName.trim(), status: 'todo', details: newDetails, startDate: newStart || '', dueDate: newDue || '' };
    setTasks((s) => [t, ...s]);
    setNextId((n) => n + 1);
    setNewName('');
    setNewDetails('');
    setNewStart('');
    setNewDue('');
  }

  // Drag & drop handlers
  function handleDragStart(id) {
    dragIdRef.current = id;
  }

  function handleDragEnd(id) {
    dragIdRef.current = null;
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    let fromId = dragIdRef.current;
    // fallback to dataTransfer if available
    if (fromId == null) {
      try {
        const dt = e.dataTransfer.getData('text/plain');
        fromId = dt ? Number(dt) : null;
      } catch (err) {
        fromId = null;
      }
    }
    const toId = targetId;
    dragIdRef.current = null;
    if (fromId == null || fromId === toId) return;

    setTasks((arr) => {
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
    <div className="task-list">
      <form className="task-add" onSubmit={handleAdd}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New task name" />
        <input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="Details (optional)" />
        <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} title="Start date (optional)" />
        <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} title="Due date (optional)" />
        <button type="submit">Add</button>
        <button type="button" onClick={() => setShowCalendar(s => !s)}>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</button>
      </form>

      <div className="task-list-items">
        {showCalendar && <div style={{ marginBottom: 12 }}><Calendar tasks={tasks} onTaskClick={(id) => {
          const el = document.getElementById(`task-row-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // simulate click to expand
            el.click();
          }
        }} /></div>}
        {tasks.length === 0 && <div className="empty">No tasks yet — add one above.</div>}
        {tasks.map((t) => (
          <Task
            key={t.id}
            {...t}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onDragStart={(id) => handleDragStart(id)}
            onDragEnd={(id) => handleDragEnd(id)}
            onDrop={(e, id) => handleDrop(e, id)}
          />
        ))}
      </div>
    </div>
  );
}
